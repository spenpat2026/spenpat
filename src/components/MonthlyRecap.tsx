import React, { useState, useMemo } from 'react';
import {
  Printer,
  Download,
  Filter,
  Users,
  CheckCircle2,
  Calendar,
  Search,
  Sparkles,
} from 'lucide-react';
import { AttendanceRecord, Teacher, SchoolSettings, EmploymentStatus } from '../types';

interface MonthlyRecapProps {
  teachers: Teacher[];
  records: AttendanceRecord[];
  settings: SchoolSettings;
}

export const MonthlyRecap: React.FC<MonthlyRecapProps> = ({
  teachers,
  records,
  settings,
}) => {
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth()); // 0-indexed
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
  ];

  // Number of days in selected month
  const daysInMonth = useMemo(() => {
    return new Date(selectedYear, selectedMonth + 1, 0).getDate();
  }, [selectedYear, selectedMonth]);

  // Array of days [1, 2, ..., daysInMonth]
  const daysArray = useMemo(() => {
    return Array.from({ length: daysInMonth }, (_, i) => i + 1);
  }, [daysInMonth]);

  // Filter teachers
  const filteredTeachers = useMemo(() => {
    return teachers.filter((t) => {
      const matchStatus = statusFilter === 'ALL' || t.statusPegawai === statusFilter;
      const matchSearch =
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.nip.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.subject.toLowerCase().includes(searchQuery.toLowerCase());
      return matchStatus && matchSearch;
    });
  }, [teachers, statusFilter, searchQuery]);

  // Fast map lookup: recordsMap[teacherId][day] = record
  const recordsMap = useMemo(() => {
    const map: Record<string, Record<number, AttendanceRecord>> = {};

    records.forEach((r) => {
      const [y, m, d] = r.date.split('-').map(Number);
      if (y === selectedYear && m === selectedMonth + 1) {
        if (!map[r.teacherId]) {
          map[r.teacherId] = {};
        }
        map[r.teacherId][d] = r;
      }
    });

    return map;
  }, [records, selectedYear, selectedMonth]);

  // Compute school-wide monthly statistics
  const schoolStats = useMemo(() => {
    let totalHadir = 0;
    let totalTerlambat = 0;
    let totalIzin = 0;
    let totalSakit = 0;
    let totalDinasLuar = 0;
    let totalAlpha = 0;

    filteredTeachers.forEach((t) => {
      const tMap = recordsMap[t.id] || {};
      Object.values(tMap).forEach((r) => {
        if (r.status === 'HADIR') totalHadir++;
        else if (r.status === 'TERLAMBAT') {
          totalHadir++;
          totalTerlambat++;
        } else if (r.status === 'IZIN') totalIzin++;
        else if (r.status === 'SAKIT') totalSakit++;
        else if (r.status === 'DINAS_LUAR') {
          totalDinasLuar++;
          totalHadir++;
        } else if (r.status === 'ALPHA') totalAlpha++;
      });
    });

    return {
      totalHadir,
      totalTerlambat,
      totalIzin,
      totalSakit,
      totalDinasLuar,
      totalAlpha,
    };
  }, [filteredTeachers, recordsMap]);

  // Export to CSV formatted for Excel
  const handleExportCSV = () => {
    const headers = [
      'No',
      'Nama Guru/Pegawai',
      'NIP/NUPTK',
      'Status Pegawai',
      'Mata Pelajaran/Tugas',
      ...daysArray.map((d) => `Tgl ${d}`),
      'Hadir (H)',
      'Terlambat (T)',
      'Izin (I)',
      'Sakit (S)',
      'Dinas Luar (DL)',
      'Alpha (A)',
      '% Kehadiran',
    ];

    const rows = filteredTeachers.map((t, idx) => {
      const tMap = recordsMap[t.id] || {};
      let h = 0;
      let terlambat = 0;
      let i = 0;
      let s = 0;
      let dl = 0;
      let a = 0;

      const dailyStatuses = daysArray.map((day) => {
        const dateObj = new Date(selectedYear, selectedMonth, day);
        const isSunday = dateObj.getDay() === 0;
        if (isSunday) return 'L';

        const rec = tMap[day];
        if (!rec) return '-';
        if (rec.status === 'HADIR') {
          h++;
          return 'H';
        }
        if (rec.status === 'TERLAMBAT') {
          h++;
          terlambat++;
          return 'T';
        }
        if (rec.status === 'IZIN') {
          i++;
          return 'I';
        }
        if (rec.status === 'SAKIT') {
          s++;
          return 'S';
        }
        if (rec.status === 'DINAS_LUAR') {
          h++;
          dl++;
          return 'DL';
        }
        if (rec.status === 'ALPHA') {
          a++;
          return 'A';
        }
        return '-';
      });

      const totalRecorded = h + i + s + a || 1;
      const pct = Math.round((h / totalRecorded) * 100);

      return [
        idx + 1,
        `"${t.name}"`,
        `'${t.nip !== '-' ? t.nip : t.nuptk || '-'}`,
        `"${t.statusPegawai}"`,
        `"${t.subject}"`,
        ...dailyStatuses,
        h,
        terlambat,
        i,
        s,
        dl,
        a,
        `${pct}%`,
      ];
    });

    const csvContent =
      '\uFEFF' +
      [
        `"LAPORAN REKAPITULASI PRESENSI BULANAN GURU & TENAGA KEPENDIDIKAN"`,
        `"UPT SPF SMP NEGERI 4 TINGGIMONCONG - DINAS PENDIDIKAN KABUPATEN GOWA"`,
        `"Periode: ${monthNames[selectedMonth]} ${selectedYear}"`,
        '',
        headers.join(','),
        ...rows.map((r) => r.join(',')),
      ].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute(
      'download',
      `Rekap_Presensi_SMPN4_Tinggimoncong_${monthNames[selectedMonth]}_${selectedYear}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Controls Bar (No-Print) */}
      <div className="no-print bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-sm flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
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

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              Status Pegawai
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs font-semibold px-3 py-2 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="ALL">Semua Kategori ({teachers.length})</option>
              <option value="PNS">PNS</option>
              <option value="PPPK">PPPK</option>
              <option value="Guru Honorer">Guru Honorer</option>
              <option value="Tendik">Tenaga Kependidikan</option>
            </select>
          </div>

          <div className="min-w-[180px]">
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              Cari Nama / NIP
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ketik nama guru..."
                className="w-full text-xs pl-8 pr-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-end lg:self-auto">
          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-300 transition-all active:scale-95"
            title="Ekspor Laporan ke format Excel / CSV"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>Ekspor Excel</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Rekap Bulanan Dinas</span>
          </button>
        </div>
      </div>

      {/* Main Report Container */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm print:border-none print:shadow-none print:p-0">
        {/* Official Header */}
        <div className="border-b-2 border-slate-900 pb-3 mb-4 text-center">
          <p className="text-xs uppercase tracking-widest font-bold text-slate-700">
            Pemerintah Kabupaten Gowa • Dinas Pendidikan
          </p>
          <h1 className="text-lg sm:text-xl font-black uppercase text-slate-900 tracking-tight">
            UPT SPF SMP NEGERI 4 TINGGIMONCONG
          </h1>
          <p className="text-[11px] text-slate-600">
            {settings.address} • NPSN: {settings.npsn} • Kab. Gowa, Sulawesi Selatan
          </p>
          <div className="mt-2 text-xs font-extrabold uppercase text-slate-900 tracking-wider">
            DAFTAR HADIR & REKAPITULASI BULANAN GURU / TENAGA KEPENDIDIKAN
          </div>
          <p className="text-xs font-semibold text-emerald-800">
            Bulan: {monthNames[selectedMonth]} {selectedYear}
          </p>
        </div>

        {/* Legend / Keterangan Kode (No-print / print friendly) */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs mb-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-bold text-slate-700 text-[11px]">Keterangan:</span>
            <span className="flex items-center gap-1">
              <span className="w-4 h-4 rounded bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px]">
                H
              </span>
              <span className="text-[11px] text-slate-600">Hadir Tepat</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-4 h-4 rounded bg-amber-500 text-white flex items-center justify-center font-bold text-[10px]">
                T
              </span>
              <span className="text-[11px] text-slate-600">Terlambat</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-4 h-4 rounded bg-blue-500 text-white flex items-center justify-center font-bold text-[10px]">
                I
              </span>
              <span className="text-[11px] text-slate-600">Izin</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-4 h-4 rounded bg-purple-500 text-white flex items-center justify-center font-bold text-[10px]">
                S
              </span>
              <span className="text-[11px] text-slate-600">Sakit</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-4 h-4 rounded bg-teal-600 text-white flex items-center justify-center font-bold text-[10px]">
                DL
              </span>
              <span className="text-[11px] text-slate-600">Dinas Luar</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-4 h-4 rounded bg-rose-600 text-white flex items-center justify-center font-bold text-[10px]">
                A
              </span>
              <span className="text-[11px] text-slate-600">Alpha</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-4 h-4 rounded bg-slate-200 text-slate-500 flex items-center justify-center font-bold text-[10px]">
                L
              </span>
              <span className="text-[11px] text-slate-600">Libur</span>
            </span>
          </div>

          <div className="text-[11px] text-slate-500 font-medium">
            Total Personil: <span className="font-bold text-slate-800">{filteredTeachers.length} Orang</span>
          </div>
        </div>

        {/* Matrix Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-300">
          <table className="w-full text-center text-[11px] border-collapse">
            <thead>
              <tr className="bg-slate-200 text-slate-800 font-bold border-b border-slate-300">
                <th rowSpan={2} className="p-2 border-r border-slate-300 w-8">
                  No
                </th>
                <th rowSpan={2} className="p-2 border-r border-slate-300 text-left min-w-[170px]">
                  Nama Guru / NIP
                </th>
                <th rowSpan={2} className="p-2 border-r border-slate-300 text-left min-w-[120px]">
                  Mata Pelajaran
                </th>
                <th colSpan={daysInMonth} className="p-1 border-b border-slate-300">
                  Tanggal ({monthNames[selectedMonth]})
                </th>
                <th colSpan={6} className="p-1 border-b border-l border-slate-300">
                  Rekapitulasi
                </th>
                <th rowSpan={2} className="p-2 border-l border-slate-300 w-12">
                  % Hadir
                </th>
              </tr>
              <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300">
                {daysArray.map((day) => {
                  const dateObj = new Date(selectedYear, selectedMonth, day);
                  const isSunday = dateObj.getDay() === 0;
                  return (
                    <th
                      key={day}
                      className={`p-1 w-6 border-r border-slate-200 text-[10px] ${
                        isSunday ? 'bg-rose-100 text-rose-700' : ''
                      }`}
                    >
                      {day}
                    </th>
                  );
                })}
                <th className="p-1 w-6 border-l border-slate-300 text-emerald-700">H</th>
                <th className="p-1 w-6 border-slate-300 text-amber-700">T</th>
                <th className="p-1 w-6 border-slate-300 text-blue-700">I</th>
                <th className="p-1 w-6 border-slate-300 text-purple-700">S</th>
                <th className="p-1 w-6 border-slate-300 text-teal-700">DL</th>
                <th className="p-1 w-6 border-slate-300 text-rose-700">A</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredTeachers.map((t, idx) => {
                const tMap = recordsMap[t.id] || {};
                let hCount = 0;
                let tCount = 0;
                let iCount = 0;
                let sCount = 0;
                let dlCount = 0;
                let aCount = 0;

                return (
                  <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-1.5 border-r border-slate-200 font-mono text-slate-500">
                      {idx + 1}
                    </td>
                    <td className="p-1.5 border-r border-slate-200 text-left font-medium text-slate-900">
                      <div className="font-bold truncate max-w-[200px]">{t.name}</div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {t.nip !== '-' ? t.nip : t.statusPegawai}
                      </div>
                    </td>
                    <td className="p-1.5 border-r border-slate-200 text-left text-slate-700 truncate max-w-[130px]">
                      {t.subject}
                    </td>

                    {/* Day cells */}
                    {daysArray.map((day) => {
                      const dateObj = new Date(selectedYear, selectedMonth, day);
                      const isSunday = dateObj.getDay() === 0;

                      if (isSunday) {
                        return (
                          <td
                            key={day}
                            className="p-1 border-r border-slate-200 bg-slate-100 text-slate-400 font-mono text-[9px]"
                          >
                            -
                          </td>
                        );
                      }

                      const rec = tMap[day];
                      let cellText = '-';
                      let colorClass = 'text-slate-300';

                      if (rec) {
                        if (rec.status === 'HADIR') {
                          cellText = 'H';
                          colorClass = 'bg-emerald-100 text-emerald-800 font-bold';
                          hCount++;
                        } else if (rec.status === 'TERLAMBAT') {
                          cellText = 'T';
                          colorClass = 'bg-amber-100 text-amber-800 font-bold';
                          hCount++;
                          tCount++;
                        } else if (rec.status === 'IZIN') {
                          cellText = 'I';
                          colorClass = 'bg-blue-100 text-blue-800 font-bold';
                          iCount++;
                        } else if (rec.status === 'SAKIT') {
                          cellText = 'S';
                          colorClass = 'bg-purple-100 text-purple-800 font-bold';
                          sCount++;
                        } else if (rec.status === 'DINAS_LUAR') {
                          cellText = 'DL';
                          colorClass = 'bg-teal-100 text-teal-800 font-bold';
                          hCount++;
                          dlCount++;
                        } else if (rec.status === 'ALPHA') {
                          cellText = 'A';
                          colorClass = 'bg-rose-100 text-rose-800 font-bold';
                          aCount++;
                        }
                      }

                      return (
                        <td
                          key={day}
                          className={`p-1 border-r border-slate-200 text-[10px] ${colorClass}`}
                        >
                          {cellText}
                        </td>
                      );
                    })}

                    {/* Totals */}
                    <td className="p-1 border-l border-slate-200 font-bold text-emerald-700 bg-emerald-50/50">
                      {hCount}
                    </td>
                    <td className="p-1 border-slate-200 font-bold text-amber-700 bg-amber-50/50">
                      {tCount}
                    </td>
                    <td className="p-1 border-slate-200 font-bold text-blue-700 bg-blue-50/50">
                      {iCount}
                    </td>
                    <td className="p-1 border-slate-200 font-bold text-purple-700 bg-purple-50/50">
                      {sCount}
                    </td>
                    <td className="p-1 border-slate-200 font-bold text-teal-700 bg-teal-50/50">
                      {dlCount}
                    </td>
                    <td className="p-1 border-slate-200 font-bold text-rose-700 bg-rose-50/50">
                      {aCount}
                    </td>

                    {/* Percentage */}
                    <td className="p-1 border-l border-slate-200 font-mono font-bold text-slate-800">
                      {Math.round((hCount / (hCount + iCount + sCount + aCount || 1)) * 100)}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Official Signatures Footer */}
        <div className="mt-8 pt-6 border-t-2 border-slate-800 grid grid-cols-2 text-xs text-center">
          <div>
            <p className="text-slate-600">Mengetahui & Menyetujui,</p>
            <p className="font-extrabold text-slate-900">Kepala SMPN 4 Tinggimoncong</p>
            <div className="h-20 flex items-end justify-center font-bold text-slate-950 underline text-sm">
              {settings.principalName}
            </div>
            <p className="text-[11px] text-slate-700 font-mono">NIP. {settings.principalNip}</p>
          </div>
          <div>
            <p className="text-slate-600">Tinggimoncong, {monthNames[selectedMonth]} {selectedYear}</p>
            <p className="font-extrabold text-slate-900">Pengelola Kepegawaian / Admin Presensi</p>
            <div className="h-20 flex items-end justify-center font-bold text-slate-950 underline text-sm">
              {settings.operatorName}
            </div>
            <p className="text-[11px] text-slate-700 font-mono">NIP. {settings.operatorNip}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
