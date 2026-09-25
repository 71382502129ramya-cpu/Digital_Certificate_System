import React, { useState, useEffect } from 'react';
import { CertificateProvider, useCertificate } from './context/CertificateContext';
import { LoginPage } from './components/LoginPage';
import { Navbar } from './components/Navbar';
import { VerificationView } from './components/VerificationView';
import { StudentDashboard } from './components/StudentDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { InstitutionDashboard } from './components/InstitutionDashboard';
import { TamperPlayground } from './components/TamperPlayground';
import { LeaderboardView } from './components/LeaderboardView';
import { CertificateDocument } from './components/CertificateDocument';
import { AccessDeniedModal } from './components/AccessDeniedModal';
import { AIChatDrawer } from './components/AIChatDrawer';
import { ShieldCheck, Lock, Database, QrCode, LogIn, ArrowLeft, Sparkles } from 'lucide-react';
import { UserRole } from './types';

function AppContent() {
  const {
    currentUser,
    isAuthenticated,
    logout,
    accessDeniedNotice,
    setAccessDeniedNotice,
    selectedCertificateModal,
    setSelectedCertificateModal,
  } = useCertificate();

  const [isAIChatOpen, setIsAIChatOpen] = useState<boolean>(false);
  const [currentView, setCurrentView] = useState<
    'verify' | 'student' | 'admin' | 'institution' | 'tamper' | 'leaderboard'
  >(() => {
    const saved = localStorage.getItem('cert_vault_active_view_v2') as any;
    if (saved && ['verify', 'student', 'admin', 'institution', 'tamper', 'leaderboard'].includes(saved)) {
      return saved;
    }
    return 'verify';
  });

  const [isPublicVerifying, setIsPublicVerifying] = useState<boolean>(false);

  // Sync active view persistence
  useEffect(() => {
    if (isAuthenticated) {
      localStorage.setItem('cert_vault_active_view_v2', currentView);
    }
  }, [currentView, isAuthenticated]);

  // Role routing safety check on mount / refresh
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      const saved = localStorage.getItem('cert_vault_active_view_v2') as any;
      if (currentUser.role === 'student' && (saved === 'admin' || currentView === 'admin')) {
        setCurrentView('student');
      } else if (currentUser.role === 'admin' && (saved === 'student' || currentView === 'student')) {
        setCurrentView('admin');
      } else if (!saved || saved === 'verify') {
        // Default to the user's home dashboard upon fresh auth
        if (currentUser.role === 'student') setCurrentView('student');
        if (currentUser.role === 'admin') setCurrentView('admin');
      }
    }
  }, [isAuthenticated, currentUser?.role]);

  // Handle successful login
  const handleLoginSuccess = (role: UserRole) => {
    setIsPublicVerifying(false);
    if (role === 'student') {
      setCurrentView('student');
      localStorage.setItem('cert_vault_active_view_v2', 'student');
    } else if (role === 'admin') {
      setCurrentView('admin');
      localStorage.setItem('cert_vault_active_view_v2', 'admin');
    } else {
      setCurrentView('institution');
      localStorage.setItem('cert_vault_active_view_v2', 'institution');
    }
  };

  // Safe view change handler with RBAC enforcement
  const handleSafeViewChange = (
    view: 'verify' | 'student' | 'admin' | 'institution' | 'tamper' | 'leaderboard'
  ) => {
    if (view === 'admin' && currentUser?.role !== 'admin') {
      setAccessDeniedNotice({
        requiredRole: 'admin',
        title: 'Administrator Clearance Required',
        message: 'The Admin Console is restricted to university registrars, deans, and authorized credentials administrators.',
      });
      return;
    }

    if (view === 'student' && currentUser?.role !== 'student') {
      setAccessDeniedNotice({
        requiredRole: 'student',
        title: 'Student Identity Required',
        message: 'The Student Portal is restricted to verified student accounts and credentials lockers.',
      });
      return;
    }

    setCurrentView(view);
  };

  // 1. IF NOT LOGGED IN: Show Login Page as the primary entry screen
  if (!isAuthenticated) {
    if (isPublicVerifying) {
      // Public Verification Portal mode (for external verifiers / employers)
      return (
        <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
          {/* Guest Verification Top Bar */}
          <div className="bg-slate-950 border-b border-slate-800 py-2.5 px-4 sm:px-6">
            <div className="max-w-6xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <span className="font-extrabold text-white text-sm">CERT-VAULT</span>
                <span className="text-xs text-slate-400">• Public Verification Portal</span>
              </div>
              <button
                type="button"
                id="return-to-login-btn"
                onClick={() => setIsPublicVerifying(false)}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Return to Login</span>
              </button>
            </div>
          </div>

          <main className="flex-1 w-full pb-16">
            <VerificationView />
          </main>

          {selectedCertificateModal && (
            <CertificateDocument
              certificate={selectedCertificateModal}
              isModal={true}
              onClose={() => setSelectedCertificateModal(null)}
            />
          )}
        </div>
      );
    }

    return (
      <LoginPage
        onLoginSuccess={handleLoginSuccess}
        onOpenPublicVerification={() => setIsPublicVerifying(true)}
      />
    );
  }

  // 2. IF AUTHENTICATED: Show the full system with RBAC protection
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-white">
      {/* Institutional Navigation */}
      <Navbar
        currentView={currentView}
        setCurrentView={handleSafeViewChange}
        onLogoutClick={logout}
        onOpenAIChat={() => setIsAIChatOpen(true)}
      />

      {/* Main Viewport Container */}
      <main className="flex-1 w-full pb-16">
        {currentView === 'verify' && <VerificationView />}
        {currentView === 'student' && (
          currentUser?.role === 'student' ? (
            <StudentDashboard onNavigate={handleSafeViewChange} />
          ) : (
            <div className="max-w-4xl mx-auto p-8 text-center space-y-4">
              <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700">
                <h2 className="text-xl font-bold text-rose-400">Student Portal Restricted</h2>
                <p className="text-sm text-slate-400 mt-2">
                  Please authenticate with a verified Student account to view personal credential records.
                </p>
                <button
                  onClick={() => setCurrentView('admin')}
                  className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl"
                >
                  Return to Admin Console
                </button>
              </div>
            </div>
          )
        )}
        {currentView === 'admin' && (
          currentUser?.role === 'admin' ? (
            <AdminDashboard />
          ) : (
            <div className="max-w-4xl mx-auto p-8 text-center space-y-4">
              <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700">
                <h2 className="text-xl font-bold text-rose-400">Admin Console Restricted</h2>
                <p className="text-sm text-slate-400 mt-2">
                  Student credentials cannot access the Central Registrar & Oversight Console.
                </p>
                <button
                  onClick={() => setCurrentView('student')}
                  className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl"
                >
                  Return to Student Portal
                </button>
              </div>
            </div>
          )
        )}
        {currentView === 'institution' && <InstitutionDashboard />}
        {currentView === 'tamper' && <TamperPlayground />}
        {currentView === 'leaderboard' && <LeaderboardView />}
      </main>

      {/* Institutional Security Footer */}
      <footer className="w-full bg-slate-950 border-t border-slate-800 py-8 px-4 text-slate-400 text-xs no-print">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="space-y-1">
            <div className="flex items-center justify-center sm:justify-start gap-2 font-bold text-slate-200">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Digital Certificate Verification System</span>
            </div>
            <p className="text-[11px] text-slate-500 max-w-md">
              Encrypted document authentication protocol with deterministic SHA-256 integrity verification, instant QR code attestation, and university registrar audit logging.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] font-mono-code text-slate-400">
            <span className="flex items-center gap-1">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              SHA-256 Strict Avalanche Protection
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <QrCode className="w-3.5 h-3.5 text-indigo-400" />
              Dual-Format QR Encoding
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Database className="w-3.5 h-3.5 text-amber-400" />
              PostgreSQL Registry Compatible
            </span>
          </div>
        </div>

        <div className="max-w-6xl mx-auto mt-6 pt-4 border-t border-slate-900 text-center text-[10px] text-slate-600">
          Developed for academic credential verification, tamper prevention, and instant employer authenticity audits.
        </div>
      </footer>

      {/* Global Certificate Modal View */}
      {selectedCertificateModal && (
        <CertificateDocument
          certificate={selectedCertificateModal}
          isModal={true}
          onClose={() => setSelectedCertificateModal(null)}
        />
      )}

      {/* RBAC Access Denied Modal */}
      {accessDeniedNotice && (
        <AccessDeniedModal
          requiredRole={accessDeniedNotice.requiredRole}
          currentRole={currentUser?.role || 'student'}
          userName={currentUser?.name || 'User'}
          onClose={() => setAccessDeniedNotice(null)}
          onSwitchLogin={() => {
            setAccessDeniedNotice(null);
            logout();
          }}
        />
      )}

      {/* Floating AI Copilot Trigger Button */}
      {!isAIChatOpen && (
        <button
          id="floating-ai-copilot-btn"
          onClick={() => setIsAIChatOpen(true)}
          className="fixed bottom-6 right-6 z-40 px-4 py-3 bg-gradient-to-r from-indigo-600 via-indigo-500 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 text-white font-semibold text-xs rounded-2xl shadow-2xl shadow-indigo-900/50 flex items-center gap-2.5 transition-all hover:scale-105 cursor-pointer no-print border border-indigo-400/30"
          title="Open CertVault AI Copilot Assistant"
        >
          <div className="relative">
            <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          </div>
          <span className="font-bold tracking-tight">AI Copilot</span>
        </button>
      )}

      {/* AI Copilot Drawer */}
      <AIChatDrawer
        isOpen={isAIChatOpen}
        onClose={() => setIsAIChatOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <CertificateProvider>
      <AppContent />
    </CertificateProvider>
  );
}
