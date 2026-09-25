import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Zap,
  Lock,
  RotateCcw,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Info,
} from 'lucide-react';
import { useCertificate } from '../context/CertificateContext';
import { Certificate } from '../types';
import { buildCanonicalPayload, computeSHA256 } from '../utils/crypto';

export const TamperPlayground: React.FC = () => {
  const { certificates } = useCertificate();

  // Pick first active certificate as reference
  const baseCert = certificates.find((c) => c.status === 'active') || certificates[0];

  const [selectedCertId, setSelectedCertId] = useState<string>(baseCert?.id || '');
  const currentCert = certificates.find((c) => c.id === selectedCertId) || baseCert;

  // Editable fields for simulation
  const [tamperedName, setTamperedName] = useState<string>('');
  const [tamperedRoll, setTamperedRoll] = useState<string>('');
  const [tamperedGrade, setTamperedGrade] = useState<string>('');
  const [tamperedDate, setTamperedDate] = useState<string>('');

  // Hashes
  const [originalCanonical, setOriginalCanonical] = useState<string>('');
  const [tamperedCanonical, setTamperedCanonical] = useState<string>('');
  const [originalHash, setOriginalHash] = useState<string>('');
  const [computedHash, setComputedHash] = useState<string>('');
  const [isTampered, setIsTampered] = useState<boolean>(false);

  // Sync state whenever selected cert changes
  useEffect(() => {
    if (currentCert) {
      setTamperedName(currentCert.recipientName);
      setTamperedRoll(currentCert.studentRollNo);
      setTamperedGrade(currentCert.gradeOrHonors);
      setTamperedDate(currentCert.issueDate);
    }
  }, [selectedCertId, currentCert]);

  // Recalculate canonical payload & hashes in real-time
  useEffect(() => {
    if (!currentCert) return;

    const runRecalculation = async () => {
      const origCanonical = buildCanonicalPayload({
        id: currentCert.id,
        recipientName: currentCert.recipientName,
        studentRollNo: currentCert.studentRollNo,
        courseName: currentCert.courseName,
        institutionName: currentCert.institutionName,
        issueDate: currentCert.issueDate,
        gradeOrHonors: currentCert.gradeOrHonors,
      });
      const origH = await computeSHA256(origCanonical);

      const modifiedCanonical = buildCanonicalPayload({
        id: currentCert.id,
        recipientName: tamperedName,
        studentRollNo: tamperedRoll,
        courseName: currentCert.courseName,
        institutionName: currentCert.institutionName,
        issueDate: tamperedDate,
        gradeOrHonors: tamperedGrade,
      });
      const modifiedH = await computeSHA256(modifiedCanonical);

      setOriginalCanonical(origCanonical);
      setTamperedCanonical(modifiedCanonical);
      setOriginalHash(origH);
      setComputedHash(modifiedH);
      setIsTampered(origH.toLowerCase() !== modifiedH.toLowerCase());
    };

    runRecalculation();
  }, [currentCert, tamperedName, tamperedRoll, tamperedGrade, tamperedDate]);

  const handleReset = () => {
    if (currentCert) {
      setTamperedName(currentCert.recipientName);
      setTamperedRoll(currentCert.studentRollNo);
      setTamperedGrade(currentCert.gradeOrHonors);
      setTamperedDate(currentCert.issueDate);
    }
  };

  const handleTamperShortcut = (type: 'name' | 'grade' | 'date') => {
    if (type === 'name') setTamperedName(tamperedName + ' (MODIFIED)');
    if (type === 'grade') setTamperedGrade('4.00 Summa Cum Laude (FORGED)');
    if (type === 'date') setTamperedDate('2030-01-01');
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950/80 border border-indigo-700/60 text-indigo-400 text-xs font-semibold">
          <Zap className="w-4 h-4" />
          CRYPTOGRAPHIC LAB: SHA-256 INTEGRITY ENGINE
        </div>
        <h1 className="text-3xl font-extrabold text-white">
          Interactive Tamper Detection Simulator
        </h1>
        <p className="text-sm text-slate-400 max-w-2xl mx-auto">
          Test how the SHA-256 Avalanche Effect immediately exposes any unauthorized modification to student credentials, grades, or issuance dates.
        </p>
      </div>

      {/* Selector & Reset Bar */}
      <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold text-slate-300">Select Test Certificate:</label>
          <select
            id="tamper-cert-selector"
            value={selectedCertId}
            onChange={(e) => setSelectedCertId(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-white text-xs rounded-lg px-3 py-2 font-mono-code focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {certificates.map((c) => (
              <option key={c.id} value={c.id}>
                {c.id} — {c.recipientName} ({c.courseName.slice(0, 24)}...)
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleTamperShortcut('name')}
            className="px-2.5 py-1.5 bg-slate-700/70 hover:bg-slate-700 text-xs text-amber-300 rounded-lg transition-colors"
          >
            Alter Name
          </button>
          <button
            onClick={() => handleTamperShortcut('grade')}
            className="px-2.5 py-1.5 bg-slate-700/70 hover:bg-slate-700 text-xs text-amber-300 rounded-lg transition-colors"
          >
            Alter Grade
          </button>
          <button
            id="reset-tamper-btn"
            onClick={handleReset}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-xs text-slate-300 rounded-lg border border-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            Restore Genuine Data
          </button>
        </div>
      </div>

      {/* Live Comparison Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Authentic Issued Certificate Payload */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                1. Authoritative Institutional Record
              </h3>
            </div>
            <span className="text-[11px] font-mono-code text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
              IMMUTABLE
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-slate-400 block mb-1">Recipient Name:</span>
              <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 text-slate-200 font-medium">
                {currentCert?.recipientName}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-slate-400 block mb-1">Student Roll No:</span>
                <div className="p-2 bg-slate-950 rounded-lg border border-slate-800 text-slate-200 font-mono-code">
                  {currentCert?.studentRollNo}
                </div>
              </div>
              <div>
                <span className="text-slate-400 block mb-1">Issue Date:</span>
                <div className="p-2 bg-slate-950 rounded-lg border border-slate-800 text-slate-200 font-mono-code">
                  {currentCert?.issueDate}
                </div>
              </div>
            </div>

            <div>
              <span className="text-slate-400 block mb-1">Grade / Honors:</span>
              <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 text-slate-200">
                {currentCert?.gradeOrHonors}
              </div>
            </div>

            <div>
              <span className="text-slate-400 block mb-1">Canonical Payload String:</span>
              <div className="p-2 bg-slate-950/70 rounded-lg border border-slate-800 text-[10px] font-mono-code text-slate-400 break-all select-all">
                {originalCanonical}
              </div>
            </div>

            <div className="pt-2">
              <span className="text-emerald-400 font-semibold block mb-1 text-[11px]">
                Official SHA-256 Checksum:
              </span>
              <div className="p-2.5 bg-slate-950 rounded-lg border border-emerald-900/50 text-emerald-400 font-mono-code text-[11px] break-all select-all">
                {originalHash}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Editable Simulated Document (Attacker / Modified) */}
        <div className={`border rounded-2xl p-6 space-y-4 transition-colors ${
          isTampered
            ? 'bg-rose-950/20 border-rose-500/60'
            : 'bg-slate-900/90 border-slate-800'
        }`}>
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                2. Live Data Under Verification (Editable)
              </h3>
            </div>
            <span className={`text-[11px] font-mono-code px-2 py-0.5 rounded ${
              isTampered
                ? 'bg-rose-950 text-rose-300 border border-rose-800'
                : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
            }`}>
              {isTampered ? 'MODIFIED' : 'UNTOUCHED'}
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-slate-300 font-medium block mb-1">
                Edit Recipient Name:
              </label>
              <input
                id="tamper-input-name"
                type="text"
                value={tamperedName}
                onChange={(e) => setTamperedName(e.target.value)}
                className="w-full p-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-medium focus:ring-1 focus:ring-amber-400 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-300 font-medium block mb-1">
                  Edit Roll No:
                </label>
                <input
                  id="tamper-input-roll"
                  type="text"
                  value={tamperedRoll}
                  onChange={(e) => setTamperedRoll(e.target.value)}
                  className="w-full p-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono-code focus:ring-1 focus:ring-amber-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-slate-300 font-medium block mb-1">
                  Edit Issue Date:
                </label>
                <input
                  id="tamper-input-date"
                  type="text"
                  value={tamperedDate}
                  onChange={(e) => setTamperedDate(e.target.value)}
                  className="w-full p-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono-code focus:ring-1 focus:ring-amber-400 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-300 font-medium block mb-1">
                Edit Grade / Honors:
              </label>
              <input
                id="tamper-input-grade"
                type="text"
                value={tamperedGrade}
                onChange={(e) => setTamperedGrade(e.target.value)}
                className="w-full p-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:ring-1 focus:ring-amber-400 focus:outline-none"
              />
            </div>

            <div>
              <span className="text-slate-400 block mb-1">Live Computed Canonical String:</span>
              <div className="p-2 bg-slate-950/70 rounded-lg border border-slate-800 text-[10px] font-mono-code text-slate-400 break-all select-all">
                {tamperedCanonical}
              </div>
            </div>

            <div className="pt-2">
              <span className={`block mb-1 text-[11px] font-semibold ${isTampered ? 'text-rose-400' : 'text-emerald-400'}`}>
                Dynamically Computed SHA-256:
              </span>
              <div className={`p-2.5 bg-slate-950 rounded-lg border font-mono-code text-[11px] break-all select-all ${
                isTampered ? 'border-rose-800/80 text-rose-400' : 'border-emerald-900/50 text-emerald-400'
              }`}>
                {computedHash}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Verification Verdict Banner */}
      <div className={`rounded-2xl p-6 border flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl ${
        isTampered
          ? 'bg-rose-950/40 border-rose-600/80 text-rose-200'
          : 'bg-emerald-950/40 border-emerald-600/80 text-emerald-200'
      }`}>
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
            isTampered ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white'
          }`}>
            {isTampered ? <ShieldAlert className="w-7 h-7" /> : <ShieldCheck className="w-7 h-7" />}
          </div>
          <div>
            <h4 className="text-base sm:text-lg font-bold">
              {isTampered
                ? 'CRITICAL ALERT: HASH MISMATCH DETECTED!'
                : 'CRYPTOGRAPHIC INTEGRITY: 100% MATCH'}
            </h4>
            <p className="text-xs sm:text-sm mt-0.5 opacity-90">
              {isTampered
                ? 'Even a 1-character discrepancy completely transforms the 256-bit mathematical digest. The credential verification engine will immediately reject this certificate!'
                : 'The payload exactly matches the registered institutional block. Integrity verified.'}
            </p>
          </div>
        </div>

        {isTampered && (
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shrink-0 shadow transition-colors"
          >
            Revert Tamper
          </button>
        )}
      </div>

      {/* Educational Explainer */}
      <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-5 text-xs text-slate-300 space-y-2">
        <div className="flex items-center gap-2 text-slate-200 font-semibold text-sm">
          <Info className="w-4 h-4 text-indigo-400" />
          How SHA-256 Tamper Protection Operates in this System
        </div>
        <p className="leading-relaxed">
          When an educational institution issues a certificate, its immutable metadata is canonicalized into a strictly ordered byte sequence and digested using the NIST-standard <strong>SHA-256 algorithm</strong> (producing a 256-bit hexadecimal string). This hash is encoded directly into the certificate's verification QR code and stored in the authoritative registry.
        </p>
        <p className="leading-relaxed">
          Because cryptographic hash functions exhibit the <strong>strict avalanche effect</strong>, flipping even a single bit in the recipient's name or grade alters roughly 50% of the resulting output bits. No imposter or forged document can ever produce a matching hash without passing through the official issuing authority.
        </p>
      </div>
    </div>
  );
};
