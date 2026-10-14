import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { MapPin, Navigation, Compass, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';
import { calculateDistance, formatDistance } from '../utils/geo';
import { GeoLocationPoint, SchoolSettings } from '../types';

interface AttendanceMapProps {
  settings: SchoolSettings;
  onLocationVerified: (loc: GeoLocationPoint) => void;
}

export const AttendanceMap: React.FC<AttendanceMapProps> = ({
  settings,
  onLocationVerified,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const schoolCircleRef = useRef<L.Circle | null>(null);
  const schoolMarkerRef = useRef<L.Marker | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);

  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number }>({
    lat: settings.latitude + 0.0002, // Initial near school for smooth preview
    lng: settings.longitude + 0.0001,
  });

  const [isSimulated, setIsSimulated] = useState(true);
  const [isLocating, setIsLocating] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  // Compute metrics
  const distance = calculateDistance(
    userCoords.lat,
    userCoords.lng,
    settings.latitude,
    settings.longitude
  );
  const isWithinRadius = distance <= settings.radiusMeters;

  // Sync with parent
  useEffect(() => {
    onLocationVerified({
      lat: userCoords.lat,
      lng: userCoords.lng,
      distanceMeters: distance,
      isWithinRadius,
      address: isWithinRadius
        ? `Lingkungan Kampus ${settings.schoolName}, Kec. Tinggimoncong, Kab. Gowa`
        : `Luar Radius Sekolah (${formatDistance(distance)} dari pusat sekolah)`,
    });
  }, [userCoords, distance, isWithinRadius, settings.schoolName]);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Fix leaflet default icon
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      const map = L.map(mapContainerRef.current, {
        center: [settings.latitude, settings.longitude],
        zoom: 17,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors | Dinas Pendidikan Kab. Gowa',
        maxZoom: 19,
      }).addTo(map);

      // School marker
      const schoolIcon = L.divIcon({
        className: 'custom-school-icon',
        html: `
          <div style="background-color: #0284c7; color: white; border-radius: 50%; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3); border: 2px solid white;">
            🏫
          </div>
        `,
        iconSize: [34, 34],
        iconAnchor: [17, 17],
      });

      schoolMarkerRef.current = L.marker([settings.latitude, settings.longitude], {
        icon: schoolIcon,
      })
        .addTo(map)
        .bindPopup(`<b>${settings.schoolName}</b><br>Kec. Tinggimoncong, Kab. Gowa`);

      // Geofence Circle
      schoolCircleRef.current = L.circle([settings.latitude, settings.longitude], {
        radius: settings.radiusMeters,
        color: '#10b981',
        fillColor: '#10b981',
        fillOpacity: 0.15,
        weight: 2,
        dashArray: '4, 6',
      }).addTo(map);

      // User Marker
      const userIcon = L.divIcon({
        className: 'custom-user-icon',
        html: `
          <div style="background-color: #10b981; color: white; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 0 6px rgba(16, 185, 129, 0.35); border: 2px solid white;">
            📍
          </div>
        `,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
      });

      userMarkerRef.current = L.marker([userCoords.lat, userCoords.lng], {
        icon: userIcon,
        draggable: true,
      })
        .addTo(map)
        .bindPopup('Lokasi Anda Saat Ini');

      userMarkerRef.current.on('dragend', (e: any) => {
        const marker = e.target;
        const position = marker.getLatLng();
        setUserCoords({ lat: position.lat, lng: position.lng });
        setIsSimulated(true);
      });

      mapInstanceRef.current = map;
    }

    return () => {
      // Map stays mounted or handles unmount smoothly
    };
  }, [settings]);

  // Update markers when coords or radius change
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    if (schoolCircleRef.current) {
      schoolCircleRef.current.setRadius(settings.radiusMeters);
      schoolCircleRef.current.setStyle({
        color: isWithinRadius ? '#10b981' : '#ef4444',
        fillColor: isWithinRadius ? '#10b981' : '#ef4444',
      });
    }

    if (userMarkerRef.current) {
      userMarkerRef.current.setLatLng([userCoords.lat, userCoords.lng]);

      const userIcon = L.divIcon({
        className: 'custom-user-icon',
        html: `
          <div style="background-color: ${isWithinRadius ? '#10b981' : '#ef4444'}; color: white; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 0 6px ${isWithinRadius ? 'rgba(16, 185, 129, 0.35)' : 'rgba(239, 68, 68, 0.35)'}; border: 2px solid white; transition: all 0.3s;">
            📍
          </div>
        `,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
      });
      userMarkerRef.current.setIcon(userIcon);
    }
  }, [userCoords, isWithinRadius, settings.radiusMeters]);

  // Get live real GPS
  const requestRealGPS = () => {
    if (!navigator.geolocation) {
      setGpsError('Perangkat Anda tidak mendukung fitur Geolocation.');
      return;
    }
    setIsLocating(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        setIsSimulated(false);
        const { latitude, longitude } = pos.coords;
        setUserCoords({ lat: latitude, lng: longitude });

        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView([latitude, longitude], 17);
        }
      },
      (err) => {
        setIsLocating(false);
        console.warn('Geolocation error:', err);
        setGpsError('Gagal mendeteksi GPS otomatis. Anda dapat menggunakan mode "Di Sekolah" atau menggeser pin.');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const setSimulatedAtSchool = () => {
    setIsSimulated(true);
    setGpsError(null);
    // Slight jitter within 30m of school center
    const jitterLat = settings.latitude + (Math.random() - 0.5) * 0.0002;
    const jitterLng = settings.longitude + (Math.random() - 0.5) * 0.0002;
    setUserCoords({ lat: jitterLat, lng: jitterLng });

    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([settings.latitude, settings.longitude], 17);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col">
      {/* Header bar */}
      <div className="p-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-emerald-600" />
          <span className="font-semibold text-slate-800">Geofencing & Koordinat GPS Presensi</span>
          <span className="text-slate-500 text-[11px] hidden sm:inline">
            (Radius Maksimal: {settings.radiusMeters} meter)
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={setSimulatedAtSchool}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
              isSimulated
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
            title="Klik untuk simulasi presensi berada di lokasi SMPN 4 Tinggimoncong"
          >
            🏫 Di Lokasi Sekolah
          </button>

          <button
            type="button"
            onClick={requestRealGPS}
            disabled={isLocating}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
              !isSimulated
                ? 'bg-sky-100 text-sky-800 border border-sky-300'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
            title="Deteksi posisi GPS perangkat saya saat ini"
          >
            {isLocating ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-sky-600" />
            ) : (
              <Navigation className="w-3.5 h-3.5 text-sky-600" />
            )}
            <span>GPS Perangkat</span>
          </button>
        </div>
      </div>

      {/* Map display */}
      <div className="h-64 sm:h-72 w-full relative z-0">
        <div ref={mapContainerRef} className="w-full h-full" />
        {/* Floating status card on top of map */}
        <div className="absolute bottom-2 left-2 right-2 sm:right-auto sm:max-w-xs z-1000 bg-white/95 backdrop-blur-md p-2.5 rounded-xl border border-slate-200 shadow-md text-xs">
          <div className="flex items-start gap-2">
            {isWithinRadius ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            )}
            <div>
              <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                <span>{isWithinRadius ? 'Lokasi Terverifikasi' : 'Di Luar Radius Sekolah'}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-medium ${
                    isWithinRadius ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                  }`}
                >
                  {formatDistance(distance)}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                {isWithinRadius
                  ? `Jarak ${distance}m dari pusat sekolah (Batas radius ${settings.radiusMeters}m).`
                  : `Anda berjarak ${distance}m. Harap berada di kawasan sekolah atau gunakan tombol "Di Lokasi Sekolah" untuk uji coba.`}
              </p>
            </div>
          </div>
        </div>
      </div>

      {gpsError && (
        <div className="p-2 bg-amber-50 text-amber-800 text-[11px] border-t border-amber-200 px-3 flex items-center justify-between">
          <span>{gpsError}</span>
          <button
            type="button"
            onClick={setSimulatedAtSchool}
            className="text-amber-900 font-bold underline ml-2 shrink-0"
          >
            Aktifkan Simulasi Sekolah
          </button>
        </div>
      )}

      {/* Footer info */}
      <div className="p-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
        <div className="flex items-center gap-1.5 truncate">
          <Compass className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="font-mono truncate">
            {userCoords.lat.toFixed(6)}, {userCoords.lng.toFixed(6)}
          </span>
        </div>
        <span className="text-[10px] text-slate-400">
          Geser pin pada peta untuk menyesuaikan titik
        </span>
      </div>
    </div>
  );
};
