import React, { useState, useMemo } from 'react';
import {
  Printer,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  User,
  Search,
  MapPin,
  ChevronRight,
  ExternalLink,
  Award,
  X,
} from 'lucide-react';
import { AttendanceRecord, Teacher, SchoolSettings } from '../types';

interface IndividualRecapProps {
  currentTeacher: Teacher;
  allTeachers: Teacher[];
  records: AttendanceRecord[];
  settings: SchoolSettings;
  canSelectTeacher?: boolean;
}

export const IndividualRecap: React.FC<IndividualRecapProps> = ({
  currentTeacher,
  allTeachers,
  records,
  settings,
  canSelectTeacher = true,
}) => {
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>(currentTeacher.id);
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth()); // 0-indexed
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [previewPhoto, setPreviewPhoto] = useState<{ url: string; title: string } | null>(null);

  const activeTeacher = useMemo(() => {
    return allTeachers.find((t) => t.id === selectedTeacherId) || currentTeacher;
  }, [allTeachers, selectedTeacherId, currentTeacher]);

  // Filter records for this teacher and selected month/year
  const teacherRecords = useMemo(() => {
    return records
      .filter((r) => {
        if (r.teacherId !== activeTeacher.id) return false;
        const [y, m] = r.date.split('-').map(Number);
        return y === selectedYear && m === selectedMonth + 1;
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [records, activeTeacher.id, selectedMonth, selectedYear]);

  // Statistics
  const stats = useMemo(() => {
    let hadir = 0;
    let tepatWaktu = 0;
    let terlambat = 0;
    let izin = 0;
    let sakit = 0;
    let dinasLuar = 0;
    let alpha = 0;

    teacherRecords.forEach((r) => {
      if (r.status === 'HADIR') {
        hadir++;
        tepatWaktu++;
      } else if (r.status === 'TERLAMBAT') {
        hadir++;
        terlambat++;
      } else if (r.status === 'IZIN') {
        izin++;
      } else if (r.status === 'SAKIT') {
        sakit++;
      } else if (r.status === 'DINAS_LUAR') {
        dinasLuar++;
        hadir++;
      } else if (r.status === 'ALPHA') {
        alpha++;
      }
    });

    const totalRecordedDays = teacherRecords.length || 1;
    const percentage = Math.round((hadir / totalRecordedDays) * 100);

    return {
      totalRecordedDays,
      hadir,
      tepatWaktu,
      terlambat,
      izin,
      sakit,
      dinasLuar,
      alpha,
      percentage: Math.min(percentage, 100),
    };
  }, [teacherRecords]);

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
  ];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Filter Bar (Hidden on print) */}
      <div className="no-print bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {canSelectTeacher && (
            <div className="min-w-[220px]">
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                Pilih Guru / Pegawai
              </label>
              <select
                value={selectedTeacherId}
                onChange={(e) => setSelectedTeacherId(e.target.value)}
                className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {allTeachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.statusPegawai} - {t.subject})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              Bulan
            </label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="text-xs font-semibold px-3 py-2 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {monthNames.map((m, idx) => (
                <option key={m} value={idx}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              Tahun
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="text-xs font-semibold px-3 py-2 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {[2024, 2025, 2026, 2027].map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          type="button"
          onClick={handlePrint}
          className="self-end md:self-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95"
        >
          <Printer className="w-4 h-4" />
          <span>Cetak Slip Presensi Perorangan</span>
        </button>
      </div>

      {/* Official Printable Header (Visible on print & on screen) */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm print:border-none print:shadow-none print:p-0">
        <div className="border-b-2 border-slate-800 pb-4 mb-4 text-center">
          <p className="text-xs uppercase tracking-widest font-bold text-slate-700">
            Pemerintah Kabupaten Gowa • Dinas Pendidikan
          </p>
          <h2 className="text-base sm:text-lg font-black tracking-tight uppercase text-slate-900 mt-0.5">
            UPT SPF SMP NEGERI 4 TINGGIMONCONG
          </h2>
          <p className="text-[11px] text-slate-600">
            {settings.address} • NPSN: {settings.npsn}
          </p>
          <div className="inline-block mt-2 px-3 py-1 bg-slate-100 rounded-md text-xs font-bold text-slate-800 uppercase tracking-wide">
            Kartu Rekapitulasi Presensi Kehadiran Perorangan
          </div>
        </div>

        {/* Teacher Identity Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs mb-6">
          <div>
            <span className="text-slate-500 block text-[11px]">Nama Lengkap:</span>
            <span className="font-bold text-slate-900">{activeTeacher.name}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[11px]">NIP / NUPTK:</span>
            <span className="font-semibold text-slate-800 font-mono">
              {activeTeacher.nip !== '-' ? activeTeacher.nip : activeTeacher.nuptk || '-'}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block text-[11px]">Mata Pelajaran / Tugas:</span>
            <span className="font-semibold text-slate-800">{activeTeacher.subject}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[11px]">Periode Laporan:</span>
            <span className="font-bold text-emerald-700">
              {monthNames[selectedMonth]} {selectedYear}
            </span>
          </div>
        </div>

        {/* Metric Cards (No-print / nice screen layout) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 mb-6 no-print">
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
            <span className="text-[11px] text-emerald-800 font-medium">Hadir Tepat Waktu</span>
            <div className="text-xl font-bold text-emerald-700 mt-1">{stats.tepatWaktu}</div>
            <span className="text-[10px] text-emerald-600">Hari</span>
          </div>
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
            <span className="text-[11px] text-amber-800 font-medium">Terlambat</span>
            <div className="text-xl font-bold text-amber-700 mt-1">{stats.terlambat}</div>
            <span className="text-[10px] text-amber-600">Hari</span>
          </div>
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
            <span className="text-[11px] text-blue-800 font-medium">Izin</span>
            <div className="text-xl font-bold text-blue-700 mt-1">{stats.izin}</div>
            <span className="text-[10px] text-blue-600">Hari</span>
          </div>
          <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl">
            <span className="text-[11px] text-purple-800 font-medium">Sakit</span>
            <div className="text-xl font-bold text-purple-700 mt-1">{stats.sakit}</div>
            <span className="text-[10px] text-purple-600">Hari</span>
          </div>
          <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl">
            <span className="text-[11px] text-teal-800 font-medium">Dinas Luar</span>
            <div className="text-xl font-bold text-teal-700 mt-1">{stats.dinasLuar}</div>
            <span className="text-[10px] text-teal-600">Hari</span>
          </div>
          <div className="p-3 bg-slate-900 text-white rounded-xl flex flex-col justify-between">
            <span className="text-[11px] text-slate-300 font-medium">% Kehadiran</span>
            <div className="text-2xl font-black text-emerald-400 mt-1">{stats.percentage}%</div>
            <span className="text-[10px] text-slate-400">Total {stats.hadir} Hadir</span>
          </div>
        </div>

        {/* Detailed Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <th className="p-2.5 text-center w-10">No</th>
                <th className="p-2.5">Tanggal</th>
                <th className="p-2.5 text-center">Jam Masuk</th>
                <th className="p-2.5 text-center">Jam Pulang</th>
                <th className="p-2.5 text-center">Status</th>
                <th className="p-2.5">Foto Verifikasi</th>
                <th className="p-2.5">Lokasi & Catatan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {teacherRecords.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-slate-400">
                    Belum ada rekaman presensi pada periode bulan ini.
                  </td>
                </tr>
              ) : (
                teacherRecords.map((r, idx) => {
                  const dateObj = new Date(r.date);
                  const dayName = dateObj.toLocaleDateString('id-ID', { weekday: 'long' });
                  const dateStr = dateObj.toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  });

                  return (
                    <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-2.5 text-center text-slate-500 font-medium">
                        {idx + 1}
                      </td>
                      <td className="p-2.5 font-medium text-slate-900">
                        <div>{dayName}</div>
                        <div className="text-[11px] text-slate-500 font-normal">{dateStr}</div>
                      </td>
                      <td className="p-2.5 text-center font-mono font-semibold text-slate-800">
                        {r.checkInTime ? `${r.checkInTime} WITA` : '-'}
                      </td>
                      <td className="p-2.5 text-center font-mono font-semibold text-slate-800">
                        {r.checkOutTime ? `${r.checkOutTime} WITA` : '-'}
                      </td>
                      <td className="p-2.5 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            r.status === 'HADIR'
                              ? 'bg-emerald-100 text-emerald-800'
                              : r.status === 'TERLAMBAT'
                              ? 'bg-amber-100 text-amber-800'
                              : r.status === 'IZIN'
                              ? 'bg-blue-100 text-blue-800'
                              : r.status === 'SAKIT'
                              ? 'bg-purple-100 text-purple-800'
                              : r.status === 'DINAS_LUAR'
                              ? 'bg-teal-100 text-teal-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {r.status}
                        </span>
                      </td>
                      <td className="p-2.5">
                        <div className="flex items-center gap-2">
                          {r.checkInPhoto && (
                            <button
                              type="button"
                              onClick={() =>
                                setPreviewPhoto({
                                  url: r.checkInPhoto!,
                                  title: `Foto Masuk - ${dateStr}`,
                                })
                              }
                              className="group relative"
                              title="Klik untuk perbesar foto"
                            >
                              <img
                                src={r.checkInPhoto}
                                alt="Foto Masuk"
                                className="w-8 h-8 rounded-lg object-cover border border-slate-300 group-hover:scale-110 transition-transform shadow-xs"
                              />
                            </button>
                          )}
                          {r.checkOutPhoto && (
                            <button
                              type="button"
                              onClick={() =>
                                setPreviewPhoto({
                                  url: r.checkOutPhoto!,
                                  title: `Foto Pulang - ${dateStr}`,
                                })
                              }
                              className="group relative"
                              title="Klik untuk perbesar foto"
                            >
                              <img
                                src={r.checkOutPhoto}
                                alt="Foto Pulang"
                                className="w-8 h-8 rounded-lg object-cover border border-blue-300 group-hover:scale-110 transition-transform shadow-xs"
                              />
                            </button>
                          )}
                          {!r.checkInPhoto && !r.checkOutPhoto && (
                            <span className="text-[11px] text-slate-400 italic">-</span>
                          )}
                        </div>
                      </td>
                      <td className="p-2.5 text-[11px] text-slate-600">
                        {r.checkInLocation && (
                          <div className="flex items-center gap-1 text-slate-700">
                            <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
                            <span>GPS: {r.checkInLocation.distanceMeters}m dari sekolah</span>
                          </div>
                        )}
                        {r.notes && <div className="text-slate-500 italic mt-0.5">{r.notes}</div>}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Print Signatures Block */}
        <div className="mt-8 pt-4 border-t border-slate-300 grid grid-cols-2 text-xs text-center">
          <div>
            <p className="text-slate-500">Mengetahui,</p>
            <p className="font-bold text-slate-800">Kepala SMPN 4 Tinggimoncong</p>
            <div className="h-16 flex items-end justify-center font-bold text-slate-900 underline">
              {settings.principalName}
            </div>
            <p className="text-[11px] text-slate-600 font-mono">NIP. {settings.principalNip}</p>
          </div>
          <div>
            <p className="text-slate-500">Tinggimoncong, {monthNames[selectedMonth]} {selectedYear}</p>
            <p className="font-bold text-slate-800">Guru / Pegawai Yang Bersangkutan</p>
            <div className="h-16 flex items-end justify-center font-bold text-slate-900 underline">
              {activeTeacher.name}
            </div>
            <p className="text-[11px] text-slate-600 font-mono">NIP. {activeTeacher.nip}</p>
          </div>
        </div>
      </div>

      {/* Image Preview Modal */}
      {previewPhoto && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 text-white rounded-2xl max-w-lg w-full overflow-hidden border border-slate-700 shadow-2xl animate-in zoom-in-95">
            <div className="p-3 bg-slate-800 flex items-center justify-between text-xs">
              <span className="font-semibold">{previewPhoto.title}</span>
              <button
                type="button"
                onClick={() => setPreviewPhoto(null)}
                className="p-1 rounded-lg hover:bg-slate-700 text-slate-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-2 flex items-center justify-center bg-black">
              <img
                src={previewPhoto.url}
                alt="Bukti Foto Presensi"
                className="max-h-[70vh] w-auto rounded-lg object-contain"
              />
            </div>
            <div className="p-3 text-[11px] text-slate-400 bg-slate-950 flex items-center justify-between">
              <span>SMPN 4 Tinggimoncong - Presensi Kehadiran Online</span>
              <button
                type="button"
                onClick={() => setPreviewPhoto(null)}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
