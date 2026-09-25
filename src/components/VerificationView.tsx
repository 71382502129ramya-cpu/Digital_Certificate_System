import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  QrCode,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  FileCheck,
  Hash,
  ArrowRight,
  ExternalLink,
  Clock,
  MapPin,
  CheckCircle2,
  XCircle,
  Camera,
  UploadCloud,
  FileText,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { useCertificate } from '../context/CertificateContext';
import { Certificate, VerificationLog } from '../types';
import { CertificateDocument } from './CertificateDocument';
import { AIForensicAuditModal } from './AIForensicAuditModal';
import { computeFileSHA256, formatHashDisplay } from '../utils/crypto';

export const VerificationView: React.FC = () => {
  const {
    certificates,
    verifyCertificateById,
    logs,
    selectedCertificateModal,
    setSelectedCertificateModal,
  } = useCertificate();

  const [queryInput, setQueryInput] = useState<string>('');
  const [activeVerifyTab, setActiveVerifyTab] = useState<'id' | 'qr' | 'file'>('id');
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [aiAuditModalOpen, setAiAuditModalOpen] = useState<boolean>(false);
  const [verificationResult, setVerificationResult] = useState<{
    found: boolean;
    certificate?: Certificate;
    status: 'VERIFIED_VALID' | 'TAMPERED_HASH_MISMATCH' | 'REVOKED' | 'EXPIRED' | 'PENDING_REVIEW' | 'NOT_FOUND';
    computedHash?: string;
    storedHash?: string;
    canonicalString?: string;
    message: string;
    checkedAt?: string;
  } | null>(null);

  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraScanning, setCameraScanning] = useState<boolean>(false);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [fileHashCalculated, setFileHashCalculated] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Parse URL search params if accessed via QR code (e.g. ?verify=CERT-2024-8841X)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const verifyId = params.get('verify') || params.get('id');
    if (verifyId) {
      setQueryInput(verifyId);
      handleExecuteVerify(verifyId, 'QR_SCAN');
    }
  }, []);

  const handleExecuteVerify = async (
    targetQuery: string,
    method: 'QR_SCAN' | 'MANUAL_ID' | 'FILE_HASH_CHECK' = 'MANUAL_ID'
  ) => {
    if (!targetQuery.trim()) return;
    setIsVerifying(true);
    setVerificationResult(null);

    // Simulate cryptographic verification computation delay
    setTimeout(async () => {
      const res = await verifyCertificateById(targetQuery.trim(), method);
      setVerificationResult({
        ...res,
        checkedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      });
      setIsVerifying(false);
    }, 450);
  };

  const handleQuickSample = (id: string) => {
    setQueryInput(id);
    handleExecuteVerify(id, 'MANUAL_ID');
  };

  const handleSimulateQRScan = (sampleCertId: string) => {
    setCameraScanning(true);
    setTimeout(() => {
      setCameraScanning(false);
      setCameraActive(false);
      setQueryInput(sampleCertId);
      handleExecuteVerify(sampleCertId, 'QR_SCAN');
    }, 1200);
  };

  const handleFileUpload = async (file: File) => {
    setFileName(file.name);
    setIsVerifying(true);
    const hash = await computeFileSHA256(file);
    setFileHashCalculated(hash);

    // Check against certificates
    setTimeout(async () => {
      const res = await verifyCertificateById(hash, 'FILE_HASH_CHECK');
      setVerificationResult({
        ...res,
        checkedAt: new Date().toLocaleTimeString(),
      });
      setIsVerifying(false);
    }, 500);
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Hero Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/70 border border-emerald-800/60 text-emerald-400 text-xs font-semibold tracking-wide">
          <ShieldCheck className="w-4 h-4" />
          AUTHORITATIVE PUBLIC VERIFICATION REGISTRY
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white">
          Verify Digital Certificate Authenticity
        </h1>
        <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto">
          Instant cryptographic validation powered by SHA-256 tamper-proof hashing and decentralized university registry lookups.
        </p>
      </div>

      {/* Main Verification Input Panel */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 sm:p-8 shadow-2xl backdrop-blur-sm">
        {/* Verification Method Tabs */}
        <div className="flex border-b border-slate-700/80 pb-3 mb-6 gap-2 sm:gap-4 text-xs sm:text-sm font-semibold overflow-x-auto">
          <button
            id="verify-tab-id"
            onClick={() => setActiveVerifyTab('id')}
            className={`flex items-center gap-2 pb-2 px-3 border-b-2 transition-colors whitespace-nowrap ${
              activeVerifyTab === 'id'
                ? 'border-emerald-500 text-emerald-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Search className="w-4 h-4" />
            Certificate ID / Hash Search
          </button>

          <button
            id="verify-tab-qr"
            onClick={() => setActiveVerifyTab('qr')}
            className={`flex items-center gap-2 pb-2 px-3 border-b-2 transition-colors whitespace-nowrap ${
              activeVerifyTab === 'qr'
                ? 'border-emerald-500 text-emerald-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <QrCode className="w-4 h-4" />
            QR Code Scanner
          </button>

          <button
            id="verify-tab-file"
            onClick={() => setActiveVerifyTab('file')}
            className={`flex items-center gap-2 pb-2 px-3 border-b-2 transition-colors whitespace-nowrap ${
              activeVerifyTab === 'file'
                ? 'border-emerald-500 text-emerald-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <UploadCloud className="w-4 h-4" />
            File Tamper / Hash Check
          </button>
        </div>

        {/* Tab 1: Certificate ID Search */}
        {activeVerifyTab === 'id' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-stretch gap-3">
              <div className="relative flex-1">
                <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  id="cert-search-input"
                  type="text"
                  value={queryInput}
                  onChange={(e) => setQueryInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleExecuteVerify(queryInput, 'MANUAL_ID')}
                  placeholder="Enter Certificate ID (e.g. CERT-2024-8841X) or 64-char SHA-256 Hash..."
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm sm:text-base font-mono-code transition-all"
                />
              </div>

              <button
                id="execute-verify-btn"
                disabled={isVerifying || !queryInput.trim()}
                onClick={() => handleExecuteVerify(queryInput, 'MANUAL_ID')}
                className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 text-white font-semibold rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 shrink-0"
              >
                {isVerifying ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    Verify Now
                  </>
                )}
              </button>
            </div>

            {/* Quick Demo Pre-filled Samples */}
            <div className="pt-2 flex flex-wrap items-center gap-2 text-xs text-slate-400">
              <span className="font-semibold text-slate-300">Quick Test Samples:</span>
              <button
                id="sample-valid-1"
                onClick={() => handleQuickSample('CERT-2024-8841X')}
                className="px-2.5 py-1 rounded bg-slate-900/90 border border-slate-700 hover:border-emerald-500 text-emerald-300 transition-colors"
              >
                ✓ Valid Degree (Aarav)
              </button>
              <button
                id="sample-valid-2"
                onClick={() => handleQuickSample('CERT-2025-9920A')}
                className="px-2.5 py-1 rounded bg-slate-900/90 border border-slate-700 hover:border-emerald-500 text-emerald-300 transition-colors"
              >
                ✓ Valid Cert (Cloud Security)
              </button>
              <button
                id="sample-revoked"
                onClick={() => handleQuickSample('CERT-2024-1094R')}
                className="px-2.5 py-1 rounded bg-slate-900/90 border border-slate-700 hover:border-rose-500 text-rose-300 transition-colors"
              >
                ⚠️ Revoked Credential
              </button>
              <button
                id="sample-invalid"
                onClick={() => handleQuickSample('CERT-FAKE-99999')}
                className="px-2.5 py-1 rounded bg-slate-900/90 border border-slate-700 hover:border-slate-500 text-slate-400 transition-colors"
              >
                ✕ Non-Existent ID
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: QR Code Scanner Simulation & Upload */}
        {activeVerifyTab === 'qr' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              {/* Camera Scanner Simulation */}
              <div className="bg-slate-900/90 border border-slate-700 rounded-xl p-6 text-center flex flex-col items-center justify-center min-h-[260px] relative overflow-hidden">
                {cameraActive ? (
                  <div className="w-full flex flex-col items-center">
                    <div className="relative w-52 h-52 border-2 border-emerald-500/80 rounded-xl overflow-hidden flex items-center justify-center bg-slate-950">
                      {/* Scanner Line Animation */}
                      <div className="absolute inset-x-0 h-0.5 bg-emerald-400 shadow-[0_0_12px_#34d399] animate-pulse top-1/2 -translate-y-1/2" />
                      <div className="absolute inset-4 border border-dashed border-emerald-500/40 rounded-lg flex items-center justify-center">
                        <QrCode className="w-24 h-24 text-slate-700 animate-pulse" />
                      </div>
                      {cameraScanning && (
                        <div className="absolute inset-0 bg-emerald-950/80 flex items-center justify-center">
                          <div className="text-emerald-400 font-bold text-xs flex items-center gap-1.5">
                            <Sparkles className="w-4 h-4 animate-spin" />
                            Decoding QR Data...
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() => handleSimulateQRScan('CERT-2024-8841X')}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-medium"
                      >
                        Target Authentic QR
                      </button>
                      <button
                        onClick={() => setCameraActive(false)}
                        className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded text-xs font-medium"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="w-16 h-16 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center mx-auto text-emerald-400">
                      <Camera className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-white">Live Camera QR Scanner</h3>
                      <p className="text-xs text-slate-400 mt-1 max-w-xs">
                        Point your camera at a printed or digital certificate QR code.
                      </p>
                    </div>
                    <button
                      id="launch-camera-btn"
                      onClick={() => setCameraActive(true)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition-colors inline-flex items-center gap-2 shadow"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      Activate Camera Scanner
                    </button>
                  </div>
                )}
              </div>

              {/* QR Image Dropzone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                onDragLeave={() => setDragActive(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragActive(false);
                  handleSimulateQRScan('CERT-2024-8841X');
                }}
                onClick={() => handleSimulateQRScan('CERT-2024-8841X')}
                className={`border-2 border-dashed rounded-xl p-6 text-center flex flex-col items-center justify-center min-h-[260px] cursor-pointer transition-colors ${
                  dragActive
                    ? 'border-emerald-400 bg-emerald-950/20'
                    : 'border-slate-700 hover:border-slate-500 bg-slate-900/60'
                }`}
              >
                <div className="w-14 h-14 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center mb-3 text-slate-300">
                  <QrCode className="w-7 h-7" />
                </div>
                <h3 className="text-sm font-semibold text-white">Upload QR Code Image</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-xs">
                  Click or drag and drop a screenshot or image of the certificate's QR code here.
                </p>
                <span className="mt-3 text-[11px] font-mono-code text-emerald-400 underline">
                  Click to auto-load demo QR code
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: File Tamper & Checksum Verification */}
        {activeVerifyTab === 'file' && (
          <div className="space-y-4">
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileUpload(e.target.files[0]);
                }
              }}
              className="hidden"
              accept=".pdf,.png,.jpg,.jpeg,.doc"
            />
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-700 hover:border-emerald-500 rounded-xl p-8 text-center bg-slate-900/60 cursor-pointer transition-colors group"
            >
              <UploadCloud className="w-12 h-12 text-slate-400 group-hover:text-emerald-400 mx-auto mb-3 transition-colors" />
              <h3 className="text-sm font-semibold text-white">Upload Certificate Document (PDF / Image)</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                The cryptographic engine computes the exact SHA-256 byte digest in your browser and verifies it against the institutional blockchain registry.
              </p>
              {fileName && (
                <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded bg-slate-800 border border-slate-700 text-xs font-mono-code text-emerald-300">
                  <FileText className="w-3.5 h-3.5" />
                  {fileName}
                </div>
              )}
            </div>

            {fileHashCalculated && (
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono-code text-slate-300 flex items-center justify-between">
                <span className="text-slate-400">File SHA-256 Digest:</span>
                <span className="text-emerald-400 font-semibold">{fileHashCalculated}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Verification Result Breakdown Card */}
      {verificationResult && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className={`border rounded-2xl p-6 sm:p-8 shadow-2xl ${
            verificationResult.status === 'VERIFIED_VALID'
              ? 'bg-emerald-950/20 border-emerald-500/60'
              : verificationResult.status === 'REVOKED'
              ? 'bg-rose-950/20 border-rose-500/60'
              : verificationResult.status === 'TAMPERED_HASH_MISMATCH'
              ? 'bg-amber-950/20 border-amber-500/60'
              : 'bg-slate-900/80 border-slate-700'
          }`}>
            {/* Status Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
              <div className="flex items-start gap-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${
                  verificationResult.status === 'VERIFIED_VALID'
                    ? 'bg-emerald-600 text-white'
                    : verificationResult.status === 'REVOKED'
                    ? 'bg-rose-600 text-white'
                    : verificationResult.status === 'TAMPERED_HASH_MISMATCH'
                    ? 'bg-amber-600 text-white'
                    : 'bg-slate-700 text-slate-300'
                }`}>
                  {verificationResult.status === 'VERIFIED_VALID' ? (
                    <ShieldCheck className="w-8 h-8" />
                  ) : verificationResult.status === 'REVOKED' ? (
                    <ShieldAlert className="w-8 h-8" />
                  ) : verificationResult.status === 'TAMPERED_HASH_MISMATCH' ? (
                    <AlertTriangle className="w-8 h-8" />
                  ) : (
                    <XCircle className="w-8 h-8" />
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl sm:text-2xl font-bold text-white">
                      {verificationResult.status === 'VERIFIED_VALID' && 'Authentic & Cryptographically Verified'}
                      {verificationResult.status === 'REVOKED' && 'Certificate Officially Revoked'}
                      {verificationResult.status === 'TAMPERED_HASH_MISMATCH' && 'CRITICAL: Data Tampering Detected'}
                      {verificationResult.status === 'PENDING_REVIEW' && 'External Certificate Under Review'}
                      {verificationResult.status === 'NOT_FOUND' && 'Certificate Not Found in Registry'}
                    </h2>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-300 mt-1">
                    {verificationResult.message}
                  </p>
                </div>
              </div>

              {/* Timestamp & Verification Seal */}
              <div className="flex sm:flex-col items-end justify-between sm:justify-center text-xs text-slate-400 font-mono-code shrink-0">
                <span>Verified At: <strong className="text-slate-200">{verificationResult.checkedAt}</strong></span>
                <span className="text-emerald-400 font-semibold mt-1">Protocol: SHA-256 Digest</span>
              </div>
            </div>

            {/* Found Certificate Details */}
            {verificationResult.certificate && (
              <div className="pt-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
                    <span className="text-[11px] text-slate-400 uppercase tracking-wider block font-semibold">Recipient</span>
                    <span className="text-sm font-bold text-white mt-1 block">
                      {verificationResult.certificate.recipientName}
                    </span>
                    <span className="text-xs text-slate-400 font-mono-code">
                      Roll: {verificationResult.certificate.studentRollNo}
                    </span>
                  </div>

                  <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
                    <span className="text-[11px] text-slate-400 uppercase tracking-wider block font-semibold">Program / Credential</span>
                    <span className="text-sm font-bold text-white mt-1 block truncate" title={verificationResult.certificate.courseName}>
                      {verificationResult.certificate.courseName}
                    </span>
                    <span className="text-xs text-emerald-400 font-medium">
                      {verificationResult.certificate.gradeOrHonors}
                    </span>
                  </div>

                  <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
                    <span className="text-[11px] text-slate-400 uppercase tracking-wider block font-semibold">Issuing Authority</span>
                    <span className="text-sm font-bold text-white mt-1 block truncate">
                      {verificationResult.certificate.institutionName}
                    </span>
                    <span className="text-xs text-slate-400">
                      Signatory: {verificationResult.certificate.issuerSignatoryName}
                    </span>
                  </div>

                  <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
                    <span className="text-[11px] text-slate-400 uppercase tracking-wider block font-semibold">Issue Date & Validity</span>
                    <span className="text-sm font-bold text-white mt-1 block font-mono-code">
                      {verificationResult.certificate.issueDate}
                    </span>
                    <span className="text-xs text-slate-400">
                      {verificationResult.certificate.expiryDate ? `Expires: ${verificationResult.certificate.expiryDate}` : 'Lifetime Validity'}
                    </span>
                  </div>
                </div>

                {/* Cryptographic SHA-256 Audit Box */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                      <Hash className="w-4 h-4 text-emerald-400" />
                      Cryptographic Integrity Proof (SHA-256)
                    </span>
                    <span className="text-[11px] font-mono-code text-emerald-400 px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/40">
                      Zero-Collision Guarantee
                    </span>
                  </div>

                  <div className="space-y-2 text-xs font-mono-code">
                    <div className="p-2.5 rounded bg-slate-950 border border-slate-800/80">
                      <div className="text-slate-400 text-[10px] uppercase">Registered Official Hash:</div>
                      <div className="text-emerald-400 font-semibold break-all select-all">
                        {verificationResult.storedHash || verificationResult.certificate.sha256Hash}
                      </div>
                    </div>

                    {verificationResult.computedHash && (
                      <div className="p-2.5 rounded bg-slate-950 border border-slate-800/80">
                        <div className="text-slate-400 text-[10px] uppercase">Freshly Computed SHA-256 from Payload:</div>
                        <div className={`font-semibold break-all select-all ${
                          verificationResult.computedHash === verificationResult.storedHash
                            ? 'text-emerald-400'
                            : 'text-rose-400'
                        }`}>
                          {verificationResult.computedHash}
                        </div>
                      </div>
                    )}

                    {verificationResult.canonicalString && (
                      <div className="p-2 rounded bg-slate-950/50 border border-slate-800 text-[11px] text-slate-400">
                        <span className="text-slate-500">Canonical String:</span>{' '}
                        <span className="text-slate-300 break-all">{verificationResult.canonicalString}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* View Certificate Document & AI Audit Button */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      id="view-verified-cert-btn"
                      onClick={() => setSelectedCertificateModal(verificationResult.certificate!)}
                      className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-2 shadow-md transition-colors cursor-pointer"
                    >
                      <FileText className="w-4 h-4" />
                      Open Official Printable Certificate
                    </button>

                    <button
                      id="ai-audit-verified-cert-btn"
                      onClick={() => setAiAuditModalOpen(true)}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 text-white text-xs font-semibold flex items-center gap-2 shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <span>Run AI Forensic & Cryptographic Audit</span>
                    </button>
                  </div>

                  <span className="text-xs text-slate-400">
                    Registered ID: <strong className="text-white font-mono-code">{verificationResult.certificate.id}</strong>
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Live System Verification Audit Feed */}
      <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">Live Verification Activity Audit Log</h3>
          </div>
          <span className="text-xs font-mono-code text-slate-400">
            {logs.length} Total Verified Queries
          </span>
        </div>

        <div className="divide-y divide-slate-700/60 max-h-60 overflow-y-auto">
          {logs.slice(0, 6).map((log) => (
            <div key={log.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-3">
                <span className={`w-2 h-2 rounded-full shrink-0 ${
                  log.status === 'VERIFIED_VALID' ? 'bg-emerald-400' :
                  log.status === 'REVOKED' ? 'bg-rose-400' :
                  log.status === 'TAMPERED_HASH_MISMATCH' ? 'bg-amber-400' : 'bg-slate-400'
                }`} />
                <div>
                  <span className="font-mono-code font-semibold text-slate-200">
                    {log.certificateId}
                  </span>
                  {log.recipientName && (
                    <span className="text-slate-400 ml-2">({log.recipientName})</span>
                  )}
                  <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{log.details}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-slate-500 font-mono-code text-[11px] shrink-0">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  {log.verifierLocation}
                </span>
                <span>{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Render Modal Certificate Document if opened */}
      {selectedCertificateModal && (
        <CertificateDocument
          certificate={selectedCertificateModal}
          isModal={true}
          onClose={() => setSelectedCertificateModal(null)}
        />
      )}

      {/* Render AI Forensic Audit Modal if opened */}
      {aiAuditModalOpen && verificationResult?.certificate && (
        <AIForensicAuditModal
          certificate={verificationResult.certificate}
          isTampered={verificationResult.status === 'TAMPERED_HASH_MISMATCH'}
          computedHash={verificationResult.computedHash}
          onClose={() => setAiAuditModalOpen(false)}
        />
      )}
    </div>
  );
};
