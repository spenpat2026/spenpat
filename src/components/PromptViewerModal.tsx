import React, { useState } from 'react';
import { Copy, Check, Terminal, Sparkles, BookOpen, Layers, Shield } from 'lucide-react';

interface PromptViewerProps {
  onClose?: () => void;
}

export const PromptViewerModal: React.FC<PromptViewerProps> = () => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const prompts = [
    {
      title: 'Prompt Utama: Sistem Presensi Guru SMPN 4 Tinggimoncong (Komprehensif)',
      desc: 'Prompt standar arsitektur lengkap untuk deploy di Google AI Studio / Web Platform.',
      content: `Buatkan aplikasi web Sistem Presensi Kehadiran Guru dan Tenaga Kependidikan (Tendik) UPT SPF SMP Negeri 4 Tinggimoncong, Dinas Pendidikan Kabupaten Gowa, Sulawesi Selatan dengan spesifikasi:

1. FITUR UTAMA:
- Lokasi Geofencing GPS: Koordinat SMPN 4 Tinggimoncong (Lat: -5.25750, Lng: 119.86520), radius validasi 150 meter dengan peta interaktif Leaflet/OpenStreetMap. Terdapat indikator jarak meter dan tombol uji simulasi lokasi sekolah.
- Verifikasi Foto Selfie Live (Kamera HP/Webcam): Pengambilan foto wajah dengan watermark otomatis berisi Nama Guru, Status Masuk/Pulang, Tanggal, Jam WITA, dan Tag GPS Terverifikasi.
- Presensi Masuk (07:00 - 07:30 WITA) & Terlambat (> 07:30 WITA) serta Presensi Pulang (14:30 WITA).
- Formulir Pengajuan Izin, Sakit, dan Dinas Luar (MGMP / Diklat) dengan status persetujuan Kepala Sekolah.

2. REKAPITULASI KEHADIRAN:
- Rekap Perorangan (Guru): Statistik total hadir, terlambat, izin, sakit, dinas luar, persentase kehadiran bulanan, riwayat harian lengkap foto selfie, serta fitur Cetak Slip Absensi Resmi.
- Rekap Bulanan (Admin & Kepala Sekolah): Matriks tabel kalender 1-31 hari format standar Dinas Pendidikan Kabupaten Gowa (Kode H, T, I, S, DL, A), persentase kehadiran per personil, filter status (PNS, PPPK, Honorer, Tendik), ekspor file Excel/CSV, dan fitur Cetak Format Laporan Resmi lengkap dengan Kop Surat Sekolah & Tanda Tangan Kepala Sekolah (Dra. Hj. Nurhidayah, M.Pd.) serta Operator Kepegawaian.

3. HAK AKSES & MULTI-AKUN (Semua Perangkat):
- Responsif untuk smartphone, tablet, laptop, dan desktop (Mobile-first).
- Selector Ganti Akun instan (Admin, Kepala Sekolah, Guru Mata Pelajaran, Tendik).
- Panel Admin untuk manajemen guru, ubah koordinat/radius GPS, serta verifikasi izin.`,
    },
    {
      title: 'Format SOP & Instruksi Operasional Presensi',
      desc: 'Panduan tata tertib kehadiran guru dan tenaga kependidikan sesuai pedoman Dinas Pendidikan.',
      content: `STANDAR OPERASIONAL PROSEDUR (SOP) PRESENSI ELEKTRONIK
UPT SPF SMP NEGERI 4 TINGGIMONCONG - KABUPATEN GOWA

1. JADWAL PRESENSI
- Jam Masuk Kerja: 07.00 - 07.30 WITA (Presensi Tepat Waktu)
- Jam Batas Toleransi: 07.31 - 08.00 WITA (Tercatat Terlambat)
- Jam Pulang Kerja: Mulai pukul 14.30 WITA (Senin - Kamis & Sabtu) / 11.30 WITA (Jumat)

2. SYARAT VALIDASI PRESENSI
- Berada di dalam radius maksimal 150 meter dari titik koordinat resmi SMPN 4 Tinggimoncong.
- Mengaktifkan izin Lokasi (GPS) dan Kamera pada perangkat (HP/Komputer).
- Foto selfie wajib memperlihatkan wajah yang jelas tanpa penutup wajah berlebihan.
- Bagi guru yang sakit atau dinas luar wajib mengisi formulir izin pada sistem disertai surat tugas atau surat dokter.

3. PELAPORAN
- Rekap bulanan diunduh dan ditandatangani oleh Kepala Sekolah setiap akhir bulan untuk kelengkapan administrasi pembayaran TPG (Tunjangan Profesi Guru) dan evaluasi kinerja kepegawaian.`,
    },
  ];

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2500);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-xl">
        <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono uppercase tracking-wider mb-2">
          <Terminal className="w-4 h-4" />
          <span>Prompt Engineering & SOP Dokumentasi</span>
        </div>
        <h2 className="text-xl font-bold tracking-tight">
          Prompt Presensi Guru SMPN 4 Tinggimoncong Dinas Pendidikan Kab. Gowa
        </h2>
        <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
          Berikut adalah salinan prompt teknis terstruktur serta naskah SOP resmi yang telah diimplementasikan penuh dalam aplikasi ini. Anda dapat menyalin teks ini untuk keperluan dokumentasi, pelaporan ke dinas, atau implementasi tambahan.
        </p>
      </div>

      <div className="space-y-4">
        {prompts.map((p, idx) => (
          <div
            key={idx}
            className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-3"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>{p.title}</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">{p.desc}</p>
              </div>

              <button
                type="button"
                onClick={() => handleCopy(p.content, idx)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  copiedIndex === idx
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {copiedIndex === idx ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Tersalin ke Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-slate-500" />
                    <span>Salin Teks Prompt</span>
                  </>
                )}
              </button>
            </div>

            <div className="bg-slate-900 text-slate-100 p-4 rounded-xl font-mono text-xs leading-relaxed overflow-x-auto whitespace-pre-wrap max-h-72 border border-slate-800">
              {p.content}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
