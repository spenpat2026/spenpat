import React, { useState, useEffect } from 'react';
import {
  getStoredSettings,
  saveStoredSettings,
  getStoredTeachers,
  saveStoredTeachers,
  getStoredAttendance,
  saveStoredAttendance,
  resetAllDataToDefault,
} from './utils/storage';
import { Teacher, SchoolSettings, AttendanceRecord } from './types';
import { HeaderNavbar } from './components/HeaderNavbar';
import { AttendanceLive } from './components/AttendanceLive';
import { IndividualRecap } from './components/IndividualRecap';
import { MonthlyRecap } from './components/MonthlyRecap';
import { AdminPanel } from './components/AdminPanel';
import { PromptViewerModal } from './components/PromptViewerModal';
import { Building2, Phone, Mail, MapPin, ShieldCheck, Heart } from 'lucide-react';

export default function App() {
  const [settings, setSettings] = useState<SchoolSettings>(() => getStoredSettings());
  const [teachers, setTeachers] = useState<Teacher[]>(() => getStoredTeachers());
  const [records, setRecords] = useState<AttendanceRecord[]>(() => getStoredAttendance());
  const [currentTeacher, setCurrentTeacher] = useState<Teacher>(() => {
    const list = getStoredTeachers();
    // Default to a teacher (Baharuddin) or admin
    return list.find((t) => t.id === 't-1') || list[0];
  });
  const [activeTab, setActiveTab] = useState<'live' | 'individual' | 'monthly' | 'admin' | 'prompt'>('live');

  // Persistence triggers
  useEffect(() => {
    saveStoredSettings(settings);
  }, [settings]);

  useEffect(() => {
    saveStoredTeachers(teachers);
  }, [teachers]);

  useEffect(() => {
    saveStoredAttendance(records);
  }, [records]);

  // Handlers
  const handleRecordSaved = (newRecord: AttendanceRecord) => {
    setRecords((prev) => {
      const existingIdx = prev.findIndex((r) => r.id === newRecord.id);
      if (existingIdx >= 0) {
        const copy = [...prev];
        copy[existingIdx] = newRecord;
        return copy;
      }
      return [newRecord, ...prev];
    });
  };

  const handleApproveRecord = (recordId: string, status: 'APPROVED' | 'REJECTED') => {
    setRecords((prev) =>
      prev.map((r) => (r.id === recordId ? { ...r, approvalStatus: status } : r))
    );
  };

  const handleResetData = () => {
    resetAllDataToDefault();
    const defaultSettings = getStoredSettings();
    const defaultTeachers = getStoredTeachers();
    const defaultRecords = getStoredAttendance();
    setSettings(defaultSettings);
    setTeachers(defaultTeachers);
    setRecords(defaultRecords);
    setCurrentTeacher(defaultTeachers[0]);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800">
      {/* Navbar with official branding and role selector */}
      <HeaderNavbar
        currentTeacher={currentTeacher}
        allTeachers={teachers}
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        onSelectTeacher={(t) => setCurrentTeacher(t)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {activeTab === 'live' && (
          <AttendanceLive
            currentTeacher={currentTeacher}
            settings={settings}
            records={records}
            onRecordSaved={handleRecordSaved}
            onNavigateToIndividualRecap={() => setActiveTab('individual')}
          />
        )}

        {activeTab === 'individual' && (
          <IndividualRecap
            currentTeacher={currentTeacher}
            allTeachers={teachers}
            records={records}
            settings={settings}
            canSelectTeacher={true}
          />
        )}

        {activeTab === 'monthly' && (
          <MonthlyRecap
            teachers={teachers}
            records={records}
            settings={settings}
          />
        )}

        {activeTab === 'admin' && (
          <AdminPanel
            teachers={teachers}
            settings={settings}
            records={records}
            onSaveTeachers={(newTeachers) => setTeachers(newTeachers)}
            onSaveSettings={(newSettings) => setSettings(newSettings)}
            onApproveRecord={handleApproveRecord}
            onResetData={handleResetData}
          />
        )}

        {activeTab === 'prompt' && <PromptViewerModal />}
      </main>

      {/* Footer */}
      <footer className="no-print bg-white border-t border-slate-200 mt-12 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              <strong>UPT SPF SMP Negeri 4 Tinggimoncong</strong> • Dinas Pendidikan Kabupaten Gowa, Sulawesi Selatan
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1 text-slate-600">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>Poros Malino - Tinggimoncong</span>
            </span>
            <span className="flex items-center gap-1 text-emerald-700 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>SIM-Presensi Cloud Terintegrasi</span>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
