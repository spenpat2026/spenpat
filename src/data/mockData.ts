import { SchoolSettings, Teacher, AttendanceRecord } from '../types';

export const DEFAULT_SCHOOL_SETTINGS: SchoolSettings = {
  schoolName: 'SMP NEGERI 4 TINGGIMONCONG',
  npsn: '40314418',
  address: "Jl. Poros Malino - Bulutana, Kec. Tinggimoncong, Kabupaten Gowa",
  district: 'Tinggimoncong',
  regency: 'Kabupaten Gowa',
  province: 'Sulawesi Selatan',
  latitude: -5.25750,
  longitude: 119.86520,
  radiusMeters: 150,
  workStartTime: '07:00',
  lateThresholdTime: '07:30',
  workEndTime: '14:30',
  principalName: 'Dra. Hj. Nurhidayah, M.Pd.',
  principalNip: '19690412 199512 2 002',
  operatorName: 'Muh. Fadli, S.Kom.',
  operatorNip: '19880920 201903 1 005',
};

export const INITIAL_TEACHERS: Teacher[] = [
  {
    id: 't-admin',
    name: 'Muh. Fadli, S.Kom.',
    nip: '19880920 201903 1 005',
    nuptk: '5441766667130122',
    role: 'admin',
    subject: 'Operator SIM-Presensi & TIK',
    statusPegawai: 'PNS',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    phone: '081242338901',
    email: 'fadli.smpn4tinggimoncong@gowa.go.id',
    gender: 'L',
  },
  {
    id: 't-kepsek',
    name: 'Dra. Hj. Nurhidayah, M.Pd.',
    nip: '19690412 199512 2 002',
    nuptk: '1234747650300083',
    role: 'kepsek',
    subject: 'Kepala Sekolah (Manajerial & Supervisi)',
    statusPegawai: 'PNS',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    phone: '081355442110',
    email: 'nurhidayah.kepsek@gowa.go.id',
    gender: 'P',
  },
  {
    id: 't-1',
    name: 'Baharuddin, S.Pd., M.Si.',
    nip: '19750815 200212 1 004',
    nuptk: '8746753655200032',
    role: 'guru',
    subject: 'Matematika',
    statusPegawai: 'PNS',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    phone: '085299443211',
    email: 'baharuddin.smpn4@gmail.com',
    gender: 'L',
  },
  {
    id: 't-2',
    name: 'St. Rahmawati, S.Pd.',
    nip: '19810321 200801 2 015',
    nuptk: '6253759661300052',
    role: 'guru',
    subject: 'Bahasa Indonesia',
    statusPegawai: 'PNS',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    phone: '081299887711',
    email: 'st.rahmawati@gmail.com',
    gender: 'P',
  },
  {
    id: 't-3',
    name: 'Irwan Pratama, S.Pd.',
    nip: '19920614 202221 1 008',
    nuptk: '4562770671130062',
    role: 'guru',
    subject: 'Ilmu Pengetahuan Alam (IPA)',
    statusPegawai: 'PPPK',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    phone: '082155663322',
    email: 'irwan.ipa.smpn4@gmail.com',
    gender: 'L',
  },
  {
    id: 't-4',
    name: 'Nurbaeti, S.Pd.',
    nip: '19840918 201001 2 021',
    nuptk: '9050762663300063',
    role: 'guru',
    subject: 'Bahasa Inggris',
    statusPegawai: 'PNS',
    avatar: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150&auto=format&fit=crop&q=80',
    phone: '085344778899',
    email: 'nurbaeti.english@gmail.com',
    gender: 'P',
  },
  {
    id: 't-5',
    name: 'Ahmad Syarif, S.Pd.I.',
    nip: '19830110 200902 1 003',
    nuptk: '3451761662200022',
    role: 'guru',
    subject: 'Pendidikan Agama Islam (PAI)',
    statusPegawai: 'PNS',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    phone: '081344556677',
    email: 'syarif.pai@gmail.com',
    gender: 'L',
  },
  {
    id: 't-6',
    name: 'Andi Tenri Olle, S.Pd.',
    nip: '19901105 202321 2 011',
    nuptk: '7652768669230043',
    role: 'guru',
    subject: 'Ilmu Pengetahuan Sosial (IPS)',
    statusPegawai: 'PPPK',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    phone: '081288334455',
    email: 'tenri.ips@gmail.com',
    gender: 'P',
  },
  {
    id: 't-7',
    name: 'Hasbullah, S.Pd.',
    nip: '-',
    nuptk: '5543764665130093',
    role: 'guru',
    subject: 'PJOK / Penjaskes',
    statusPegawai: 'Guru Honorer',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    phone: '082344551122',
    email: 'hasbullah.pjok@gmail.com',
    gender: 'L',
  },
  {
    id: 't-8',
    name: 'Wahyuni Mansur, S.Pd.',
    nip: '-',
    nuptk: '8876766668230053',
    role: 'guru',
    subject: 'Seni Budaya',
    statusPegawai: 'Guru Honorer',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    phone: '081377889900',
    email: 'wahyuni.seni@gmail.com',
    gender: 'P',
  },
  {
    id: 't-9',
    name: 'Suryani, S.Pd.',
    nip: '19930722 202221 2 009',
    nuptk: '4351771672230033',
    role: 'guru',
    subject: 'Pendidikan Pancasila (PPKn)',
    statusPegawai: 'PPPK',
    avatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=150&auto=format&fit=crop&q=80',
    phone: '085266778899',
    email: 'suryani.ppkn@gmail.com',
    gender: 'P',
  },
  {
    id: 't-10',
    name: 'Marlina, A.Md.',
    nip: '19850419 201402 2 001',
    nuptk: '2134763664300073',
    role: 'tendik',
    subject: 'Kepala Urusan Tata Usaha',
    statusPegawai: 'PNS',
    avatar: 'https://images.unsplash.com/photo-1573496799652-408c2ac9fe98?w=150&auto=format&fit=crop&q=80',
    phone: '081233445566',
    email: 'marlina.tu@gmail.com',
    gender: 'P',
  },
  {
    id: 't-11',
    name: 'Darmawan',
    nip: '-',
    nuptk: '-',
    role: 'tendik',
    subject: 'Pengelola Laboratorium & Perpustakaan',
    statusPegawai: 'Tendik',
    avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80',
    phone: '082199001122',
    email: 'darmawan.lab@gmail.com',
    gender: 'L',
  },
];

