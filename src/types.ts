export type UserRole = 'admin' | 'kepsek' | 'guru' | 'tendik';

export type EmploymentStatus = 'PNS' | 'PPPK' | 'Guru Honorer' | 'Tendik';

export type AttendanceStatus = 'HADIR' | 'TERLAMBAT' | 'IZIN' | 'SAKIT' | 'DINAS_LUAR' | 'ALPHA';

export type ApprovalStatus = 'APPROVED' | 'PENDING' | 'REJECTED';

export interface Teacher {
  id: string;
  name: string;
  nip: string;
  nuptk?: string;
  role: UserRole;
  subject: string;
  statusPegawai: EmploymentStatus;
  avatar: string;
  phone: string;
  email: string;
  gender: 'L' | 'P';
}

export interface GeoLocationPoint {
  lat: number;
  lng: number;
  address?: string;
  distanceMeters: number;
  isWithinRadius: boolean;
}

export interface AttendanceRecord {
  id: string;
  teacherId: string;
  teacherName: string;
  date: string; // YYYY-MM-DD
  checkInTime?: string; // HH:mm:ss
  checkOutTime?: string; // HH:mm:ss
  status: AttendanceStatus;
  checkInPhoto?: string;
  checkOutPhoto?: string;
  checkInLocation?: GeoLocationPoint;
  checkOutLocation?: GeoLocationPoint;
  notes?: string;
  proofAttachment?: string;
  approvalStatus: ApprovalStatus;
  workMinutes?: number;
}

export interface SchoolSettings {
  schoolName: string;
  npsn: string;
  address: string;
  district: string; // Tinggimoncong
  regency: string;  // Kabupaten Gowa
  province: string; // Sulawesi Selatan
  latitude: number;
  longitude: number;
  radiusMeters: number; // e.g. 150m
  workStartTime: string; // "07:30"
  lateThresholdTime: string; // "07:45"
  workEndTime: string;   // "15:30"
  principalName: string;
  principalNip: string;
  operatorName: string;
  operatorNip: string;
}
