import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Sparkles,
  Lock,
  Cpu,
  FileText,
  X,
  RefreshCw,
  Download,
  Share2,
  Copy,
  Check,
} from 'lucide-react';
import { Certificate } from '../types';
import { analyzeCertificateForensics, ForensicAuditResult } from '../utils/aiService';

interface AIForensicAuditModalProps {
  certificate: Certificate;
  isTampered?: boolean;
  computedHash?: string;
  onClose: () => void;
}

export const AIForensicAuditModal: React.FC<AIForensicAuditModalProps> = ({
  certificate,
  isTampered = false,
  computedHash,
  onClose,
}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [auditResult, setAuditResult] = useState<ForensicAuditResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedReport, setCopiedReport] = useState<boolean>(false);

  const fetchAudit = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await analyzeCertificateForensics(certificate, isTampered, computedHash);
      setAuditResult(res);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to complete forensic audit');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAudit();
  }, [certificate.id, isTampered, computedHash]);

  const handleCopyReport = () => {
    if (!auditResult) return;
    const text = `=== CERT-VAULT AI FORENSIC AUDIT REPORT ===
Certificate ID: ${certificate.id}
Recipient: ${certificate.recipientName} (${certificate.studentRollNo || 'N/A'})
Course: ${certificate.courseName}
Institution: ${certificate.institutionName}
Verdict: ${auditResult.verdict}
Trust Score: ${auditResult.trustScore}/100 (Risk: ${auditResult.riskLevel})
Summary: ${auditResult.summary}

Security Checks:
${auditResult.checks.map((c) => `[${c.status}] ${c.name}: ${c.detail}`).join('\n')}

Recommendations:
${auditResult.recommendations.map((r) => `• ${r}`).join('\n')}

Audited via CertVault Gemini Forensic Engine`;

    navigator.clipboard.writeText(text);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-8 flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950/70 p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono tracking-wider font-semibold uppercase px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  AI Forensic Engine
                </span>
                <span className="text-xs text-slate-400 font-mono">{certificate.id}</span>
              </div>
              <h2 className="text-lg font-bold text-white mt-0.5">
                Cryptographic & Authenticity Audit
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchAudit}
              disabled={loading}
              className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              title="Re-run Forensic Analysis"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center text-center space-y-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-indigo-500/20 border-t-emerald-400 animate-spin" />
                <Cpu className="w-6 h-6 text-indigo-400 absolute inset-0 m-auto" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-semibold text-white">Analyzing Credential Ledger</h3>
                <p className="text-xs text-slate-400 max-w-sm">
                  Querying Gemini 3.8 Flash model, auditing SHA-256 entropy, validating registrar authority, and checking tamper avalanche consistency...
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="p-6 rounded-xl bg-rose-950/40 border border-rose-800 text-center space-y-3">
              <AlertTriangle className="w-8 h-8 text-rose-400 mx-auto" />
              <p className="text-sm text-rose-200">{error}</p>
              <button
                onClick={fetchAudit}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-lg"
              >
                Retry Audit
              </button>
            </div>
          ) : auditResult ? (
            <>
              {/* Verdict Banner & Score Gauge */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div
                  className={`md:col-span-2 p-5 rounded-xl border flex flex-col justify-between ${
                    auditResult.verdict === 'AUTHENTIC'
                      ? 'bg-emerald-950/30 border-emerald-800/80 text-emerald-200'
                      : auditResult.verdict === 'TAMPERED'
                      ? 'bg-rose-950/40 border-rose-800 text-rose-200'
                      : 'bg-amber-950/30 border-amber-800/80 text-amber-200'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    {auditResult.verdict === 'AUTHENTIC' ? (
                      <ShieldCheck className="w-6 h-6 text-emerald-400" />
                    ) : auditResult.verdict === 'TAMPERED' ? (
                      <ShieldAlert className="w-6 h-6 text-rose-400" />
                    ) : (
                      <AlertTriangle className="w-6 h-6 text-amber-400" />
                    )}
                    <span className="font-extrabold tracking-wide text-sm uppercase">
                      VERDICT: {auditResult.verdict}
                    </span>
                    <span
                      className={`ml-auto text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        auditResult.riskLevel === 'LOW'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : auditResult.riskLevel === 'CRITICAL'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      }`}
                    >
                      Risk: {auditResult.riskLevel}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{auditResult.summary}</p>
                </div>

                {/* Score Dial Card */}
                <div className="bg-slate-800/60 border border-slate-700/80 rounded-xl p-4 flex flex-col items-center justify-center text-center">
                  <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-1">
                    AI Authenticity Score
                  </div>
                  <div className="relative flex items-center justify-center my-1">
                    <span
                      className={`text-4xl font-extrabold font-mono ${
                        auditResult.trustScore >= 80
                          ? 'text-emerald-400'
                          : auditResult.trustScore >= 50
                          ? 'text-amber-400'
                          : 'text-rose-400'
                      }`}
                    >
                      {auditResult.trustScore}
                    </span>
                    <span className="text-slate-500 text-sm font-semibold ml-1">/100</span>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    {auditResult.trustScore >= 80
                      ? 'Cryptographically Sound'
                      : auditResult.trustScore >= 50
                      ? 'Manual Verification Advised'
                      : 'Severe Discrepancy Found'}
                  </span>
                </div>
              </div>

              {/* Forensic Security Checklist */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-indigo-400" />
                  Multidimensional Cryptographic Inspection Matrix
                </h4>
                <div className="space-y-2">
                  {auditResult.checks.map((check, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/70 flex items-start gap-3"
                    >
                      {check.status === 'PASS' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                      ) : check.status === 'WARN' ? (
                        <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-white">{check.name}</span>
                          <span
                            className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded ${
                              check.status === 'PASS'
                                ? 'text-emerald-300 bg-emerald-950/60'
                                : check.status === 'WARN'
                                ? 'text-amber-300 bg-amber-950/60'
                                : 'text-rose-300 bg-rose-950/60'
                            }`}
                          >
                            {check.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                          {check.detail}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Forensic Observations & Recommendations */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {auditResult.forensicObservations && auditResult.forensicObservations.length > 0 && (
                  <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-2">
                    <h5 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <Cpu className="w-3.5 h-3.5 text-indigo-400" />
                      Forensic Observations
                    </h5>
                    <ul className="space-y-1.5 text-[11px] text-slate-400 list-disc list-inside">
                      {auditResult.forensicObservations.map((obs, i) => (
                        <li key={i}>{obs}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {auditResult.recommendations && auditResult.recommendations.length > 0 && (
                  <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-2">
                    <h5 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-emerald-400" />
                      Officer Recommendations
                    </h5>
                    <ul className="space-y-1.5 text-[11px] text-slate-400 list-disc list-inside">
                      {auditResult.recommendations.map((rec, i) => (
                        <li key={i}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </>
          ) : null}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs">
          <div className="text-slate-500 font-mono text-[10px]">
            Powered by Google Gemini 3.8 Flash • CertVault Secure Node
          </div>

          <div className="flex items-center gap-2">
            {auditResult && (
              <button
                type="button"
                onClick={handleCopyReport}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedReport ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                    <span>Copy Audit Report</span>
                  </>
                )}
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              Close Audit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
