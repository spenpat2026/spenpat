import React, { useState, useEffect } from 'react';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Send,
  Building2,
  Calendar,
  LogOut,
  LogIn,
  ShieldCheck,
  User,
  Check,
  Sparkles,
} from 'lucide-react';
import { Teacher, SchoolSettings, AttendanceRecord, GeoLocationPoint, AttendanceStatus } from '../types';
import { AttendanceCamera } from './AttendanceCamera';
import { AttendanceMap } from './AttendanceMap';
import { formatDistance } from '../utils/geo';

interface AttendanceLiveProps {
  currentTeacher: Teacher;
  settings: SchoolSettings;
  records: AttendanceRecord[];
  onRecordSaved: (record: AttendanceRecord) => void;
  onNavigateToIndividualRecap: () => void;
}

export const AttendanceLive: React.FC<AttendanceLiveProps> = ({
  currentTeacher,
  settings,
  records,
  onRecordSaved,
  onNavigateToIndividualRecap,
}) => {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState<'hadir' | 'izin'>('hadir');
  const [photoData, setPhotoData] = useState<string | null>(null);
  const [currentLocation, setCurrentLocation] = useState<GeoLocationPoint | null>(null);
  const [notes, setNotes] = useState('');
  const [permitType, setPermitType] = useState<'IZIN' | 'SAKIT' | 'DINAS_LUAR'>('IZIN');
  const [permitReason, setPermitReason] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Live Clock (WITA)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const todayStr = currentTime.toISOString().split('T')[0];

  // Find today's record for this teacher
  const todayRecord = records.find(
    (r) => r.teacherId === currentTeacher.id && r.date === todayStr
  );

  const hasCheckedIn = Boolean(todayRecord && todayRecord.checkInTime);
  const hasCheckedOut = Boolean(todayRecord && todayRecord.checkOutTime);
  const isLeaveOrPermit = Boolean(
    todayRecord && ['IZIN', 'SAKIT', 'DINAS_LUAR'].includes(todayRecord.status)
  );

  // Time calculations
  const timeString = currentTime.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const fullDateString = currentTime.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  // Determine timeliness
  const isLate = () => {
    const [thHours, thMinutes] = settings.lateThresholdTime.split(':').map(Number);
    const nowHours = currentTime.getHours();
    const nowMinutes = currentTime.getMinutes();
    return nowHours > thHours || (nowHours === thHours && nowMinutes > thMinutes);
  };

  const handleSubmitAttendance = (isCheckOut: boolean) => {
    setErrorMessage(null);

    if (!photoData) {
      setErrorMessage('Wajib mengambil foto verifikasi wajah terlebih dahulu.');
      return;
    }

    if (!currentLocation) {
      setErrorMessage('Menunggu deteksi lokasi koordinat GPS.');
      return;
    }

    // Require within radius
    if (!currentLocation.isWithinRadius) {
      setErrorMessage(
        `Lokasi Anda berada di luar radius sekolah (${formatDistance(
          currentLocation.distanceMeters
        )}). Harap berada di lingkungan SMPN 4 Tinggimoncong atau aktifkan tombol "Di Lokasi Sekolah".`
      );
      return;
    }

    const currentFormattedTime = currentTime.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    if (isCheckOut) {
      // Absen Pulang
      if (!todayRecord) {
        setErrorMessage('Anda belum melakukan absensi masuk hari ini.');
        return;
      }

      const updatedRecord: AttendanceRecord = {
        ...todayRecord,
        checkOutTime: currentFormattedTime,
        checkOutPhoto: photoData,
        checkOutLocation: currentLocation,
        workMinutes: 480,
      };

      onRecordSaved(updatedRecord);
      setSuccessMessage('Presensi PULANG berhasil dicatat! Selamat beristirahat.');
      setPhotoData(null);
    } else {
      // Absen Datang
      const late = isLate();
      const status: AttendanceStatus = late ? 'TERLAMBAT' : 'HADIR';

      const newRecord: AttendanceRecord = {
        id: `att-${todayStr}-${currentTeacher.id}`,
        teacherId: currentTeacher.id,
        teacherName: currentTeacher.name,
        date: todayStr,
        checkInTime: currentFormattedTime,
        status,
        checkInPhoto: photoData,
        checkInLocation: currentLocation,
        notes: notes.trim() || (late ? 'Terlambat masuk kelas/sekolah' : 'Hadir tepat waktu'),
        approvalStatus: 'APPROVED',
      };

      onRecordSaved(newRecord);
      setSuccessMessage(
        `Presensi MASUK berhasil dicatat! Status: ${
          status === 'HADIR' ? 'Tepat Waktu' : 'Terlambat'
        }.`
      );
      setPhotoData(null);
      setNotes('');
    }

    setTimeout(() => {
      setSuccessMessage(null);
    }, 5000);
  };

  const handleSubmitPermit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!permitReason.trim()) {
      setErrorMessage('Harap isi alasan permohonan izin/sakit/dinas luar.');
      return;
    }

    const newRecord: AttendanceRecord = {
      id: `att-${todayStr}-${currentTeacher.id}`,
      teacherId: currentTeacher.id,
      teacherName: currentTeacher.name,
      date: todayStr,
      status: permitType,
      notes: permitReason.trim(),
      approvalStatus: 'PENDING',
    };

    onRecordSaved(newRecord);
    setSuccessMessage(`Permohonan ${permitType} berhasil diajukan untuk verifikasi Kepala Sekolah.`);
    setPermitReason('');

    setTimeout(() => {
      setSuccessMessage(null);
    }, 5000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Profile Overview */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 rounded-2xl p-4 sm:p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-emerald-500/10 blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3 sm:gap-4">
            <img
              src={currentTeacher.avatar}
              alt={currentTeacher.name}
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover border-2 border-emerald-400 shadow-md shrink-0"
            />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-emerald-500/20 text-emerald-300 text-[11px] px-2.5 py-0.5 rounded-full font-medium border border-emerald-500/30">
                  {currentTeacher.statusPegawai}
                </span>
                <span className="text-slate-300 text-xs">
                  NIP: {currentTeacher.nip}
                </span>
              </div>
              <h1 className="text-lg sm:text-xl font-bold tracking-tight mt-0.5">
                {currentTeacher.name}
              </h1>
              <p className="text-xs text-slate-300 flex items-center gap-1.5 mt-0.5">
                <Building2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>{currentTeacher.subject} • {settings.schoolName}</span>
              </p>
            </div>
          </div>

          {/* Clock Widget */}
          <div className="bg-slate-950/40 backdrop-blur-md rounded-xl p-3 sm:p-4 border border-white/10 flex flex-col items-start md:items-end shrink-0">
            <div className="flex items-center gap-2 text-xs text-emerald-300 font-medium">
              <Calendar className="w-3.5 h-3.5" />
              <span>{fullDateString}</span>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold font-mono tracking-tight text-white mt-1 flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-400 animate-pulse" />
              <span>{timeString}</span>
              <span className="text-xs font-sans font-normal text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                WITA
              </span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Batas Masuk: <span className="text-emerald-300 font-semibold">{settings.lateThresholdTime} WITA</span> • Pulang: <span className="text-emerald-300 font-semibold">{settings.workEndTime} WITA</span>
            </div>
          </div>
        </div>
      </div>

      {/* Alert notifications */}
      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl flex items-center gap-3 shadow-sm animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="text-sm font-medium">{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-900 rounded-xl flex items-center gap-3 shadow-sm animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span className="text-sm font-medium">{errorMessage}</span>
        </div>
      )}

      {/* Status Today Summary Card */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 w-full sm:w-auto">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
              hasCheckedOut
                ? 'bg-blue-100 text-blue-700'
                : hasCheckedIn
                ? 'bg-emerald-100 text-emerald-700'
                : isLeaveOrPermit
                ? 'bg-amber-100 text-amber-700'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            {hasCheckedOut ? (
              <Check className="w-6 h-6" />
            ) : hasCheckedIn ? (
              <LogIn className="w-6 h-6" />
            ) : isLeaveOrPermit ? (
              <FileText className="w-6 h-6" />
            ) : (
              <Clock className="w-6 h-6" />
            )}
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Status Kehadiran Hari Ini</div>
            <div className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              {hasCheckedOut ? (
                <span className="text-blue-700">Sudah Absen Pulang ({todayRecord?.checkOutTime} WITA)</span>
              ) : hasCheckedIn ? (
                <span className="text-emerald-700">
                  Sudah Absen Masuk ({todayRecord?.checkInTime} WITA - {todayRecord?.status})
                </span>
              ) : isLeaveOrPermit ? (
                <span className="text-amber-700">Permohonan {todayRecord?.status}</span>
              ) : (
                <span className="text-slate-600">Belum Melakukan Presensi</span>
              )}
            </div>
            {todayRecord?.notes && (
              <p className="text-xs text-slate-500 mt-0.5 italic">"{todayRecord.notes}"</p>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={onNavigateToIndividualRecap}
          className="w-full sm:w-auto px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 shrink-0"
        >
          <FileText className="w-4 h-4 text-slate-500" />
          <span>Lihat Riwayat & Rekap Perorangan</span>
        </button>
      </div>

      {/* Main Action Tabs: Hadir vs Izin */}
      <div className="flex border-b border-slate-200 gap-6">
        <button
          type="button"
          onClick={() => setActiveTab('hadir')}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 transition-colors relative ${
            activeTab === 'hadir'
              ? 'text-emerald-700 border-b-2 border-emerald-600'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Presensi Kamera & GPS</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('izin')}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 transition-colors relative ${
            activeTab === 'izin'
              ? 'text-emerald-700 border-b-2 border-emerald-600'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Ajukan Izin / Sakit / Dinas Luar</span>
        </button>
      </div>

      {activeTab === 'hadir' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Camera selfie capture */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <span>1. Ambil Foto Selfie Kehadiran</span>
                <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-normal">
                  Live Watermark
                </span>
              </h2>
              {hasCheckedIn && !hasCheckedOut && (
                <span className="text-xs bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full font-medium">
                  Mode: Absen Pulang
                </span>
              )}
            </div>

            <AttendanceCamera
              onCapture={(b64) => setPhotoData(b64)}
              teacherName={currentTeacher.name}
              isCheckOut={hasCheckedIn && !hasCheckedOut}
              schoolName={settings.schoolName}
            />

            {/* Note input */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Catatan / Keterangan Tugas Hari Ini (Opsional)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Contoh: Mengajar Matematika Kelas 8A & Pembina Pramuka"
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Right: GPS Geofence Map */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <span>2. Validasi Titik Lokasi GPS & Radius</span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-medium">
                Kec. Tinggimoncong
              </span>
            </h2>

            <AttendanceMap
              settings={settings}
              onLocationVerified={(loc) => setCurrentLocation(loc)}
            />

            {/* Action Buttons */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span>Status Validasi:</span>
                <span className="font-semibold text-slate-800">
                  {photoData && currentLocation?.isWithinRadius
                    ? 'Siap Melakukan Presensi'
                    : 'Lengkapi Foto & Pastikan Dalam Radius'}
                </span>
              </div>

              {!hasCheckedIn ? (
                <button
                  type="button"
                  onClick={() => handleSubmitAttendance(false)}
                  disabled={!photoData || !currentLocation?.isWithinRadius}
                  className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-700/20 transition-all flex items-center justify-center gap-2 active:scale-98"
                >
                  <LogIn className="w-5 h-5" />
                  <span>KIRIM PRESENSI MASUK ({isLate() ? 'TERLAMBAT' : 'TEPAT WAKTU'})</span>
                </button>
              ) : !hasCheckedOut ? (
                <button
                  type="button"
                  onClick={() => handleSubmitAttendance(true)}
                  disabled={!photoData || !currentLocation?.isWithinRadius}
                  className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-700/20 transition-all flex items-center justify-center gap-2 active:scale-98"
                >
                  <LogOut className="w-5 h-5" />
                  <span>KIRIM PRESENSI PULANG</span>
                </button>
              ) : (
                <div className="p-3 bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-xl text-center text-xs font-semibold">
                  ✓ Presensi Hari Ini Sudah Lengkap (Masuk & Pulang). Terima kasih atas dedikasi Anda!
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Leave / Permit Form */
        <div className="max-w-2xl bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Formulir Permohonan Izin / Sakit / Dinas Luar
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Data permohonan akan diteruskan kepada Kepala Sekolah untuk persetujuan resmi.
            </p>
          </div>

          <form onSubmit={handleSubmitPermit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Jenis Permohonan
              </label>
              <div className="grid grid-cols-3 gap-3">
                {(['IZIN', 'SAKIT', 'DINAS_LUAR'] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setPermitType(type)}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all ${
                      permitType === type
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-md'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {type === 'IZIN'
                      ? 'Izin'
                      : type === 'SAKIT'
                      ? 'Sakit'
                      : 'Dinas Luar'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Alasan / Uraian Kegiatan <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                required
                value={permitReason}
                onChange={(e) => setPermitReason(e.target.value)}
                placeholder="Jelaskan alasan izin, gejala sakit, atau surat tugas kedinasan..."
                className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-xs text-slate-500">
              <span className="font-semibold text-slate-700">Lampiran Bukti / Surat Tugas:</span>
              <p className="text-[11px] mt-0.5">
                Surat keterangan dokter atau surat perintah tugas Dinas Pendidikan Kab. Gowa dapat diserahkan ke Tata Usaha atau diarsipkan oleh Admin.
              </p>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Kirim Permohonan ke Kepala Sekolah</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
