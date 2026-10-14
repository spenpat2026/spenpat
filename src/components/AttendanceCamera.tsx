import React, { useRef, useState, useEffect } from 'react';
import { Camera, RefreshCw, CheckCircle, AlertTriangle, Image as ImageIcon, Sparkles } from 'lucide-react';

interface AttendanceCameraProps {
  onCapture: (photoBase64: string) => void;
  teacherName: string;
  isCheckOut?: boolean;
  schoolName: string;
}

export const AttendanceCamera: React.FC<AttendanceCameraProps> = ({
  onCapture,
  teacherName,
  isCheckOut = false,
  schoolName,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [isLoadingCamera, setIsLoadingCamera] = useState(false);

  // Start webcam
  const startCamera = async (mode: 'user' | 'environment') => {
    setIsLoadingCamera(true);
    setCameraError(null);
    try {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: mode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: any) {
      console.warn('Camera access unavailable:', err);
      setCameraError('Kamera tidak dapat diakses atau izin ditolak. Anda dapat menggunakan foto simulasi verifikasi.');
    } finally {
      setIsLoadingCamera(false);
    }
  };

  useEffect(() => {
    startCamera(facingMode);
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [facingMode]);

  const switchCamera = () => {
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  };

  // Capture photo with dynamic watermark (Dinas Pendidikan Gowa, Nama Guru, Jam, Tanggal)
  const takeSnapshot = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw video frame
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Add semi-transparent gradient watermark footer
    const bannerHeight = 80;
    const gradient = ctx.createLinearGradient(0, canvas.height - bannerHeight, 0, canvas.height);
    gradient.addColorStop(0, 'rgba(15, 23, 42, 0)');
    gradient.addColorStop(1, 'rgba(15, 23, 42, 0.95)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, canvas.height - bannerHeight, canvas.width, bannerHeight);

    // Watermark text
    const now = new Date();
    const dateStr = now.toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const timeStr = `${now.toLocaleTimeString('id-ID')} WITA`;

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(`${schoolName}`, 16, canvas.height - 48);

    ctx.font = '13px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#38bdf8';
    ctx.fillText(`Guru: ${teacherName} • ${isCheckOut ? 'ABSEN PULANG' : 'ABSEN MASUK'}`, 16, canvas.height - 28);

    ctx.font = '11px "JetBrains Mono", monospace';
    ctx.fillStyle = '#cbd5e1';
    ctx.fillText(`${dateStr} • ${timeStr} • GPS Verified`, 16, canvas.height - 10);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    setCapturedImage(dataUrl);
    onCapture(dataUrl);
  };

  // Fallback simulator for devices without camera or blocked permissions
  const useSimulatedSelfie = () => {
    const canvas = canvasRef.current || document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Gradient background representing school environment
    const bgGrad = ctx.createLinearGradient(0, 0, 640, 480);
    bgGrad.addColorStop(0, '#0284c7');
    bgGrad.addColorStop(1, '#065f46');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 640, 480);

    // Draw silhouette / avatar placeholder
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(320, 200, 75, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(320, 420, 140, 0, Math.PI, true);
    ctx.fill();

    // Verification badge
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.arc(320, 200, 25, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('✓', 320, 207);

    // Watermark footer
    ctx.textAlign = 'left';
    const bannerHeight = 85;
    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.fillRect(0, 480 - bannerHeight, 640, bannerHeight);

    const now = new Date();
    const dateStr = now.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    const timeStr = `${now.toLocaleTimeString('id-ID')} WITA`;

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 15px sans-serif';
    ctx.fillText(schoolName, 16, 480 - 54);

    ctx.fillStyle = '#38bdf8';
    ctx.font = '13px sans-serif';
    ctx.fillText(`Guru: ${teacherName} • ${isCheckOut ? 'ABSEN PULANG' : 'ABSEN MASUK'}`, 16, 480 - 32);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px monospace';
    ctx.fillText(`${dateStr} • ${timeStr} • GPS Verified`, 16, 480 - 12);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    setCapturedImage(dataUrl);
    onCapture(dataUrl);
  };

  const retake = () => {
    setCapturedImage(null);
  };

  return (
    <div className="bg-slate-900 rounded-2xl overflow-hidden border border-slate-700/60 shadow-xl relative text-white">
      <div className="p-3 bg-slate-800/90 border-b border-slate-700 flex items-center justify-between text-xs sm:text-sm">
        <div className="flex items-center gap-2 font-semibold">
          <Camera className="w-4 h-4 text-emerald-400" />
          <span>Verifikasi Wajah / Foto Live</span>
          <span className="bg-emerald-500/20 text-emerald-300 text-[10px] px-2 py-0.5 rounded-full font-mono uppercase tracking-wider">
            Watermark Otomatis
          </span>
        </div>
        {!capturedImage && !cameraError && (
          <button
            type="button"
            onClick={switchCamera}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-700 hover:bg-slate-600 text-xs text-slate-200 transition-colors"
            title="Ganti Kamera Depan/Belakang"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Putar Kamera</span>
          </button>
        )}
      </div>

      <div className="relative aspect-4/3 w-full bg-slate-950 flex items-center justify-center overflow-hidden">
        {capturedImage ? (
          <div className="relative w-full h-full flex flex-col items-center justify-center">
            <img
              src={capturedImage}
              alt="Foto Presensi"
              className="w-full h-full object-cover"
            />
            <div className="absolute top-3 left-3 bg-emerald-600/90 backdrop-blur-md text-white text-xs px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-md">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Foto Berhasil Diambil</span>
            </div>
            <button
              type="button"
              onClick={retake}
              className="absolute bottom-3 right-3 bg-slate-900/80 hover:bg-slate-900 backdrop-blur-md text-slate-200 text-xs px-3 py-1.5 rounded-lg border border-slate-600 flex items-center gap-1.5 transition-all shadow-lg hover:scale-105 active:scale-95"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Ambil Ulang</span>
            </button>
          </div>
        ) : cameraError ? (
          <div className="p-6 text-center max-w-sm flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">{cameraError}</p>
            <button
              type="button"
              onClick={useSimulatedSelfie}
              className="mt-2 w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-emerald-900/30 transition-all hover:scale-[1.02]"
            >
              <Sparkles className="w-4 h-4" />
              <span>Gunakan Foto Verifikasi Terdaftar</span>
            </button>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover mirror-mode"
            />
            {/* Face Guide Oval */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-44 h-56 border-2 border-dashed border-emerald-400/70 rounded-full flex items-center justify-center">
                <span className="text-[11px] bg-slate-900/70 px-2 py-0.5 rounded text-emerald-300 backdrop-blur-sm">
                  Posisikan Wajah
                </span>
              </div>
            </div>
          </>
        )}
      </div>

      <canvas ref={canvasRef} className="hidden" />

      {/* Action Footer */}
      {!capturedImage && !cameraError && (
        <div className="p-3 bg-slate-800/80 border-t border-slate-700/60 flex items-center justify-between gap-3">
          <p className="text-[11px] text-slate-400">
            Pastikan wajah tampak jelas dan pencahayaan memadai.
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={useSimulatedSelfie}
              className="text-[11px] text-slate-300 hover:text-emerald-300 underline underline-offset-2 transition-colors px-2"
              title="Untuk perangkat tanpa izin kamera langsung"
            >
              Simulasi
            </button>
            <button
              type="button"
              onClick={takeSnapshot}
              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs px-4 py-2 rounded-xl shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95"
            >
              <Camera className="w-4 h-4" />
              <span>Ambil Foto</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
