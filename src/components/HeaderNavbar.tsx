import React, { useState } from 'react';
import {
  MapPin,
  Clock,
  UserCheck,
  Calendar,
  Settings,
  Menu,
  X,
  ChevronDown,
  Terminal,
  Shield,
  School,
  Building2,
  FileSpreadsheet,
} from 'lucide-react';
import { Teacher, UserRole } from '../types';

interface HeaderNavbarProps {
  currentTeacher: Teacher;
  allTeachers: Teacher[];
  activeTab: 'live' | 'individual' | 'monthly' | 'admin' | 'prompt';
  onTabChange: (tab: 'live' | 'individual' | 'monthly' | 'admin' | 'prompt') => void;
  onSelectTeacher: (teacher: Teacher) => void;
}

export const HeaderNavbar: React.FC<HeaderNavbarProps> = ({
  currentTeacher,
  allTeachers,
  activeTab,
  onTabChange,
  onSelectTeacher,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  const navItems = [
    {
      id: 'live' as const,
      label: 'Presensi Hari Ini',
      icon: Clock,
      badge: 'Live GPS',
    },
    {
      id: 'individual' as const,
      label: 'Rekap Perorangan',
      icon: UserCheck,
    },
    {
      id: 'monthly' as const,
      label: 'Rekap Bulanan Dinas',
      icon: FileSpreadsheet,
      badge: 'Format Dinas',
    },
    {
      id: 'admin' as const,
      label: 'Panel Admin & Lokasi',
      icon: Settings,
    },
    {
      id: 'prompt' as const,
      label: 'Prompt & SOP',
      icon: Terminal,
      badge: 'Dokumentasi',
    },
  ];

  return (
    <header className="no-print bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      {/* Top institution banner */}
      <div className="bg-slate-900 text-slate-300 px-4 py-1.5 text-[11px] flex items-center justify-between">
        <div className="flex items-center gap-2 truncate">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="font-semibold text-white truncate">
            DINAS PENDIDIKAN KABUPATEN GOWA
          </span>
          <span className="text-slate-500 hidden sm:inline">•</span>
          <span className="text-slate-400 hidden sm:inline truncate">
            UPT SPF SMP NEGERI 4 TINGGIMONCONG (NPSN: 40314418)
          </span>
        </div>

        <div className="flex items-center gap-2 font-mono text-[10px] text-emerald-400 bg-slate-800 px-2 py-0.5 rounded shrink-0">
          <span>ZONA WAKTU: WITA (GMT+8)</span>
        </div>
      </div>

      {/* Main navigation row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md font-black text-lg border border-emerald-400/40">
              4T
            </div>
            <div>
              <div className="font-extrabold text-slate-900 text-sm sm:text-base leading-tight flex items-center gap-1.5">
                <span>SIAP-GURU</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.2 rounded-full font-bold">
                  SMPN 4 TINGGIMONCONG
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Sistem Informasi Absensi & Presensi Kehadiran Online
              </p>
            </div>
          </div>

          {/* Desktop Nav Items */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onTabChange(item.id)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all relative ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-800 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`}
                  />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold ${
                        isActive
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* User Profile / Quick Switcher */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                className="flex items-center gap-2.5 p-1.5 pr-2.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all text-left"
                title="Ganti Akun Pengguna / Role"
              >
                <img
                  src={currentTeacher.avatar}
                  alt={currentTeacher.name}
                  className="w-8 h-8 rounded-lg object-cover border border-slate-200"
                />
                <div className="hidden sm:block">
                  <div className="text-xs font-bold text-slate-900 leading-tight truncate max-w-[120px]">
                    {currentTeacher.name}
                  </div>
                  <div className="text-[10px] text-slate-500 capitalize flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>{currentTeacher.role} ({currentTeacher.statusPegawai})</span>
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* User Switcher Dropdown */}
              {isUserDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-3 py-2 border-b border-slate-100 text-xs">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Ganti Akun (Simulasi Semua Perangkat)
                    </span>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Pilih profil guru atau admin untuk menguji hak akses:
                    </p>
                  </div>

                  <div className="max-h-64 overflow-y-auto py-1 divide-y divide-slate-50 text-xs">
                    {allTeachers.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => {
                          onSelectTeacher(t);
                          setIsUserDropdownOpen(false);
                        }}
                        className={`w-full p-2 rounded-xl text-left flex items-center gap-2.5 transition-colors ${
                          t.id === currentTeacher.id
                            ? 'bg-emerald-50 text-emerald-900 font-semibold'
                            : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <img
                          src={t.avatar}
                          alt={t.name}
                          className="w-7 h-7 rounded-lg object-cover border border-slate-200 shrink-0"
                        />
                        <div className="truncate flex-1">
                          <div className="truncate">{t.name}</div>
                          <div className="text-[10px] text-slate-400 truncate">
                            {t.subject} • <span className="uppercase">{t.role}</span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Mobile menu trigger */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onTabChange(item.id);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full p-2.5 rounded-xl text-xs font-semibold flex items-center justify-between ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-800'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4 text-emerald-600" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
