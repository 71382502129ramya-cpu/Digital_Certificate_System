import React from 'react';
import { ShieldAlert, Lock, ArrowRight, X } from 'lucide-react';
import { UserRole } from '../types';

interface AccessDeniedModalProps {
  requiredRole: UserRole;
  currentRole: UserRole;
  userName: string;
  onClose: () => void;
  onSwitchLogin: () => void;
}

export const AccessDeniedModal: React.FC<AccessDeniedModalProps> = ({
  requiredRole,
  currentRole,
  userName,
  onClose,
  onSwitchLogin,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div className="w-full max-w-md bg-slate-900 border border-rose-800/80 rounded-2xl p-6 sm:p-7 shadow-2xl space-y-5 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg"
          title="Dismiss"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 text-rose-400">
          <div className="w-12 h-12 rounded-xl bg-rose-950/80 border border-rose-800 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-6 h-6 text-rose-400" />
          </div>
          <div>
            <span className="text-[10px] font-mono-code uppercase tracking-wider px-2 py-0.5 rounded bg-rose-950 text-rose-400 border border-rose-800/60 font-bold">
              Access Restricted • RBAC Security
            </span>
            <h3 className="text-lg font-bold text-white mt-1">
              {requiredRole === 'admin' ? 'Administrator Clearance Required' : 'Student Identity Required'}
            </h3>
          </div>
        </div>

        <div className="text-xs text-slate-300 space-y-2 leading-relaxed bg-slate-950/70 p-3.5 rounded-xl border border-slate-800">
          <p>
            You are currently authenticated as <strong className="text-white">{userName}</strong> ({currentRole.toUpperCase()}).
          </p>
          <p className="text-slate-400">
            {requiredRole === 'admin'
              ? 'The Admin Console is restricted to university registrars, deans, and credential authorities.'
              : 'The Student Portal is restricted to student credential lockers and personal degree wallets.'}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-1/2 py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-colors"
          >
            Return to Dashboard
          </button>
          <button
            type="button"
            onClick={onSwitchLogin}
            className="w-full sm:w-1/2 py-2.5 px-4 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-rose-950/60 transition-colors flex items-center justify-center gap-1.5"
          >
            <span>Switch Role Login</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
