import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  Mail,
  Eye,
  EyeOff,
  Award,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Search,
  KeyRound,
  Building2,
} from 'lucide-react';
import { useCertificate } from '../context/CertificateContext';
import { UserRole } from '../types';

interface LoginPageProps {
  onLoginSuccess: (role: UserRole) => void;
  onOpenPublicVerification?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  onOpenPublicVerification,
}) => {
  const { login, allUsers } = useCertificate();

  const [selectedRole, setSelectedRole] = useState<UserRole>('student');
  const [emailOrUsername, setEmailOrUsername] = useState<string>('aarav.sharma@apex.edu');
  const [password, setPassword] = useState<string>('password123');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Quick fill helper
  const handleSelectRole = (role: UserRole) => {
    setSelectedRole(role);
    setErrorMessage(null);
    if (role === 'student') {
      setEmailOrUsername('aarav.sharma@apex.edu');
      setPassword('password123');
    } else if (role === 'admin') {
      setEmailOrUsername('admin.vance@apex.edu');
      setPassword('password123');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    setTimeout(() => {
      const result = login(emailOrUsername, password, selectedRole);
      setIsLoading(false);

      if (result.success && result.user) {
        onLoginSuccess(result.user.role);
      } else {
        setErrorMessage(result.message || 'Authentication failed. Please verify your credentials.');
      }
    }, 400);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden selection:bg-emerald-500 selection:text-white">
      {/* Background Ambience & Security Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black pointer-events-none opacity-80" />
      <div className="absolute inset-0 bg-guilloche opacity-15 pointer-events-none" />

      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* CERT-VAULT Logo & Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center p-1 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-indigo-600 shadow-xl shadow-emerald-950/60">
            <div className="w-16 h-16 rounded-[14px] bg-slate-950 flex items-center justify-center border border-emerald-500/30">
              <ShieldCheck className="w-9 h-9 text-emerald-400" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-center gap-2">
              <span className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                CERT-VAULT
              </span>
              <span className="text-xs font-mono-code px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-700/60 text-emerald-400 font-bold">
                SHA-256
              </span>
            </div>
            <h1 className="text-base sm:text-lg font-bold text-slate-200 mt-1">
              Digital Certificate Verification System
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Secure Credential Verification & Management
            </p>
          </div>
        </div>

        {/* Main Authentication Card */}
        <div className="bg-slate-900/90 border border-slate-800 backdrop-blur-xl rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
          {/* Role Selection Tabs */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-2">
              Select Identity Role
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 border border-slate-800 rounded-xl">
              <button
                type="button"
                id="login-role-student"
                onClick={() => handleSelectRole('student')}
                className={`py-2.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  selectedRole === 'student'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <Award className="w-4 h-4" />
                Student
              </button>

              <button
                type="button"
                id="login-role-admin"
                onClick={() => handleSelectRole('admin')}
                className={`py-2.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  selectedRole === 'admin'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <Sliders className="w-4 h-4" />
                Admin
              </button>
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs flex items-start gap-2.5 animate-fadeIn">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                {selectedRole === 'student'
                  ? 'Institutional Email or Roll Number'
                  : 'Administrator ID or Email'}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="login-email-input"
                  type="text"
                  required
                  value={emailOrUsername}
                  onChange={(e) => setEmailOrUsername(e.target.value)}
                  placeholder={
                    selectedRole === 'student'
                      ? 'e.g. aarav.sharma@apex.edu or 2021CS042'
                      : 'e.g. admin.vance@apex.edu'
                  }
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono-code"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-300 block">
                  Password
                </label>
                <span className="text-[10px] text-slate-500">
                  Demo default: password123
                </span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="login-password-input"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter security password"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono-code"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              id="login-submit-button"
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-emerald-950/60 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  Login as {selectedRole === 'student' ? 'Student' : 'Admin'}
                  <ArrowRight className="w-4 h-4 ml-1" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials One-Click Badges */}
          <div className="pt-4 border-t border-slate-800/80 space-y-2.5">
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Quick Test Logins:
              </span>
              <span className="text-[10px] text-slate-500">Auto-fill & switch</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                id="quick-student-login-btn"
                onClick={() => handleSelectRole('student')}
                className={`p-2 rounded-xl text-left border text-xs transition-all ${
                  selectedRole === 'student'
                    ? 'bg-slate-800/90 border-emerald-600/70 text-emerald-300'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="font-bold flex items-center justify-between text-[11px]">
                  <span>👨‍🎓 Aarav Sharma</span>
                  <span className="text-[10px] font-mono-code px-1.5 rounded bg-emerald-950 text-emerald-400">
                    Student
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 font-mono-code truncate mt-0.5">
                  aarav.sharma@apex.edu
                </div>
              </button>

              <button
                type="button"
                id="quick-admin-login-btn"
                onClick={() => handleSelectRole('admin')}
                className={`p-2 rounded-xl text-left border text-xs transition-all ${
                  selectedRole === 'admin'
                    ? 'bg-slate-800/90 border-emerald-600/70 text-emerald-300'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="font-bold flex items-center justify-between text-[11px]">
                  <span>👨‍💼 Dr. Alistair Vance</span>
                  <span className="text-[10px] font-mono-code px-1.5 rounded bg-indigo-950 text-indigo-400">
                    Admin
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 font-mono-code truncate mt-0.5">
                  admin.vance@apex.edu
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Public Verification Link */}
        {onOpenPublicVerification && (
          <div className="text-center pt-2">
            <button
              type="button"
              id="public-verify-direct-link"
              onClick={onOpenPublicVerification}
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-emerald-400 transition-colors font-medium cursor-pointer"
            >
              <Search className="w-3.5 h-3.5" />
              Need to verify a credential without logging in? Access Public Verification Portal
            </button>
          </div>
        )}

        {/* Security Compliance Badges */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-[10px] text-slate-500 font-mono-code">
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
            SHA-256 Avalanche Protection
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
            Role-Based Access Control (RBAC)
          </span>
        </div>
      </div>
    </div>
  );
};
