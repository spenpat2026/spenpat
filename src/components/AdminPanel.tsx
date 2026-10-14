import React, { useState } from 'react';
import {
  Users,
  Settings,
  MapPin,
  Clock,
  UserPlus,
  Edit2,
  Trash2,
  Save,
  RotateCcw,
  CheckCircle,
  XCircle,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import { Teacher, SchoolSettings, AttendanceRecord, EmploymentStatus, UserRole } from '../types';

interface AdminPanelProps {
  teachers: Teacher[];
  settings: SchoolSettings;
  records: AttendanceRecord[];
  onSaveTeachers: (teachers: Teacher[]) => void;
  onSaveSettings: (settings: SchoolSettings) => void;
  onApproveRecord: (recordId: string, status: 'APPROVED' | 'REJECTED') => void;
  onResetData: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  teachers,
  settings,
  records,
  onSaveTeachers,
  onSaveSettings,
  onApproveRecord,
  onResetData,
}) => {
  const [subTab, setSubTab] = useState<'teachers' | 'settings' | 'approvals'>('teachers');
  const [isEditingTeacher, setIsEditingTeacher] = useState<Teacher | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  // Form states for settings
  const [formSettings, setFormSettings] = useState<SchoolSettings>({ ...settings });
  const [settingsSavedToast, setSettingsSavedToast] = useState(false);

  // Teacher Form State
  const [teacherForm, setTeacherForm] = useState<Partial<Teacher>>({
    name: '',
    nip: '',
    nuptk: '',
    role: 'guru',
    subject: '',
    statusPegawai: 'PNS',
    phone: '',
    email: '',
    gender: 'L',
  });

  // Approvals queue
  const pendingApprovals = records.filter(
    (r) => r.approvalStatus === 'PENDING' || ['IZIN', 'SAKIT', 'DINAS_LUAR'].includes(r.status)
  );

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(formSettings);
    setSettingsSavedToast(true);
    setTimeout(() => setSettingsSavedToast(false), 3000);
  };

  const handleOpenAddTeacher = () => {
    setIsEditingTeacher(null);
    setTeacherForm({
      name: '',
      nip: '',
      nuptk: '',
      role: 'guru',
      subject: '',
      statusPegawai: 'PNS',
      phone: '',
      email: '',
      gender: 'L',
    });
    setIsAddingNew(true);
  };

  const handleOpenEditTeacher = (t: Teacher) => {
    setIsEditingTeacher(t);
    setTeacherForm({ ...t });
    setIsAddingNew(false);
  };

  const handleSaveTeacherSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherForm.name || !teacherForm.subject) return;

    if (isEditingTeacher) {
      // Update
      const updated = teachers.map((t) =>
        t.id === isEditingTeacher.id ? ({ ...t, ...teacherForm } as Teacher) : t
      );
      onSaveTeachers(updated);
      setIsEditingTeacher(null);
    } else {
      // Create new
      const newTeacher: Teacher = {
        id: `t-${Date.now()}`,
        name: teacherForm.name!,
        nip: teacherForm.nip || '-',
        nuptk: teacherForm.nuptk || '-',
        role: (teacherForm.role as UserRole) || 'guru',
        subject: teacherForm.subject!,
        statusPegawai: (teacherForm.statusPegawai as EmploymentStatus) || 'PNS',
        avatar:
          teacherForm.gender === 'P'
            ? 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80'
            : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        phone: teacherForm.phone || '081234567890',
        email: teacherForm.email || 'guru.smpn4@gmail.com',
        gender: teacherForm.gender || 'L',
      };
      onSaveTeachers([...teachers, newTeacher]);
      setIsAddingNew(false);
    }
  };

  const handleDeleteTeacher = (id: string, name: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus data guru: ${name}?`)) {
      onSaveTeachers(teachers.filter((t) => t.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      {/* Sub Tabs */}
      <div className="flex border-b border-slate-200 gap-4 sm:gap-6 overflow-x-auto text-xs sm:text-sm font-semibold">
        <button
          type="button"
          onClick={() => setSubTab('teachers')}
          className={`pb-3 flex items-center gap-2 whitespace-nowrap transition-colors ${
            subTab === 'teachers'
              ? 'text-emerald-700 border-b-2 border-emerald-600'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Kelola Guru & Staf ({teachers.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setSubTab('settings')}
          className={`pb-3 flex items-center gap-2 whitespace-nowrap transition-colors ${
            subTab === 'settings'
              ? 'text-emerald-700 border-b-2 border-emerald-600'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Pengaturan Lokasi GPS & Jam Dinas</span>
        </button>

        <button
          type="button"
          onClick={() => setSubTab('approvals')}
          className={`pb-3 flex items-center gap-2 whitespace-nowrap transition-colors ${
            subTab === 'approvals'
              ? 'text-emerald-700 border-b-2 border-emerald-600'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Verifikasi Izin & Sakit ({pendingApprovals.length})</span>
        </button>
      </div>

      {/* Teachers Tab */}
      {subTab === 'teachers' && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Data Guru & Tenaga Kependidikan SMPN 4 Tinggimoncong
              </h2>
              <p className="text-xs text-slate-500">
                Total {teachers.length} personil terdaftar dalam sistem presensi.
              </p>
            </div>

            <button
              type="button"
              onClick={handleOpenAddTeacher}
              className="flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95"
            >
              <UserPlus className="w-4 h-4" />
              <span>Tambah Guru Baru</span>
            </button>
          </div>

          {/* Add / Edit Form Modal / Inline */}
          {(isAddingNew || isEditingTeacher) && (
            <div className="p-5 bg-emerald-50/60 border border-emerald-200 rounded-2xl animate-in fade-in">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-emerald-950">
                  {isAddingNew ? 'Tambah Data Guru / Pegawai Baru' : `Ubah Data: ${isEditingTeacher?.name}`}
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingNew(false);
                    setIsEditingTeacher(null);
                  }}
                  className="text-xs text-slate-500 hover:text-slate-800"
                >
                  Batal
                </button>
              </div>

              <form onSubmit={handleSaveTeacherSubmit} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Nama Lengkap & Gelar <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={teacherForm.name}
                    onChange={(e) => setTeacherForm({ ...teacherForm, name: e.target.value })}
                    placeholder="Contoh: Dra. Hj. Nurhidayah, M.Pd."
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">NIP (Kosongkan jika honorer)</label>
                  <input
                    type="text"
                    value={teacherForm.nip}
                    onChange={(e) => setTeacherForm({ ...teacherForm, nip: e.target.value })}
                    placeholder="19800101 200501 1 001 atau -"
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Mata Pelajaran / Tugas</label>
                  <input
                    type="text"
                    required
                    value={teacherForm.subject}
                    onChange={(e) => setTeacherForm({ ...teacherForm, subject: e.target.value })}
                    placeholder="Contoh: Matematika, IPA, TU"
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Status Kepegawaian</label>
                  <select
                    value={teacherForm.statusPegawai}
                    onChange={(e) => setTeacherForm({ ...teacherForm, statusPegawai: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white"
                  >
                    <option value="PNS">PNS</option>
                    <option value="PPPK">PPPK</option>
                    <option value="Guru Honorer">Guru Honorer</option>
                    <option value="Tendik">Tenaga Kependidikan</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Peran Akses (Role)</label>
                  <select
                    value={teacherForm.role}
                    onChange={(e) => setTeacherForm({ ...teacherForm, role: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white"
                  >
                    <option value="guru">Guru Mata Pelajaran</option>
                    <option value="tendik">Tenaga Kependidikan (TU/Lab)</option>
                    <option value="kepsek">Kepala Sekolah</option>
                    <option value="admin">Admin / Operator Presensi</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Jenis Kelamin</label>
                  <select
                    value={teacherForm.gender}
                    onChange={(e) => setTeacherForm({ ...teacherForm, gender: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white"
                  >
                    <option value="L">Laki-Laki (L)</option>
                    <option value="P">Perempuan (P)</option>
                  </select>
                </div>

                <div className="sm:col-span-2 md:col-span-3 flex justify-end gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingNew(false);
                      setIsEditingTeacher(null);
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-200 text-slate-700 font-semibold"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-md"
                  >
                    Simpan Data Guru
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm bg-white">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-3 w-12 text-center">No</th>
                  <th className="p-3">Guru / Pegawai</th>
                  <th className="p-3">NIP / NUPTK</th>
                  <th className="p-3">Mata Pelajaran</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Peran Akun</th>
                  <th className="p-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {teachers.map((t, idx) => (
                  <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3 text-center text-slate-400 font-mono">{idx + 1}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={t.avatar}
                          alt={t.name}
                          className="w-9 h-9 rounded-xl object-cover border border-slate-200 shrink-0"
                        />
                        <div>
                          <div className="font-bold text-slate-900">{t.name}</div>
                          <div className="text-[11px] text-slate-500">{t.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 font-mono text-slate-700">{t.nip !== '-' ? t.nip : t.nuptk || '-'}</td>
                    <td className="p-3 text-slate-800">{t.subject}</td>
                    <td className="p-3">
                      <span className="bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full font-medium text-[11px]">
                        {t.statusPegawai}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="capitalize text-slate-600 font-medium">{t.role}</span>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEditTeacher(t)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                          title="Ubah Data"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteTeacher(t.id, t.name)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                          title="Hapus"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Settings Tab */}
      {subTab === 'settings' && (
        <form onSubmit={handleSaveSettings} className="space-y-6 max-w-4xl bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          {settingsSavedToast && (
            <div className="p-3 bg-emerald-100 border border-emerald-300 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>Pengaturan lokasi dan jam kerja berhasil diperbarui!</span>
            </div>
          )}

          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span>Lokasi Koordinat & Geofencing Presensi</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Menentukan titik tengah sekolah SMPN 4 Tinggimoncong dan jarak radius toleransi presensi guru.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Latitude (Lintang)</label>
                <input
                  type="number"
                  step="any"
                  value={formSettings.latitude}
                  onChange={(e) => setFormSettings({ ...formSettings, latitude: parseFloat(e.target.value) })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-mono"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Longitude (Bujur)</label>
                <input
                  type="number"
                  step="any"
                  value={formSettings.longitude}
                  onChange={(e) => setFormSettings({ ...formSettings, longitude: parseFloat(e.target.value) })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-mono"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Radius Toleransi (Meter)</label>
                <input
                  type="number"
                  value={formSettings.radiusMeters}
                  onChange={(e) => setFormSettings({ ...formSettings, radiusMeters: parseInt(e.target.value) || 150 })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-mono"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-600" />
              <span>Jadwal Jam Dinas (WITA)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Jam Mulai Masuk</label>
                <input
                  type="time"
                  value={formSettings.workStartTime}
                  onChange={(e) => setFormSettings({ ...formSettings, workStartTime: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-mono"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Batas Toleransi (Terlambat jika lewat)</label>
                <input
                  type="time"
                  value={formSettings.lateThresholdTime}
                  onChange={(e) => setFormSettings({ ...formSettings, lateThresholdTime: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-mono"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Jam Pulang Dinas</label>
                <input
                  type="time"
                  value={formSettings.workEndTime}
                  onChange={(e) => setFormSettings({ ...formSettings, workEndTime: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-mono"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-600" />
              <span>Pejabat Penandatangan Laporan Resmi</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Kepala Sekolah</label>
                <input
                  type="text"
                  value={formSettings.principalName}
                  onChange={(e) => setFormSettings({ ...formSettings, principalName: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">NIP Kepala Sekolah</label>
                <input
                  type="text"
                  value={formSettings.principalNip}
                  onChange={(e) => setFormSettings({ ...formSettings, principalNip: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-mono"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Operator Kepegawaian</label>
                <input
                  type="text"
                  value={formSettings.operatorName}
                  onChange={(e) => setFormSettings({ ...formSettings, operatorName: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">NIP Operator Kepegawaian</label>
                <input
                  type="text"
                  value={formSettings.operatorNip}
                  onChange={(e) => setFormSettings({ ...formSettings, operatorNip: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-mono"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => {
                if (confirm('Kembalikan semua data ke pengaturan default awal?')) {
                  onResetData();
                }
              }}
              className="text-xs text-rose-600 hover:text-rose-700 flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Data Demo Awal</span>
            </button>

            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Perubahan Pengaturan</span>
            </button>
          </div>
        </form>
      )}

      {/* Approvals Tab */}
      {subTab === 'approvals' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Verifikasi Permohonan Izin / Sakit / Dinas Luar
            </h2>
            <p className="text-xs text-slate-500">
              Daftar pengajuan ketidakhadiran guru yang memerlukan persetujuan Kepala Sekolah.
            </p>
          </div>

          {pendingApprovals.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              Tidak ada permohonan yang menunggu persetujuan saat ini.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {pendingApprovals.map((item) => (
                <div key={item.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{item.teacherName}</span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          item.status === 'IZIN'
                            ? 'bg-blue-100 text-blue-800'
                            : item.status === 'SAKIT'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-teal-100 text-teal-800'
                        }`}
                      >
                        {item.status}
                      </span>
                      <span className="text-[11px] text-slate-500">{item.date}</span>
                    </div>
                    <p className="text-slate-600 mt-1 italic">"{item.notes || 'Tidak ada catatan'}"</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => onApproveRecord(item.id, 'APPROVED')}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold flex items-center gap-1.5"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Setujui</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onApproveRecord(item.id, 'REJECTED')}
                      className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg font-semibold flex items-center gap-1.5"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Tolak</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
