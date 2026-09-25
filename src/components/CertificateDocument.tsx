import React, { useEffect, useState, useRef } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Award,
  Download,
  Printer,
  Share2,
  CheckCircle2,
  AlertTriangle,
  QrCode as QrIcon,
  Copy,
  ExternalLink,
  Lock,
  Sparkles,
} from 'lucide-react';
import { Certificate } from '../types';
import { generateCertificateQRCode, formatHashDisplay } from '../utils/crypto';
import { useCertificate } from '../context/CertificateContext';
import { AIForensicAuditModal } from './AIForensicAuditModal';

interface CertificateDocumentProps {
  certificate: Certificate;
  onClose?: () => void;
  isModal?: boolean;
}

export const CertificateDocument: React.FC<CertificateDocumentProps> = ({
  certificate,
  onClose,
  isModal = false,
}) => {
  const { institutions } = useCertificate();
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [copiedHash, setCopiedHash] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showAIAudit, setShowAIAudit] = useState(false);
  const certificateRef = useRef<HTMLDivElement>(null);

  const institution = institutions.find((i) => i.id === certificate.institutionId) || {
    id: 'inst-default',
    name: certificate.institutionName,
    code: 'AUT-7082',
    accreditation: 'Accredited Academic Authority',
    location: 'Official Academic Repository',
    authorizedSignatory: certificate.issuerSignatoryName,
    signatoryTitle: certificate.issuerTitle,
    totalIssued: 1000,
    contactEmail: 'registry@academic-authority.edu',
    establishedYear: 1984,
    sealColor: '#b45309',
  };

  useEffect(() => {
    generateCertificateQRCode(certificate.id, certificate.sha256Hash).then((url) => {
      setQrCodeUrl(url);
    });
  }, [certificate.id, certificate.sha256Hash]);

  const handleCopyHash = () => {
    navigator.clipboard.writeText(certificate.sha256Hash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const handleCopyShareLink = () => {
    const url = `${window.location.origin}/?verify=${certificate.id}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const isRevoked = certificate.status === 'revoked';
  const isPending = certificate.status === 'pending_review';

  return (
    <div className={isModal ? 'fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6' : 'w-full'}>
      <div className={`w-full max-w-4xl mx-auto flex flex-col items-center ${isModal ? 'relative animate-in fade-in zoom-in-95 duration-200' : ''}`}>
        
        {/* Action Header Bar (Hidden on Print) */}
        <div className="w-full flex flex-wrap items-center justify-between gap-3 mb-4 bg-slate-800/90 border border-slate-700/80 rounded-xl p-3 text-sm text-slate-200 shadow-xl no-print">
          <div className="flex items-center gap-2">
            <span className="font-mono-code text-xs px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-emerald-400 font-medium">
              {certificate.id}
            </span>
            <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full ${
              isRevoked
                ? 'bg-rose-950/70 text-rose-400 border border-rose-800/50'
                : isPending
                ? 'bg-amber-950/70 text-amber-400 border border-amber-800/50'
                : 'bg-emerald-950/70 text-emerald-400 border border-emerald-800/50'
            }`}>
              {isRevoked ? (
                <>
                  <ShieldAlert className="w-3.5 h-3.5" /> REVOKED
                </>
              ) : isPending ? (
                <>
                  <AlertTriangle className="w-3.5 h-3.5" /> PENDING REVIEW
                </>
              ) : (
                <>
                  <ShieldCheck className="w-3.5 h-3.5" /> AUTHENTIC & VERIFIED
                </>
              )}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="ai-audit-doc-btn"
              onClick={() => setShowAIAudit(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-700/60 text-indigo-300 text-xs font-medium transition-colors cursor-pointer"
              title="Run AI Forensic & Cryptographic Audit"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>AI Forensic Audit</span>
            </button>

            <button
              id="copy-link-btn"
              onClick={handleCopyShareLink}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-700/70 hover:bg-slate-700 text-xs font-medium text-slate-200 transition-colors"
              title="Copy verification link"
            >
              {copiedLink ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
              {copiedLink ? 'Link Copied' : 'Share'}
            </button>

            <button
              id="print-cert-btn"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition-colors shadow-sm"
              title="Print or Save as PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              Print / Save PDF
            </button>

            {isModal && onClose && (
              <button
                id="close-cert-modal-btn"
                onClick={onClose}
                className="px-3 py-1.5 rounded-lg bg-slate-700/60 hover:bg-rose-950/60 hover:text-rose-300 text-xs text-slate-300 transition-colors ml-1"
              >
                Close ✕
              </button>
            )}
          </div>
        </div>

        {/* Certificate Container with Guilloche & Official Parchment Styling */}
        <div
          ref={certificateRef}
          className="certificate-printable relative w-full bg-[#fdfbf7] text-slate-900 rounded-lg shadow-2xl overflow-hidden border-[10px] border-[#1e293b] p-6 sm:p-10 select-text transition-all"
          style={{ minHeight: '580px' }}
        >
          {/* Inner Golden Border */}
          <div className="absolute inset-2 sm:inset-3 border-2 border-[#d4af37] pointer-events-none rounded" />
          <div className="absolute inset-3 sm:inset-4 border border-[#e2d4a7] pointer-events-none rounded" />

          {/* Corner Flourishes */}
          <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-[#b45309] pointer-events-none" />
          <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-[#b45309] pointer-events-none" />
          <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-[#b45309] pointer-events-none" />
          <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-[#b45309] pointer-events-none" />

          {/* Revocation Watermark Overlay if Revoked */}
          {isRevoked && (
            <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none overflow-hidden">
              <div className="transform -rotate-25 border-8 border-rose-600/70 bg-rose-50/80 px-10 py-4 rounded-2xl shadow-2xl text-center backdrop-blur-[1px]">
                <span className="font-display-cinzel text-5xl sm:text-6xl font-black tracking-widest text-rose-700 block">
                  REVOKED
                </span>
                <span className="text-xs sm:text-sm font-sans font-semibold text-rose-800 tracking-wider uppercase mt-1 block">
                  Credential Null & Void • {certificate.revocationReason || 'Administrative Recall'}
                </span>
              </div>
            </div>
          )}

          {/* Pending Review Watermark if External */}
          {isPending && (
            <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none overflow-hidden">
              <div className="transform -rotate-15 border-4 border-amber-600/70 bg-amber-50/85 px-8 py-3 rounded-xl shadow-xl text-center">
                <span className="font-display-cinzel text-3xl sm:text-4xl font-black tracking-wider text-amber-700 block">
                  PENDING VERIFICATION
                </span>
                <span className="text-xs font-sans font-semibold text-amber-800 tracking-wide uppercase mt-0.5 block">
                  Official Endorsement Under Review
                </span>
              </div>
            </div>
          )}

          {/* Institutional Header & Coat of Arms */}
          <div className="relative z-10 flex flex-col items-center text-center mb-6">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-slate-900 border-2 border-[#d4af37] flex items-center justify-center shadow-md mb-3">
              <Award className="w-9 h-9 sm:w-11 sm:h-11 text-[#d4af37]" />
            </div>

            <h2 className="font-display-cinzel text-xl sm:text-2xl md:text-3xl font-bold tracking-wider text-slate-900 uppercase">
              {certificate.institutionName}
            </h2>
            <p className="text-xs sm:text-sm font-sans font-medium text-slate-600 tracking-wide mt-0.5">
              {institution.accreditation} • Est. {institution.establishedYear || 1984}
            </p>
            <div className="w-28 h-0.5 bg-gradient-to-r from-transparent via-[#d4af37] to-transparent my-2" />
          </div>

          {/* Certificate Title */}
          <div className="text-center mb-6 relative z-10">
            <span className="text-xs sm:text-sm uppercase tracking-[0.25em] font-medium text-[#b45309]">
              {certificate.category || 'Official Credential Record'}
            </span>
            <h1 className="font-serif-cormorant text-3xl sm:text-4xl md:text-5xl font-semibold italic text-slate-900 mt-1">
              Certificate of Completion
            </h1>
            <p className="text-xs sm:text-sm font-sans text-slate-600 mt-1">
              This is to certify that
            </p>
          </div>

          {/* Recipient Presentation */}
          <div className="text-center mb-6 relative z-10">
            <h3 className="font-serif-cormorant text-2xl sm:text-3xl md:text-4xl font-bold tracking-wide text-slate-900 underline decoration-[#d4af37]/60 underline-offset-8">
              {certificate.recipientName}
            </h3>
            <div className="flex items-center justify-center gap-3 mt-2 text-xs sm:text-sm text-slate-600 font-mono-code">
              <span>Roll / Student ID: <strong className="text-slate-800">{certificate.studentRollNo}</strong></span>
              <span>•</span>
              <span>Registry ID: <strong className="text-slate-800">{certificate.id}</strong></span>
            </div>
          </div>

          {/* Course & Degree Description */}
          <div className="max-w-2xl mx-auto text-center mb-6 relative z-10 px-4">
            <p className="font-sans text-sm sm:text-base text-slate-700 leading-relaxed">
              has satisfactorily completed all academic requirements, curriculum evaluations, and rigorous assessments for
            </p>
            <p className="font-display-cinzel text-lg sm:text-xl font-bold text-slate-900 mt-1 tracking-wide">
              {certificate.courseName}
            </p>
            {certificate.degreeOrTrack && (
              <p className="text-xs sm:text-sm font-sans italic text-slate-600 mt-0.5">
                {certificate.degreeOrTrack}
              </p>
            )}
            {certificate.gradeOrHonors && (
              <div className="inline-block mt-2 px-4 py-1 rounded-full bg-[#fef3c7] border border-[#f59e0b]/50 text-xs sm:text-sm font-semibold text-[#92400e]">
                {certificate.gradeOrHonors}
              </div>
            )}
          </div>

          {/* Skills & Competencies */}
          {certificate.skills && certificate.skills.length > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-1.5 mb-8 max-w-xl mx-auto relative z-10">
              {certificate.skills.map((skill, i) => (
                <span
                  key={i}
                  className="px-2.5 py-0.5 text-[11px] font-sans font-medium rounded bg-slate-100 border border-slate-300 text-slate-700"
                >
                  {skill}
                </span>
              ))}
            </div>
          )}

          {/* Signatures & Seal Section */}
          <div className="relative z-10 grid grid-cols-3 items-end gap-2 sm:gap-4 pt-6 border-t border-slate-200/80 mb-6">
            {/* Left Signatory */}
            <div className="text-center">
              <div className="h-10 flex items-center justify-center">
                <span className="font-serif-cormorant text-xl sm:text-2xl italic font-bold text-slate-800 tracking-wider">
                  {certificate.issuerSignatoryName || 'Dr. Alistair Vance'}
                </span>
              </div>
              <div className="w-32 sm:w-44 mx-auto border-t border-slate-400/80 my-1" />
              <p className="text-xs font-semibold text-slate-800">{certificate.issuerSignatoryName}</p>
              <p className="text-[10px] sm:text-[11px] text-slate-500">{certificate.issuerTitle || 'Registrar & Provost'}</p>
            </div>

            {/* Center Official Gold Seal */}
            <div className="flex flex-col items-center justify-center">
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-[#fde68a] via-[#d4af37] to-[#92400e] p-0.5 shadow-lg flex items-center justify-center">
                <div className="w-full h-full rounded-full border-2 border-dashed border-[#78350f] flex flex-col items-center justify-center bg-[#fdfbf7]/90 text-center p-1">
                  <Lock className="w-4 h-4 text-[#78350f] mb-0.5" />
                  <span className="font-display-cinzel text-[7px] sm:text-[8px] font-extrabold uppercase text-[#78350f] leading-none">
                    OFFICIAL
                  </span>
                  <span className="font-display-cinzel text-[6px] sm:text-[7px] font-bold text-[#78350f] leading-none">
                    SEAL
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-mono-code text-slate-500 mt-1">
                Issued: {certificate.issueDate}
              </span>
            </div>

            {/* Right QR Code & Digital Attestation */}
            <div className="flex flex-col items-center text-center">
              {qrCodeUrl ? (
                <div className="p-1 bg-white border border-slate-300 rounded shadow-sm">
                  <img
                    src={qrCodeUrl}
                    alt={`QR Code verification for ${certificate.id}`}
                    className="w-14 h-14 sm:w-16 sm:h-16"
                  />
                </div>
              ) : (
                <div className="w-14 h-14 bg-slate-100 flex items-center justify-center rounded">
                  <QrIcon className="w-6 h-6 text-slate-400" />
                </div>
              )}
              <div className="w-28 sm:w-36 border-t border-slate-400/80 my-1" />
              <p className="text-[10px] sm:text-[11px] font-semibold text-slate-800">Scan for Real-Time Authenticity</p>
              <p className="text-[9px] text-slate-500">Instant Verification</p>
            </div>
          </div>

          {/* Cryptographic SHA-256 Tamper Protection Footer */}
          <div className="relative z-10 pt-3 border-t border-dashed border-slate-300/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[10px] text-slate-500 font-mono-code">
            <div className="flex items-center gap-1.5 flex-1 min-w-0">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="shrink-0 font-semibold text-slate-700">SHA-256 Checksum:</span>
              <span className="truncate text-slate-800 select-all" title={certificate.sha256Hash}>
                {certificate.sha256Hash}
              </span>
              <button
                onClick={handleCopyHash}
                className="shrink-0 text-slate-500 hover:text-slate-900 transition-colors no-print"
                title="Copy full 256-bit hash"
              >
                {copiedHash ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
            <div className="shrink-0 text-slate-400 text-[9px] uppercase tracking-wider">
              Immutable Digital Credential • Anti-Tamper Protected
            </div>
          </div>

        </div>

      </div>

      {showAIAudit && (
        <AIForensicAuditModal
          certificate={certificate}
          onClose={() => setShowAIAudit(false)}
        />
      )}
    </div>
  );
};
