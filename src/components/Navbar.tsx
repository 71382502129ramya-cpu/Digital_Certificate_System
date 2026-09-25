import React from 'react';
import {
  ShieldCheck,
  Search,
  Award,
  Sliders,
  Building2,
  Trophy,
  RotateCcw,
  Zap,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { useCertificate } from '../context/CertificateContext';
import { UserRole } from '../types';

interface NavbarProps {
  currentView: 'verify' | 'student' | 'admin' | 'institution' | 'tamper' | 'leaderboard';
  setCurrentView: (view: 'verify' | 'student' | 'admin' | 'institution' | 'tamper' | 'leaderboard') => void;
  onLogoutClick?: () => void;
  onOpenAIChat?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, setCurrentView, onLogoutClick, onOpenAIChat }) => {
  const { currentUser, switchRole, resetDemoData, logout, setAccessDeniedNotice } = useCertificate();

  const handleStudentNav = () => {
    if (currentUser?.role === 'student') {
      setCurrentView('student');
    } else {
      setAccessDeniedNotice({
        requiredRole: 'student',
        title: 'Student Identity Required',
        message: 'The Student Portal is restricted to verified student accounts and credentials lockers.',
      });
    }
  };

  const handleAdminNav = () => {
    if (currentUser?.role === 'admin') {
      setCurrentView('admin');
    } else {
      setAccessDeniedNotice({
        requiredRole: 'admin',
        title: 'Administrator Clearance Required',
        message: 'The Admin Console is restricted to university registrars and credentials administrators.',
      });
    }
  };

  const handleLogout = () => {
    if (onLogoutClick) {
      onLogoutClick();
    } else {
      logout();
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-slate-100 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16 gap-2">
        {/* Brand & Title */}
        <div
          onClick={() => setCurrentView('verify')}
          className="flex items-center gap-2.5 cursor-pointer select-none shrink-0"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 p-0.5 shadow-lg shadow-emerald-950/50 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold tracking-tight text-white text-base">CERT-VAULT</span>
              <span className="text-[10px] font-mono-code px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/60">
                SHA-256
              </span>
            </div>
            <p className="text-[10px] text-slate-400 -mt-0.5 tracking-wide hidden sm:block">
              Digital Certificate Verification System
            </p>
          </div>
        </div>

        {/* Center Nav Items */}
        <nav className="hidden md:flex items-center gap-1 text-xs font-semibold">
          <button
            id="nav-verify"
            onClick={() => setCurrentView('verify')}
            className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
              currentView === 'verify'
                ? 'bg-slate-800 text-emerald-400 shadow-sm border border-slate-700'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            Verify
          </button>

          <button
            id="nav-student"
            onClick={handleStudentNav}
            className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
              currentView === 'student'
                ? 'bg-slate-800 text-emerald-400 shadow-sm border border-slate-700'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            Student Portal
          </button>

          <button
            id="nav-admin"
            onClick={handleAdminNav}
            className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
              currentView === 'admin'
                ? 'bg-slate-800 text-emerald-400 shadow-sm border border-slate-700'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            Admin Console
          </button>

          <button
            id="nav-institution"
            onClick={() => setCurrentView('institution')}
            className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
              currentView === 'institution'
                ? 'bg-slate-800 text-emerald-400 shadow-sm border border-slate-700'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            Institutions
          </button>

          <button
            id="nav-tamper"
            onClick={() => setCurrentView('tamper')}
            className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
              currentView === 'tamper'
                ? 'bg-slate-800 text-emerald-400 shadow-sm border border-slate-700'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            Tamper Lab
          </button>

          <button
            id="nav-leaderboard"
            onClick={() => setCurrentView('leaderboard')}
            className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
              currentView === 'leaderboard'
                ? 'bg-slate-800 text-emerald-400 shadow-sm border border-slate-700'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            Leaderboard
          </button>
        </nav>

        {/* Right Role Switcher & Controls */}
        <div className="flex items-center gap-2">
          {/* Active Role Indicator & Switcher */}
          <div className="flex items-center gap-2 bg-slate-950/80 border border-slate-800 rounded-xl p-1 text-xs">
            <span className="text-[10px] text-slate-400 px-2 font-medium hidden lg:inline">
              Active Role:
            </span>
            <select
              id="role-switcher-select"
              value={currentUser?.role || 'student'}
              onChange={(e) => {
                const role = e.target.value as UserRole;
                switchRole(role);
                if (role === 'student') setCurrentView('student');
                if (role === 'admin') setCurrentView('admin');
                if (role === 'institution') setCurrentView('institution');
              }}
              className="bg-slate-800 text-slate-200 border-0 rounded-lg px-2.5 py-1 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="student">👨‍🎓 Student ({currentUser?.role === 'student' ? currentUser.name : 'Aarav'})</option>
              <option value="admin">👨‍💼 Admin ({currentUser?.role === 'admin' ? currentUser.name : 'Dr. Vance'})</option>
            </select>
          </div>

          {/* AI Copilot Button */}
          {onOpenAIChat && (
            <button
              id="nav-ai-copilot-btn"
              onClick={onOpenAIChat}
              title="Open CertVault AI Copilot Assistant"
              className="px-3 py-1.5 bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span className="hidden sm:inline">AI Copilot</span>
            </button>
          )}

          {/* Reset Baseline Data */}
          <button
            id="reset-demo-btn"
            onClick={resetDemoData}
            title="Reset system database to initial clean state"
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Prominent Logout Button */}
          <button
            id="nav-logout-btn"
            onClick={handleLogout}
            title="Logout from current session"
            className="px-3 py-1.5 bg-slate-800/90 hover:bg-rose-950/80 border border-slate-700 hover:border-rose-800/70 text-slate-300 hover:text-rose-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>

      {/* Mobile Nav Drawer Row */}
      <div className="md:hidden flex items-center justify-around border-t border-slate-800/80 py-2 px-2 text-[11px] font-semibold overflow-x-auto">
        <button
          onClick={() => setCurrentView('verify')}
          className={`px-2 py-1 rounded ${currentView === 'verify' ? 'text-emerald-400 font-bold' : 'text-slate-400'}`}
        >
          Verify
        </button>
        <button
          onClick={handleStudentNav}
          className={`px-2 py-1 rounded ${currentView === 'student' ? 'text-emerald-400 font-bold' : 'text-slate-400'}`}
        >
          Student
        </button>
        <button
          onClick={handleAdminNav}
          className={`px-2 py-1 rounded ${currentView === 'admin' ? 'text-emerald-400 font-bold' : 'text-slate-400'}`}
        >
          Admin
        </button>
        <button
          onClick={() => setCurrentView('institution')}
          className={`px-2 py-1 rounded ${currentView === 'institution' ? 'text-emerald-400 font-bold' : 'text-slate-400'}`}
        >
          Institutions
        </button>
        <button
          onClick={() => setCurrentView('tamper')}
          className={`px-2 py-1 rounded ${currentView === 'tamper' ? 'text-emerald-400 font-bold' : 'text-slate-400'}`}
        >
          Tamper Lab
        </button>
        <button
          onClick={() => setCurrentView('leaderboard')}
          className={`px-2 py-1 rounded ${currentView === 'leaderboard' ? 'text-emerald-400 font-bold' : 'text-slate-400'}`}
        >
          Leaderboard
        </button>
        <button
          onClick={handleLogout}
          className="px-2 py-1 rounded text-rose-400 font-semibold"
        >
          Logout
        </button>
      </div>
    </header>
  );
};
