import React, { useState, useRef } from 'react';
import {
  Award,
  FileCheck,
  Upload,
  Calendar,
  Trophy,
  Download,
  Share2,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Clock,
  PlusCircle,
  FileText,
  AlertCircle,
  QrCode,
  LogOut,
  Search,
  Sparkles,
  Cpu,
} from 'lucide-react';
import { useCertificate } from '../context/CertificateContext';
import { Certificate, User } from '../types';
import { computeFileSHA256 } from '../utils/crypto';
import confetti from 'canvas-confetti';
import { AICareerMatrixModal } from './AICareerMatrixModal';
import { AIForensicAuditModal } from './AIForensicAuditModal';

interface StudentDashboardProps {
  onNavigate?: (view: 'verify' | 'student' | 'admin' | 'institution' | 'tamper' | 'leaderboard') => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ onNavigate }) => {
  const {
    currentUser,
    certificates,
    events,
    institutions,
    uploadExternalCertificate,
    registerForEvent,
    setSelectedCertificateModal,
    logout,
  } = useCertificate();

  const user: User = currentUser || {
    id: 'user-student-1',
    name: 'Aarav Sharma',
    email: 'aarav.sharma@apex.edu',
    role: 'student',
    studentRollNo: '2021CS042',
    institutionName: 'Apex Institute of Technology & Sciences',
    department: 'Computer Science & Distributed Systems',
    credits: 1450,
    rank: 1,
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  };

  const [activeTab, setActiveTab] = useState<'certificates' | 'upload' | 'events'>('certificates');
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);
  const [showCareerMatrixModal, setShowCareerMatrixModal] = useState<boolean>(false);
  const [aiAuditCert, setAiAuditCert] = useState<Certificate | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  // Upload Form State
  const [formData, setFormData] = useState({
    courseName: '',
    degreeOrTrack: 'Professional Certification',
    institutionName: 'Metropolitan Institute of Science & Computing',
    institutionId: 'inst-metro',
    issueDate: new Date().toISOString().split('T')[0],
    gradeOrHonors: 'Grade A with Distinction',
    skills: 'Machine Learning, Python, Data Systems',
    category: 'Professional Certification' as Certificate['category'],
    externalFileName: '',
  });
  const [uploadingFile, setUploadingFile] = useState<File | null>(null);
  const [fileHash, setFileHash] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Student's certificates
  const studentCerts = certificates.filter(
    (c) =>
      c.recipientEmail.toLowerCase() === user.email.toLowerCase() ||
      c.studentRollNo === user.studentRollNo
  );

  const activeCerts = studentCerts.filter((c) => c.status === 'active');
  const pendingCerts = studentCerts.filter((c) => c.status === 'pending_review');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadingFile(file);
      setFormData((prev) => ({ ...prev, externalFileName: file.name }));
      const hash = await computeFileSHA256(file);
      setFileHash(hash);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.courseName.trim()) return;

    setIsSubmitting(true);
    try {
      const skillsArray = formData.skills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      await uploadExternalCertificate({
        recipientName: user.name,
        studentRollNo: user.studentRollNo || '2021CS042',
        courseName: formData.courseName,
        degreeOrTrack: formData.degreeOrTrack,
        institutionName: formData.institutionName,
        institutionId: formData.institutionId,
        issueDate: formData.issueDate,
        gradeOrHonors: formData.gradeOrHonors,
        skills: skillsArray,
        category: formData.category,
        externalFileName: formData.externalFileName || 'external_document.pdf',
      });

      setUploadSuccess('External certificate successfully submitted for official administrative review!');
      setShowUploadModal(false);
      // reset form
      setFormData({
        courseName: '',
        degreeOrTrack: 'Professional Certification',
        institutionName: 'Metropolitan Institute of Science & Computing',
        institutionId: 'inst-metro',
        issueDate: new Date().toISOString().split('T')[0],
        gradeOrHonors: 'Grade A with Distinction',
        skills: 'Machine Learning, Python, Data Systems',
        category: 'Professional Certification',
        externalFileName: '',
      });
      setUploadingFile(null);
      setFileHash('');

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterEvent = (eventId: string) => {
    const success = registerForEvent(eventId);
    if (success) {
      confetti({
        particleCount: 70,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Student Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950/80 border border-slate-700/80 rounded-2xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img
            src={user.avatarUrl}
            alt={user.name}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-emerald-500 object-cover shadow-md"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-white">{user.name}</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-950/80 border border-emerald-700/50 text-emerald-400">
                Verified Student
              </span>
            </div>
            <p className="text-slate-400 text-xs sm:text-sm mt-1">
              Roll No: <strong className="text-slate-200 font-mono-code">{user.studentRollNo}</strong> • {user.department}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              {user.institutionName}
            </p>
          </div>
        </div>

        {/* Quick Stats Grid & Logout */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 w-full md:w-auto">
          <div className="bg-slate-900/80 border border-slate-700/80 px-4 py-3 rounded-xl text-center shrink-0">
            <span className="text-xs text-slate-400 block font-medium">Verified Credentials</span>
            <span className="text-xl sm:text-2xl font-black text-emerald-400 font-mono-code">
              {activeCerts.length}
            </span>
          </div>

          <div className="bg-slate-900/80 border border-slate-700/80 px-4 py-3 rounded-xl text-center shrink-0">
            <span className="text-xs text-slate-400 block font-medium">Academic Credits</span>
            <span className="text-xl sm:text-2xl font-black text-amber-400 font-mono-code">
              {user.credits || 1450}
            </span>
          </div>

          <div className="bg-slate-900/80 border border-slate-700/80 px-4 py-3 rounded-xl text-center shrink-0">
            <span className="text-xs text-slate-400 block font-medium">Campus Standing</span>
            <span className="text-xl sm:text-2xl font-black text-indigo-400 font-mono-code">
              Rank #{user.rank || 1}
            </span>
          </div>

          <button
            id="student-banner-logout-btn"
            onClick={logout}
            className="px-3.5 py-3 bg-slate-900/80 hover:bg-rose-950/80 border border-slate-700 hover:border-rose-800 text-slate-300 hover:text-rose-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
            title="Logout from Student Account"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {uploadSuccess && (
        <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-600/50 text-emerald-300 text-xs sm:text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            {uploadSuccess}
          </div>
          <button onClick={() => setUploadSuccess(null)} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-3 gap-4">
        <div className="flex items-center gap-2 sm:gap-4 text-sm font-semibold overflow-x-auto">
          <button
            id="student-tab-certs"
            onClick={() => setActiveTab('certificates')}
            className={`pb-2 px-3 border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'certificates'
                ? 'border-emerald-500 text-emerald-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Award className="w-4 h-4" />
            My Credential Wallet ({studentCerts.length})
          </button>

          <button
            id="student-tab-events"
            onClick={() => setActiveTab('events')}
            className={`pb-2 px-3 border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'events'
                ? 'border-emerald-500 text-emerald-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Calendar className="w-4 h-4" />
            Academic Events & Hackathons
          </button>

          {onNavigate && (
            <>
              <button
                id="student-quick-verify"
                onClick={() => onNavigate('verify')}
                className="pb-2 px-3 border-b-2 border-transparent text-slate-400 hover:text-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Search className="w-4 h-4" />
                Verify Credential
              </button>
              <button
                id="student-quick-leaderboard"
                onClick={() => onNavigate('leaderboard')}
                className="pb-2 px-3 border-b-2 border-transparent text-slate-400 hover:text-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Trophy className="w-4 h-4" />
                Leaderboard
              </button>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            id="student-ai-matrix-btn"
            onClick={() => setShowCareerMatrixModal(true)}
            className="px-3.5 py-2 bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-md shadow-indigo-600/20 transition-all cursor-pointer shrink-0"
            title="AI Career & Competency Matrix from your verified credentials"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>AI Career Matrix</span>
          </button>

          <button
            id="open-upload-modal-btn"
            onClick={() => setShowUploadModal(true)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow transition-colors shrink-0 cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            Upload External Certificate
          </button>
        </div>
      </div>

      {/* Tab 1: My Certificates */}
      {activeTab === 'certificates' && (
        <div className="space-y-6">
          {studentCerts.length === 0 ? (
            <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-12 text-center text-slate-400">
              <Award className="w-12 h-12 mx-auto mb-3 text-slate-500" />
              <p className="text-sm font-medium">No certificates registered yet.</p>
              <p className="text-xs mt-1">Upload external certificates or wait for institution issuance.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {studentCerts.map((cert) => {
                const isActive = cert.status === 'active';
                const isPending = cert.status === 'pending_review';
                const isRevoked = cert.status === 'revoked';

                return (
                  <div
                    key={cert.id}
                    className="bg-slate-800/80 border border-slate-700/80 hover:border-slate-600 rounded-2xl p-6 shadow-xl transition-all flex flex-col justify-between group"
                  >
                    <div>
                      {/* Top status & ID */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="text-xs font-mono-code text-slate-400 bg-slate-900 px-2.5 py-1 rounded border border-slate-700">
                          {cert.id}
                        </span>

                        <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                          isActive
                            ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/50'
                            : isPending
                            ? 'bg-amber-950/80 text-amber-400 border border-amber-800/50'
                            : 'bg-rose-950/80 text-rose-400 border border-rose-800/50'
                        }`}>
                          {isActive && <><ShieldCheck className="w-3 h-3" /> Authentic & Verified</>}
                          {isPending && <><Clock className="w-3 h-3" /> Under Review</>}
                          {isRevoked && <><AlertCircle className="w-3 h-3" /> Revoked</>}
                        </span>
                      </div>

                      {/* Course Title */}
                      <h3 className="text-lg font-bold text-white group-hover:text-emerald-300 transition-colors line-clamp-2">
                        {cert.courseName}
                      </h3>

                      <p className="text-xs text-slate-400 mt-1 font-medium">
                        {cert.institutionName}
                      </p>

                      <div className="mt-3 flex items-center gap-2">
                        <span className="text-xs font-semibold text-amber-400 bg-amber-950/50 px-2 py-0.5 rounded border border-amber-800/30">
                          {cert.gradeOrHonors}
                        </span>
                        <span className="text-xs text-slate-500 font-mono-code">
                          Issued: {cert.issueDate}
                        </span>
                      </div>

                      {/* Skills */}
                      {cert.skills && cert.skills.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-1">
                          {cert.skills.slice(0, 4).map((s, idx) => (
                            <span key={idx} className="text-[10px] px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800">
                              {s}
                            </span>
                          ))}
                          {cert.skills.length > 4 && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 text-slate-400">
                              +{cert.skills.length - 4} more
                            </span>
                          )}
                        </div>
                      )}

                      {/* Hash snippet */}
                      <div className="mt-4 pt-3 border-t border-slate-700/60 flex items-center justify-between text-[11px] font-mono-code text-slate-400">
                        <span>SHA-256:</span>
                        <span className="truncate max-w-[200px] text-slate-300" title={cert.sha256Hash}>
                          {cert.sha256Hash.substring(0, 20)}...
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-6 pt-4 border-t border-slate-700/80 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <button
                          id={`view-cert-${cert.id}`}
                          onClick={() => setSelectedCertificateModal(cert)}
                          className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5 text-emerald-400" />
                          <span>View</span>
                        </button>

                        <button
                          id={`ai-audit-cert-${cert.id}`}
                          onClick={() => setAiAuditCert(cert)}
                          className="px-3 py-2 bg-indigo-950/60 hover:bg-indigo-900/80 border border-indigo-700/50 text-indigo-300 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                          title="Run deep AI cryptographic audit"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                          <span>AI Audit</span>
                        </button>
                      </div>

                      <button
                        id={`open-full-cert-${cert.id}`}
                        onClick={() => setSelectedCertificateModal(cert)}
                        className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow transition-colors cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Academic Events & Hackathons */}
      {activeTab === 'events' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">Upcoming Academic Events & Competitions</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Register to participate, earn accredited certificates, and boost your university leaderboard ranking.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {events.map((event) => {
              const isRegistered = event.registeredStudentIds.includes(user.id);
              return (
                <div
                  key={event.id}
                  className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 flex flex-col justify-between shadow-xl"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-950 text-indigo-400 border border-indigo-800">
                        {event.category}
                      </span>
                      <span className="text-xs font-bold text-amber-400 font-mono-code">
                        +{event.credits} Credits
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white line-clamp-2">
                      {event.title}
                    </h3>

                    <p className="text-xs text-slate-400 line-clamp-3">
                      {event.description}
                    </p>

                    <div className="space-y-1 text-xs text-slate-400 font-mono-code pt-2 border-t border-slate-700/60">
                      <div>📅 Date: <strong className="text-slate-200">{event.date}</strong></div>
                      <div>📍 Venue: <span className="text-slate-300">{event.venue}</span></div>
                      <div>🏛️ Host: <span className="text-slate-300">{event.organizer}</span></div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-700/60">
                    <button
                      id={`register-evt-${event.id}`}
                      disabled={isRegistered}
                      onClick={() => handleRegisterEvent(event.id)}
                      className={`w-full py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                        isRegistered
                          ? 'bg-slate-900 border border-emerald-600/50 text-emerald-400 cursor-default'
                          : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md'
                      }`}
                    >
                      {isRegistered ? (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          Registered & Attending
                        </>
                      ) : (
                        <>
                          Register & Earn Certificate
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Upload External Certificate Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-slate-900 border border-slate-700 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white">Upload External Academic Certificate</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Submit credentials from other universities or accredited bodies for official endorsement.
                </p>
              </div>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Program or Course Name *
                </label>
                <input
                  id="upload-course-name"
                  type="text"
                  required
                  placeholder="e.g. Stanford Online Cryptography Specialization"
                  value={formData.courseName}
                  onChange={(e) => setFormData({ ...formData, courseName: e.target.value })}
                  className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Issuing Institution *
                  </label>
                  <input
                    id="upload-inst-name"
                    type="text"
                    required
                    value={formData.institutionName}
                    onChange={(e) => setFormData({ ...formData, institutionName: e.target.value })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Issue Date *
                  </label>
                  <input
                    id="upload-issue-date"
                    type="date"
                    required
                    value={formData.issueDate}
                    onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs sm:text-sm font-mono-code focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Grade or Honors
                  </label>
                  <input
                    id="upload-grade"
                    type="text"
                    value={formData.gradeOrHonors}
                    onChange={(e) => setFormData({ ...formData, gradeOrHonors: e.target.value })}
                    placeholder="e.g. Grade A+ or First Class"
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Credential Category
                  </label>
                  <select
                    id="upload-category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="Professional Certification">Professional Certification</option>
                    <option value="Academic Degree">Academic Degree</option>
                    <option value="Hackathon & Competition">Hackathon & Competition</option>
                    <option value="Workshop & Seminar">Workshop & Seminar</option>
                    <option value="Honor & Award">Honor & Award</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Skills & Topics (comma separated)
                </label>
                <input
                  id="upload-skills"
                  type="text"
                  value={formData.skills}
                  onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                  placeholder="e.g. Zero-Knowledge, Python, Cryptography"
                  className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              {/* Document File Dropzone */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Attach Certificate File (PDF / Image) *
                </label>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".pdf,.png,.jpg,.jpeg"
                  className="hidden"
                />
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-700 hover:border-emerald-500 rounded-xl p-4 text-center cursor-pointer bg-slate-950 transition-colors"
                >
                  <Upload className="w-7 h-7 text-slate-400 mx-auto mb-1" />
                  <span className="text-xs font-medium text-slate-200 block">
                    {uploadingFile ? uploadingFile.name : 'Click to select certificate file'}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    PDF, PNG, JPG up to 15MB
                  </span>
                </div>

                {fileHash && (
                  <div className="mt-2 p-2 rounded bg-slate-950 border border-slate-800 text-[10px] font-mono-code text-slate-400">
                    Calculated File SHA-256: <span className="text-emerald-400">{fileHash}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  id="submit-upload-cert-btn"
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow transition-colors flex items-center gap-2"
                >
                  {isSubmitting ? 'Uploading & Hashing...' : 'Submit for Verification'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* AI Career Matrix Modal */}
      {showCareerMatrixModal && (
        <AICareerMatrixModal
          user={user}
          certificates={studentCerts}
          onClose={() => setShowCareerMatrixModal(false)}
        />
      )}

      {/* AI Forensic Audit Modal */}
      {aiAuditCert && (
        <AIForensicAuditModal
          certificate={aiAuditCert}
          onClose={() => setAiAuditCert(null)}
        />
      )}
    </div>
  );
};
