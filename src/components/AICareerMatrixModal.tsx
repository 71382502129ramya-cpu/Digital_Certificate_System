import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Trophy,
  Briefcase,
  Copy,
  Check,
  X,
  Target,
  GraduationCap,
  Layers,
  ChevronRight,
  TrendingUp,
  Cpu,
} from 'lucide-react';
import { Certificate, User } from '../types';
import { generateStudentCareerInsights, CareerInsightsResult } from '../utils/aiService';

interface AICareerMatrixModalProps {
  user: User;
  certificates: Certificate[];
  onClose: () => void;
}

export const AICareerMatrixModal: React.FC<AICareerMatrixModalProps> = ({
  user,
  certificates,
  onClose,
}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [insights, setInsights] = useState<CareerInsightsResult | null>(null);
  const [copiedBulletIndex, setCopiedBulletIndex] = useState<number | null>(null);
  const [copiedSummary, setCopiedSummary] = useState<boolean>(false);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        const res = await generateStudentCareerInsights(user.name, certificates);
        if (mounted) setInsights(res);
      } catch (err) {
        console.error(err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [user.name, certificates.length]);

  const handleCopyBullet = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedBulletIndex(idx);
    setTimeout(() => setCopiedBulletIndex(null), 2000);
  };

  const handleCopySummary = () => {
    if (!insights) return;
    const full = `${insights.executiveHeadline}\n\n${insights.summary}\n\nKey Competencies:\n${insights.topCompetencies.map((c) => `- ${c.area} (${c.proficiency}): ${c.skills.join(', ')}`).join('\n')}`;
    navigator.clipboard.writeText(full);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-8 flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950/70 p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-semibold tracking-wider uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  AI Career & Competency Matrix
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {certificates.length} Verified Certificates
                </span>
              </div>
              <h2 className="text-lg font-bold text-white mt-0.5">
                {user.name}’s Verified Talent Intelligence
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

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full border-4 border-emerald-500/20 border-t-indigo-400 animate-spin" />
              <div className="space-y-1">
                <h3 className="text-base font-semibold text-white">Synthesizing Credential Portfolio</h3>
                <p className="text-xs text-slate-400 max-w-sm">
                  Gemini AI is parsing course curricula, grade levels, and certified technical domains to assemble your market-ready profile...
                </p>
              </div>
            </div>
          ) : insights ? (
            <>
              {/* Executive Headline & Bio */}
              <div className="p-5 rounded-xl bg-gradient-to-r from-slate-900 to-indigo-950/40 border border-indigo-900/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5" />
                    Market Readiness Profile
                  </span>
                  <button
                    onClick={handleCopySummary}
                    className="text-xs text-slate-400 hover:text-emerald-300 flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    {copiedSummary ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedSummary ? 'Copied' : 'Copy Headline & Bio'}</span>
                  </button>
                </div>
                <h3 className="text-base font-bold text-white">{insights.executiveHeadline}</h3>
                <p className="text-xs text-slate-300 leading-relaxed">{insights.summary}</p>
              </div>

              {/* Verified Competencies Matrix */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-emerald-400" />
                  Verified Technical Competencies
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {insights.topCompetencies.map((comp, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/80 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
                            {comp.proficiency}
                          </span>
                        </div>
                        <h5 className="text-xs font-bold text-white mb-2">{comp.area}</h5>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {comp.skills.map((s, si) => (
                          <span
                            key={si}
                            className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300 font-mono"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* LinkedIn & Resume Ready Bullet Points */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-indigo-400" />
                    Verified Resume & LinkedIn Experience Bullets
                  </h4>
                  <span className="text-[10px] text-slate-500">Click icon to copy bullet</span>
                </div>
                <div className="space-y-2">
                  {insights.linkedInBulletPoints.map((bullet, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/60 flex items-start justify-between gap-3 group hover:border-slate-600 transition-colors"
                    >
                      <p className="text-xs text-slate-200 leading-relaxed flex-1">
                        • {bullet}
                      </p>
                      <button
                        onClick={() => handleCopyBullet(bullet, idx)}
                        className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer shrink-0"
                        title="Copy bullet point"
                      >
                        {copiedBulletIndex === idx ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Target Roles & Next Milestone Credentials */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-2">
                  <h5 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-emerald-400" />
                    Target Industry Roles
                  </h5>
                  <div className="flex flex-wrap gap-1.5">
                    {insights.targetJobRoles.map((role, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-lg bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-xs font-medium"
                      >
                        {role}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-2">
                  <h5 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
                    Recommended Next Milestones
                  </h5>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {insights.recommendedNextCredentials.map((rec, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <ChevronRight className="w-3 h-3 text-indigo-400 shrink-0" />
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </>
          ) : null}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-500 font-mono text-[10px]">
            Synthesized via Gemini AI • Academic Talent Engine
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