/**
 * Generate historical attendance records for realistic data display
 */
export function generateInitialAttendance(): AttendanceRecord[] {
  const records: AttendanceRecord[] = [];
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth(); // 0-indexed
  const todayDate = today.getDate();

  // Create sample data for the last 25 days of the current month
  for (let day = 1; day <= todayDate; day++) {
    const dateObj = new Date(currentYear, currentMonth, day);
    const dayOfWeek = dateObj.getDay(); // 0 is Sunday, 6 is Saturday

    // Skip Sundays
    if (dayOfWeek === 0) continue;

    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    INITIAL_TEACHERS.forEach((teacher, idx) => {
      // Deterministic pseudo-randomness based on day and teacher idx
      const seed = (day * 13 + idx * 7) % 100;
      let status: 'HADIR' | 'TERLAMBAT' | 'IZIN' | 'SAKIT' | 'DINAS_LUAR' | 'ALPHA' = 'HADIR';
      let checkInTime = '07:05:22';
      let checkOutTime = dayOfWeek === 6 ? '12:30:15' : '14:35:40';
      let notes = 'Hadir mengajar sesuai jadwal kurikulum';

      if (seed < 78) {
        // Hadir Tepat Waktu
        const minute = 5 + (seed % 20); // 07:05 - 07:24
        checkInTime = `07:${String(minute).padStart(2, '0')}:${String((seed * 3) % 60).padStart(2, '0')}`;
        status = 'HADIR';
      } else if (seed < 88) {
        // Terlambat
        const minute = 31 + (seed % 25); // 07:31 - 07:55
        checkInTime = `07:${String(minute).padStart(2, '0')}:${String((seed * 5) % 60).padStart(2, '0')}`;
        status = 'TERLAMBAT';
        notes = 'Terlambat karena kabut tebal jalan poros Malino';
      } else if (seed < 93) {
        // Izin
        status = 'IZIN';
        checkInTime = undefined as any;
        checkOutTime = undefined as any;
        notes = 'Izin urusan keluarga / kedinasan';
      } else if (seed < 97) {
        // Sakit
        status = 'SAKIT';
        checkInTime = undefined as any;
        checkOutTime = undefined as any;
        notes = 'Sakit (Surat keterangan dokter terlampir)';
      } else {
        // Dinas Luar
        status = 'DINAS_LUAR';
        checkInTime = '07:45:00';
        checkOutTime = '15:10:00';
        notes = 'Mengikuti MGMP / Pelatihan Dinas Pendidikan Kab. Gowa di Sungguminasa';
      }

      // If it's today, allow some to not have checked out yet
      if (day === todayDate) {
        if (status === 'HADIR' || status === 'TERLAMBAT') {
          // Some checked in, but afternoon checkout is pending
          if (idx % 2 === 0) {
            checkOutTime = undefined as any;
          }
        }
      }

      records.push({
        id: `att-${dateStr}-${teacher.id}`,
        teacherId: teacher.id,
        teacherName: teacher.name,
        date: dateStr,
        checkInTime,
        checkOutTime,
        status,
        checkInPhoto:
          status === 'HADIR' || status === 'TERLAMBAT' || status === 'DINAS_LUAR'
            ? teacher.avatar
            : undefined,
        checkOutPhoto: checkOutTime ? teacher.avatar : undefined,
        checkInLocation:
          status === 'HADIR' || status === 'TERLAMBAT'
            ? {
                lat: DEFAULT_SCHOOL_SETTINGS.latitude + (Math.random() - 0.5) * 0.0004,
                lng: DEFAULT_SCHOOL_SETTINGS.longitude + (Math.random() - 0.5) * 0.0004,
                distanceMeters: Math.floor(15 + Math.random() * 65),
                isWithinRadius: true,
                address: 'Kawasan Kampus SMPN 4 Tinggimoncong, Malino, Gowa',
              }
            : undefined,
        notes,
        approvalStatus: 'APPROVED',
        workMinutes: checkInTime && checkOutTime ? 450 : undefined,
      });
    });
  }

  return records;
}
