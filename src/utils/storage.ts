import { AttendanceRecord, SchoolSettings, Teacher } from '../types';
import { DEFAULT_SCHOOL_SETTINGS, INITIAL_TEACHERS, generateInitialAttendance } from '../data/mockData';

const SETTINGS_KEY = 'smpn4_tinggimoncong_settings_v1';
const TEACHERS_KEY = 'smpn4_tinggimoncong_teachers_v1';
const ATTENDANCE_KEY = 'smpn4_tinggimoncong_attendance_v1';

export function getStoredSettings(): SchoolSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading settings', e);
  }
  return DEFAULT_SCHOOL_SETTINGS;
}

export function saveStoredSettings(settings: SchoolSettings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function getStoredTeachers(): Teacher[] {
  try {
    const raw = localStorage.getItem(TEACHERS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading teachers', e);
  }
  return INITIAL_TEACHERS;
}

export function saveStoredTeachers(teachers: Teacher[]): void {
  localStorage.setItem(TEACHERS_KEY, JSON.stringify(teachers));
}

export function getStoredAttendance(): AttendanceRecord[] {
  try {
    const raw = localStorage.getItem(ATTENDANCE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading attendance', e);
  }
  const initial = generateInitialAttendance();
  localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(initial));
  return initial;
}

export function saveStoredAttendance(records: AttendanceRecord[]): void {
  localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(records));
}

export function resetAllDataToDefault(): void {
  localStorage.removeItem(SETTINGS_KEY);
  localStorage.removeItem(TEACHERS_KEY);
  localStorage.removeItem(ATTENDANCE_KEY);
}
