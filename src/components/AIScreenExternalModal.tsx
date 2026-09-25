import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  X,
  FileText,
  User,
  Building,
  Check,
} from 'lucide-react';
import { Certificate } from '../types';
import { screenExternalCertificate, ScreenExternalResult } from '../utils/aiService';

interface AIScreenExternalModalProps {
  certificate: Certificate;
  onClose: () => void;
  onApproveDirect?: () => void;
}

export const AIScreenExternalModal: React.FC<AIScreenExternalModalProps> = ({
  certificate,
  onClose,
  onApproveDirect,
}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [screenResult, setScreenResult] = useState<ScreenExternalResult | null>(null);

  useEffect(() => {
    let mounted = true;
    async function screen() {
      setLoading(true);
      try {
        const res = await screenExternalCertificate({
          recipientName: certificate.recipientName,
          studentRollNo: certificate.studentRollNo,
          institutionName: certificate.institutionName,
          courseName: certificate.courseName,
          skills: certificate.skills || [],
          fileName: certificate.externalFileName,
        });
        if (mounted) setScreenResult(res);
      } catch (err) {
        console.error(err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    screen();
    return () => {
      mounted = false;
    };
  }, [certificate.id]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-8 flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950/80 p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-semibold tracking-wider uppercase px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Registrar Pre-Screen
                </span>
                <span className="text-xs text-slate-400 font-mono">{certificate.id}</span>
              </div>
              <h2 className="text-lg font-bold text-white mt-0.5">
                AI External Certificate Inspection
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Submission Overview Card */}
          <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Candidate:</span>
              <span className="text-white font-semibold">{certificate.recipientName} ({certificate.studentRollNo})</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Claimed Institution:</span>
              <span className="text-white font-semibold">{certificate.institutionName}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Course / Qualification:</span>
              <span className="text-white font-semibold">{certificate.courseName}</span>
            </div>
            {certificate.externalFileName && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Uploaded File:</span>
                <span className="font-mono text-emerald-400">{certificate.externalFileName}</span>
              </div>
            )}
          </div>

          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-12 h-12 rounded-full border-4 border-indigo-500/20 border-t-emerald-400 animate-spin" />
              <p className="text-xs text-slate-400">
                Gemini AI is evaluating institution accreditation status, curriculum validity, and tamper indicators...
              </p>
            </div>
          ) : screenResult ? (
            <>
              {/* Recommendation Banner */}
              <div
                className={`p-4 rounded-xl border flex items-center justify-between ${
                  screenResult.recommendation === 'APPROVE'
                    ? 'bg-emerald-950/40 border-emerald-800/80 text-emerald-200'
                    : screenResult.recommendation === 'REJECT'
                    ? 'bg-rose-950/40 border-rose-800 text-rose-200'
                    : 'bg-amber-950/40 border-amber-800/80 text-amber-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  {screenResult.recommendation === 'APPROVE' ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                  ) : screenResult.recommendation === 'REJECT' ? (
                    <XCircle className="w-6 h-6 text-rose-400 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0" />
                  )}
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider">
                      Recommendation: {screenResult.recommendation}
                    </div>
                    <div className="text-xs text-slate-300 mt-0.5">
                      Risk Rating: <span className="font-bold">{screenResult.riskRating}</span> • Confidence: <span className="font-bold">{screenResult.confidence}%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Analysis Summary */}
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Inspection Summary
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed bg-slate-800/40 border border-slate-700/60 p-3 rounded-xl">
                  {screenResult.summary}
                </p>
              </div>

              {/* Validation Notes */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Validation Checklist
                </h4>
                <div className="space-y-1.5">
                  {screenResult.validationNotes.map((note, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg bg-slate-800/30 border border-slate-700/50 flex items-start gap-2 text-xs text-slate-300"
                    >
                      <Check className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                      <span>{note}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reviewer Inquiries */}
              {screenResult.suggestedReviewerQuestions && screenResult.suggestedReviewerQuestions.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Suggested Registrar Inquiries
                  </h4>
                  <ul className="space-y-1 text-xs text-slate-400 list-disc list-inside bg-slate-800/30 border border-slate-700/50 p-3 rounded-xl">
                    {screenResult.suggestedReviewerQuestions.map((q, idx) => (
                      <li key={idx}>{q}</li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          ) : null}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-500 font-mono text-[10px]">
            Powered by Google Gemini 3.8 Flash
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            {onApproveDirect && (
              <button
                onClick={() => {
                  onApproveDirect();
                  onClose();
                }}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow"
              >
                <Check className="w-4 h-4" />
                <span>Approve into Ledger</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
