import React from 'react';
import {
  Trophy,
  Award,
  Medal,
  Star,
  CheckCircle2,
  TrendingUp,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { useCertificate } from '../context/CertificateContext';

export const LeaderboardView: React.FC = () => {
  const { allUsers, certificates, events } = useCertificate();

  // Filter students and sort by credits descending
  const students = allUsers
    .filter((u) => u.role === 'student')
    .map((student) => {
      const studentCerts = certificates.filter(
        (c) =>
          (c.recipientEmail.toLowerCase() === student.email.toLowerCase() ||
           c.studentRollNo === student.studentRollNo) &&
          c.status === 'active'
      );
      const studentEvents = events.filter((e) =>
        e.registeredStudentIds.includes(student.id)
      );

      return {
        ...student,
        verifiedCount: studentCerts.length,
        eventsCount: studentEvents.length,
        calculatedScore: (student.credits || 900) + studentCerts.length * 100,
      };
    })
    .sort((a, b) => b.calculatedScore - a.calculatedScore);

  const topThree = students.slice(0, 3);

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Title */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-950/80 border border-amber-800/60 text-amber-400 text-xs font-semibold">
          <Trophy className="w-4 h-4" />
          CAMPUS MERIT & CREDENTIAL LEADERBOARD
        </div>
        <h1 className="text-3xl font-extrabold text-white">
          Academic Achiever Standings
        </h1>
        <p className="text-sm text-slate-400 max-w-xl mx-auto">
          Rankings computed from verified tamper-proof credentials, honor distinctions, and certified hackathon completions.
        </p>
      </div>

      {/* Podium Showcase for Top 3 */}
      {topThree.length >= 3 && (
        <div className="grid grid-cols-3 gap-3 sm:gap-6 items-end pt-8 pb-4 max-w-3xl mx-auto">
          {/* Rank 2 */}
          <div className="flex flex-col items-center">
            <div className="relative mb-2">
              <img
                src={topThree[1].avatarUrl}
                alt={topThree[1].name}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 border-slate-400 object-cover shadow-xl"
              />
              <span className="absolute -top-2 -right-1 w-6 h-6 rounded-full bg-slate-300 text-slate-900 font-bold text-xs flex items-center justify-center shadow">
                2
              </span>
            </div>
            <span className="font-bold text-xs sm:text-sm text-white text-center truncate w-full">
              {topThree[1].name}
            </span>
            <span className="text-[11px] text-slate-400 font-mono-code">{topThree[1].calculatedScore} pts</span>
            <div className="w-full h-24 sm:h-32 bg-slate-800/80 border-t-2 border-slate-400 rounded-t-xl mt-3 flex flex-col items-center justify-center p-2 text-center shadow-lg">
              <Medal className="w-6 h-6 text-slate-300 mb-1" />
              <span className="text-[10px] text-slate-300 font-semibold">{topThree[1].verifiedCount} Credentials</span>
            </div>
          </div>

          {/* Rank 1 (Tallest) */}
          <div className="flex flex-col items-center">
            <div className="relative mb-2">
              <div className="absolute -top-6 left-1/2 -translate-x-1/2">
                <Trophy className="w-6 h-6 text-amber-400 animate-bounce" />
              </div>
              <img
                src={topThree[0].avatarUrl}
                alt={topThree[0].name}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-amber-400 object-cover shadow-2xl"
              />
              <span className="absolute -top-2 -right-1 w-7 h-7 rounded-full bg-amber-400 text-amber-950 font-black text-xs flex items-center justify-center shadow-md">
                1
              </span>
            </div>
            <span className="font-bold text-sm sm:text-base text-white text-center truncate w-full">
              {topThree[0].name}
            </span>
            <span className="text-xs text-amber-400 font-mono-code font-bold">{topThree[0].calculatedScore} pts</span>
            <div className="w-full h-32 sm:h-44 bg-gradient-to-b from-amber-950/60 to-slate-800/80 border-t-4 border-amber-400 rounded-t-xl mt-3 flex flex-col items-center justify-center p-2 text-center shadow-xl">
              <Star className="w-7 h-7 text-amber-400 fill-amber-400 mb-1" />
              <span className="text-xs text-amber-200 font-bold">Valedictorian</span>
              <span className="text-[10px] text-slate-300 mt-0.5">{topThree[0].verifiedCount} Verified Degrees</span>
            </div>
          </div>

          {/* Rank 3 */}
          <div className="flex flex-col items-center">
            <div className="relative mb-2">
              <img
                src={topThree[2].avatarUrl}
                alt={topThree[2].name}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 border-amber-700 object-cover shadow-xl"
              />
              <span className="absolute -top-2 -right-1 w-6 h-6 rounded-full bg-amber-700 text-white font-bold text-xs flex items-center justify-center shadow">
                3
              </span>
            </div>
            <span className="font-bold text-xs sm:text-sm text-white text-center truncate w-full">
              {topThree[2].name}
            </span>
            <span className="text-[11px] text-slate-400 font-mono-code">{topThree[2].calculatedScore} pts</span>
            <div className="w-full h-20 sm:h-24 bg-slate-800/80 border-t-2 border-amber-700 rounded-t-xl mt-3 flex flex-col items-center justify-center p-2 text-center shadow-lg">
              <Medal className="w-6 h-6 text-amber-600 mb-1" />
              <span className="text-[10px] text-slate-300 font-semibold">{topThree[2].verifiedCount} Credentials</span>
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between text-xs">
          <span className="font-semibold text-white">Full Cohort Leaderboard</span>
          <span className="text-slate-400 font-mono-code">Ranked by Academic Verification Score</span>
        </div>

        <div className="divide-y divide-slate-800/80">
          {students.map((student, idx) => (
            <div
              key={student.id}
              className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-800/40 transition-colors"
            >
              <div className="flex items-center gap-4">
                <span className={`w-8 h-8 rounded-full font-bold text-xs flex items-center justify-center font-mono-code shrink-0 ${
                  idx === 0 ? 'bg-amber-400 text-amber-950 font-black' :
                  idx === 1 ? 'bg-slate-300 text-slate-900' :
                  idx === 2 ? 'bg-amber-700 text-white' :
                  'bg-slate-800 text-slate-400 border border-slate-700'
                }`}>
                  #{idx + 1}
                </span>

                <img
                  src={student.avatarUrl}
                  alt={student.name}
                  className="w-11 h-11 rounded-full object-cover border border-slate-700 shrink-0"
                />

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-white text-sm">{student.name}</h3>
                    <span className="text-[11px] font-mono-code text-slate-400">
                      ({student.studentRollNo})
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">{student.department}</p>
                </div>
              </div>

              <div className="flex items-center gap-6 justify-between sm:justify-end text-xs">
                <div className="text-center sm:text-right">
                  <span className="text-[11px] text-slate-400 block font-medium">Verified Credentials</span>
                  <span className="font-bold text-emerald-400 flex items-center justify-center sm:justify-end gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    {student.verifiedCount}
                  </span>
                </div>

                <div className="text-center sm:text-right">
                  <span className="text-[11px] text-slate-400 block font-medium">Events</span>
                  <span className="font-bold text-indigo-400">{student.eventsCount}</span>
                </div>

                <div className="text-center sm:text-right min-w-[90px]">
                  <span className="text-[11px] text-slate-400 block font-medium">Total Merit</span>
                  <span className="font-black text-white font-mono-code text-sm">
                    {student.calculatedScore}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
