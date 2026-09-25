import React, { useState } from 'react';
import {
  FilePlus,
  ShieldCheck,
  ShieldAlert,
  Users,
  Calendar,
  Clock,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Award,
  Layers,
  FileText,
  BarChart3,
  Check,
  Trash2,
  LogOut,
  Cpu,
} from 'lucide-react';
import { useCertificate } from '../context/CertificateContext';
import { Certificate, CertificateCategory } from '../types';
import confetti from 'canvas-confetti';
import { AIForensicAuditModal } from './AIForensicAuditModal';
import { AIScreenExternalModal } from './AIScreenExternalModal';
import { draftCertificateCitation, CitationDraftResult } from '../utils/aiService';

export const AdminDashboard: React.FC = () => {
  const {
    certificates,
    institutions,
    events,
    logs,
    issueCertificate,
    revokeCertificate,
    approveUploadedCertificate,
    rejectUploadedCertificate,
    createAcademicEvent,
    setSelectedCertificateModal,
    logout,
  } = useCertificate();

  const [adminTab, setAdminTab] = useState<'manage' | 'issue' | 'review' | 'events' | 'audit'>('manage');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [aiAuditCert, setAiAuditCert] = useState<Certificate | null>(null);
  const [aiScreenCert, setAiScreenCert] = useState<Certificate | null>(null);
  const [isDraftingCitation, setIsDraftingCitation] = useState<boolean>(false);
  const [aiCitationDraft, setAiCitationDraft] = useState<CitationDraftResult | null>(null);

  // Issue Certificate Form State
  const [issueForm, setIssueForm] = useState({
    recipientName: '',
    recipientEmail: '',
    studentRollNo: '',
    courseName: '',
    degreeOrTrack: 'Degree Program (Major: Distributed Systems)',
    institutionId: institutions[0]?.id || 'inst-apex',
    institutionName: institutions[0]?.name || 'Apex University of Technology',
    issueDate: new Date().toISOString().split('T')[0],
    expiryDate: '',
    gradeOrHonors: 'First Class with Distinction',
    skills: 'Computer Science, Algorithms, Cryptography',
    issuerSignatoryName: 'Dr. Alistair Vance',
    issuerTitle: 'Registrar & Provost',
    category: 'Academic Degree' as CertificateCategory,
  });
  const [isIssuing, setIsIssuing] = useState(false);
  const [issuedSuccessCert, setIssuedSuccessCert] = useState<Certificate | null>(null);

  // Revoke Modal State
  const [revokingCertId, setRevokingCertId] = useState<string | null>(null);
  const [revocationReason, setRevocationReason] = useState<string>('');

  // Event Creation State
  const [eventForm, setEventForm] = useState({
    title: '',
    organizer: institutions[0]?.name || 'Apex University of Technology',
    category: 'Hackathon' as const,
    date: '2026-10-30',
    venue: 'Academic Hall & Live Sandbox',
    description: '',
    credits: 100,
    certificateProvided: true,
    maxSeats: 150,
    bannerColor: 'from-amber-600 to-indigo-900',
  });

  // Filter certificates
  const filteredCertificates = certificates.filter((c) => {
    const matchesSearch =
      c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.recipientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.courseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.studentRollNo.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const pendingReviewCerts = certificates.filter((c) => c.status === 'pending_review');

  const handleInstitutionChange = (instId: string) => {
    const found = institutions.find((i) => i.id === instId);
    if (found) {
      setIssueForm((prev) => ({
        ...prev,
        institutionId: found.id,
        institutionName: found.name,
        issuerSignatoryName: found.authorizedSignatory,
        issuerTitle: found.signatoryTitle,
      }));
    }
  };

  const handleIssueSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!issueForm.recipientName || !issueForm.courseName) return;

    setIsIssuing(true);
    try {
      const skillsArray = issueForm.skills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const newCert = await issueCertificate({
        ...issueForm,
        skills: skillsArray,
      });

      setIssuedSuccessCert(newCert);
      confetti({
        particleCount: 80,
        spread: 80,
        origin: { y: 0.6 },
      });

      // Reset form
      setIssueForm({
        recipientName: '',
        recipientEmail: '',
        studentRollNo: '',
        courseName: '',
        degreeOrTrack: 'Degree Program (Major: Distributed Systems)',
        institutionId: institutions[0]?.id || 'inst-apex',
        institutionName: institutions[0]?.name || 'Apex University of Technology',
        issueDate: new Date().toISOString().split('T')[0],
        expiryDate: '',
        gradeOrHonors: 'First Class with Distinction',
        skills: 'Computer Science, Algorithms, Cryptography',
        issuerSignatoryName: institutions[0]?.authorizedSignatory || 'Dr. Alistair Vance',
        issuerTitle: institutions[0]?.signatoryTitle || 'Registrar & Provost',
        category: 'Academic Degree',
      });
      setAiCitationDraft(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsIssuing(false);
    }
  };

  const handleAIDraftCitation = async () => {
    if (!issueForm.courseName.trim()) return;
    setIsDraftingCitation(true);
    try {
      const skillsArray = issueForm.skills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const result = await draftCertificateCitation({
        courseName: issueForm.courseName,
        recipientName: issueForm.recipientName || 'Candidate',
        institutionName: issueForm.institutionName,
        skills: skillsArray,
        category: issueForm.category,
        gradeOrHonors: issueForm.gradeOrHonors,
      });

      setAiCitationDraft(result);
      if (result.suggestedSkills && result.suggestedSkills.length > 0) {
        const mergedSkills = Array.from(new Set([...skillsArray, ...result.suggestedSkills]));
        setIssueForm((prev) => ({
          ...prev,
          skills: mergedSkills.join(', '),
        }));
      }
    } catch (err) {
      console.error('Failed to draft citation:', err);
    } finally {
      setIsDraftingCitation(false);
    }
  };

  const handleConfirmRevocation = () => {
    if (revokingCertId) {
      revokeCertificate(revokingCertId, revocationReason || 'Administrative revocation by Registrar');
      setRevokingCertId(null);
      setRevocationReason('');
    }
  };

  const handleCreateEventSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventForm.title.trim()) return;

    createAcademicEvent({
      ...eventForm,
    });

    setEventForm({
      title: '',
      organizer: institutions[0]?.name || 'Apex University of Technology',
      category: 'Hackathon',
      date: '2026-10-30',
      venue: 'Academic Hall & Live Sandbox',
      description: '',
      credits: 100,
      certificateProvided: true,
      maxSeats: 150,
      bannerColor: 'from-amber-600 to-indigo-900',
    });

    alert('New Academic Event published to Student Portal!');
  };

  const handleBatchIssueDemo = async () => {
    const sampleRecipients = [
      { name: 'Kavita Sundaram', roll: '2021CS102', email: 'kavita.s@apex.edu', grade: 'High Honors' },
      { name: 'Marcus Brody', roll: '2021CS103', email: 'marcus.b@apex.edu', grade: 'First Class' },
      { name: 'Chloe Dubois', roll: '2021CS104', email: 'chloe.d@apex.edu', grade: 'Distinction' },
    ];

    for (const r of sampleRecipients) {
      await issueCertificate({
        recipientName: r.name,
        recipientEmail: r.email,
        studentRollNo: r.roll,
        courseName: 'Full-Stack Distributed Systems Engineering',
        degreeOrTrack: 'Graduation Cohort 2026',
        institutionId: institutions[0].id,
        institutionName: institutions[0].name,
        issueDate: new Date().toISOString().split('T')[0],
        gradeOrHonors: r.grade,
        skills: ['Microservices', 'Kubernetes', 'TypeScript', 'SQL', 'Security'],
        issuerSignatoryName: institutions[0].authorizedSignatory,
        issuerTitle: institutions[0].signatoryTitle,
        category: 'Academic Degree',
      });
    }

    confetti({ particleCount: 70, spread: 60 });
    setAdminTab('manage');
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-xs font-semibold mb-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            CENTRAL REGISTRAR & CREDENTIALS AUTHORITY
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Administrative Issuance & Oversight Console
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Mint cryptographic credentials, review external submissions, manage revocation records, and inspect verification logs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="batch-issue-btn"
            onClick={handleBatchIssueDemo}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors"
            title="Mint batch of 3 test students"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Simulate Bulk Mint (3)
          </button>

          <button
            id="admin-new-cert-btn"
            onClick={() => setAdminTab('issue')}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow transition-colors cursor-pointer"
          >
            <FilePlus className="w-4 h-4" />
            Issue New Certificate
          </button>

          <button
            id="admin-logout-btn"
            onClick={logout}
            className="px-3.5 py-2 bg-slate-800 hover:bg-rose-950/80 border border-slate-700 hover:border-rose-800 text-slate-300 hover:text-rose-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Logout from Admin Console"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-800/80 border border-slate-700/80 p-4 rounded-xl">
          <span className="text-xs text-slate-400 font-medium">Total Issued</span>
          <div className="text-2xl font-extrabold text-white font-mono-code mt-1">
            {certificates.length}
          </div>
        </div>

        <div className="bg-slate-800/80 border border-slate-700/80 p-4 rounded-xl">
          <span className="text-xs text-slate-400 font-medium">Active & Valid</span>
          <div className="text-2xl font-extrabold text-emerald-400 font-mono-code mt-1">
            {certificates.filter((c) => c.status === 'active').length}
          </div>
        </div>

        <div className="bg-slate-800/80 border border-slate-700/80 p-4 rounded-xl">
          <span className="text-xs text-slate-400 font-medium">Revoked Credentials</span>
          <div className="text-2xl font-extrabold text-rose-400 font-mono-code mt-1">
            {certificates.filter((c) => c.status === 'revoked').length}
          </div>
        </div>

        <div className="bg-slate-800/80 border border-slate-700/80 p-4 rounded-xl">
          <span className="text-xs text-slate-400 font-medium">Pending Review Queue</span>
          <div className="text-2xl font-extrabold text-amber-400 font-mono-code mt-1 flex items-center justify-between">
            {pendingReviewCerts.length}
            {pendingReviewCerts.length > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-950 text-amber-400 border border-amber-800">
                Action Req.
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="flex border-b border-slate-800 pb-3 gap-2 sm:gap-4 text-xs sm:text-sm font-semibold overflow-x-auto">
        <button
          id="admin-tab-manage"
          onClick={() => setAdminTab('manage')}
          className={`pb-2 px-3 border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            adminTab === 'manage'
              ? 'border-emerald-500 text-emerald-400 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          Certificate Directory ({certificates.length})
        </button>

        <button
          id="admin-tab-issue"
          onClick={() => setAdminTab('issue')}
          className={`pb-2 px-3 border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            adminTab === 'issue'
              ? 'border-emerald-500 text-emerald-400 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FilePlus className="w-4 h-4" />
          Mint Certificate
        </button>

        <button
          id="admin-tab-review"
          onClick={() => setAdminTab('review')}
          className={`pb-2 px-3 border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            adminTab === 'review'
              ? 'border-emerald-500 text-emerald-400 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Clock className="w-4 h-4" />
          External Approvals ({pendingReviewCerts.length})
        </button>

        <button
          id="admin-tab-events"
          onClick={() => setAdminTab('events')}
          className={`pb-2 px-3 border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            adminTab === 'events'
              ? 'border-emerald-500 text-emerald-400 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Calendar className="w-4 h-4" />
          Academic Events ({events.length})
        </button>

        <button
          id="admin-tab-audit"
          onClick={() => setAdminTab('audit')}
          className={`pb-2 px-3 border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            adminTab === 'audit'
              ? 'border-emerald-500 text-emerald-400 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          Security Audit Logs ({logs.length})
        </button>
      </div>

      {/* Tab 1: Certificate Directory & Management */}
      {adminTab === 'manage' && (
        <div className="space-y-4">
          {/* Search & Filter bar */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch justify-between">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by ID, student name, course, roll number..."
                className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active & Verified</option>
                <option value="revoked">Revoked</option>
                <option value="pending_review">Pending Review</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 uppercase tracking-wider font-semibold text-[10px]">
                  <tr>
                    <th className="p-3.5">Certificate ID</th>
                    <th className="p-3.5">Recipient</th>
                    <th className="p-3.5">Program / Course</th>
                    <th className="p-3.5">Issuing Authority</th>
                    <th className="p-3.5">Issue Date</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {filteredCertificates.map((cert) => {
                    const isActive = cert.status === 'active';
                    const isRevoked = cert.status === 'revoked';
                    const isPending = cert.status === 'pending_review';

                    return (
                      <tr key={cert.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="p-3.5 font-mono-code font-bold text-slate-200">
                          {cert.id}
                        </td>
                        <td className="p-3.5">
                          <div className="font-semibold text-white">{cert.recipientName}</div>
                          <div className="text-[10px] text-slate-400 font-mono-code">Roll: {cert.studentRollNo}</div>
                        </td>
                        <td className="p-3.5 max-w-[220px]">
                          <div className="text-slate-200 truncate font-medium">{cert.courseName}</div>
                          <div className="text-[10px] text-amber-400">{cert.gradeOrHonors}</div>
                        </td>
                        <td className="p-3.5 max-w-[180px] truncate text-slate-400">
                          {cert.institutionName}
                        </td>
                        <td className="p-3.5 font-mono-code text-slate-400">
                          {cert.issueDate}
                        </td>
                        <td className="p-3.5">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold inline-flex items-center gap-1 ${
                            isActive
                              ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/50'
                              : isRevoked
                              ? 'bg-rose-950/80 text-rose-400 border border-rose-800/50'
                              : 'bg-amber-950/80 text-amber-400 border border-amber-800/50'
                          }`}>
                            {isActive ? 'Active' : isRevoked ? 'Revoked' : 'Pending'}
                          </span>
                        </td>
                        <td className="p-3.5 text-right space-x-1.5 whitespace-nowrap">
                          <button
                            onClick={() => setSelectedCertificateModal(cert)}
                            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px] font-medium transition-colors cursor-pointer"
                          >
                            View
                          </button>

                          <button
                            onClick={() => setAiAuditCert(cert)}
                            className="px-2.5 py-1 bg-indigo-950/70 hover:bg-indigo-900 border border-indigo-700/50 text-indigo-300 rounded text-[11px] font-medium transition-colors cursor-pointer"
                            title="Run AI Forensic & Cryptographic Audit"
                          >
                            AI Audit
                          </button>

                          {isActive && (
                            <button
                              onClick={() => setRevokingCertId(cert.id)}
                              className="px-2.5 py-1 bg-rose-950/80 hover:bg-rose-900 border border-rose-800/60 text-rose-300 rounded text-[11px] font-medium transition-colors cursor-pointer"
                            >
                              Revoke
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Mint / Issue New Certificate */}
      {adminTab === 'issue' && (
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 sm:p-8 shadow-xl">
          <div className="mb-6 pb-4 border-b border-slate-700">
            <h2 className="text-xl font-bold text-white">Digital Certificate Issuance Engine</h2>
            <p className="text-xs text-slate-400 mt-1">
              Fills credentials, calculates cryptographic SHA-256 hash using the canonical protocol, and encodes official verification QR data.
            </p>
          </div>

          {issuedSuccessCert && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-950/70 border border-emerald-600 text-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <div className="font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  Certificate Minted Successfully!
                </div>
                <div className="text-xs text-slate-300 mt-1">
                  ID: <strong className="font-mono-code text-white">{issuedSuccessCert.id}</strong> • SHA-256: <span className="font-mono-code text-xs text-emerald-300">{issuedSuccessCert.sha256Hash.slice(0, 24)}...</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedCertificateModal(issuedSuccessCert)}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg"
                >
                  View Certificate
                </button>
                <button
                  onClick={() => setIssuedSuccessCert(null)}
                  className="text-xs text-slate-400 hover:text-white px-2"
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          <form onSubmit={handleIssueSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Student Full Name *
                </label>
                <input
                  id="issue-name"
                  type="text"
                  required
                  placeholder="e.g. Maya Lin"
                  value={issueForm.recipientName}
                  onChange={(e) => setIssueForm({ ...issueForm, recipientName: e.target.value })}
                  className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Student Roll / ID Number *
                </label>
                <input
                  id="issue-roll"
                  type="text"
                  required
                  placeholder="e.g. 2021CS099"
                  value={issueForm.studentRollNo}
                  onChange={(e) => setIssueForm({ ...issueForm, studentRollNo: e.target.value })}
                  className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs sm:text-sm font-mono-code focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Student Email *
                </label>
                <input
                  id="issue-email"
                  type="email"
                  required
                  placeholder="e.g. maya.lin@apex.edu"
                  value={issueForm.recipientEmail}
                  onChange={(e) => setIssueForm({ ...issueForm, recipientEmail: e.target.value })}
                  className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Degree / Program Title *
                </label>
                <input
                  id="issue-course"
                  type="text"
                  required
                  placeholder="e.g. Master of Science in Distributed Systems"
                  value={issueForm.courseName}
                  onChange={(e) => setIssueForm({ ...issueForm, courseName: e.target.value })}
                  className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Degree Specialization / Track Description
                </label>
                <input
                  id="issue-track"
                  type="text"
                  value={issueForm.degreeOrTrack}
                  onChange={(e) => setIssueForm({ ...issueForm, degreeOrTrack: e.target.value })}
                  className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Issuing Institution *
                </label>
                <select
                  id="issue-inst-select"
                  value={issueForm.institutionId}
                  onChange={(e) => handleInstitutionChange(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  {institutions.map((i) => (
                    <option key={i.id} value={i.id}>{i.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Issue Date *
                </label>
                <input
                  id="issue-date"
                  type="date"
                  required
                  value={issueForm.issueDate}
                  onChange={(e) => setIssueForm({ ...issueForm, issueDate: e.target.value })}
                  className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs sm:text-sm font-mono-code focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Grade / Distinction
                </label>
                <input
                  id="issue-grade"
                  type="text"
                  value={issueForm.gradeOrHonors}
                  onChange={(e) => setIssueForm({ ...issueForm, gradeOrHonors: e.target.value })}
                  className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Authorized Signatory Officer
                </label>
                <input
                  id="issue-signatory"
                  type="text"
                  value={issueForm.issuerSignatoryName}
                  onChange={(e) => setIssueForm({ ...issueForm, issuerSignatoryName: e.target.value })}
                  className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Signatory Title
                </label>
                <input
                  id="issue-title"
                  type="text"
                  value={issueForm.issuerTitle}
                  onChange={(e) => setIssueForm({ ...issueForm, issuerTitle: e.target.value })}
                  className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-300">
                  Skills / Competencies (Comma-Separated)
                </label>
                <button
                  type="button"
                  onClick={handleAIDraftCitation}
                  disabled={isDraftingCitation || !issueForm.courseName.trim()}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:text-slate-600"
                  title="Use Gemini to generate formal citation and accredited learning outcomes"
                >
                  <Sparkles className={`w-3.5 h-3.5 ${isDraftingCitation ? 'animate-spin text-emerald-400' : 'text-amber-400'}`} />
                  <span>{isDraftingCitation ? 'AI Drafting Citation...' : 'AI Auto-Draft Citation & Outcomes'}</span>
                </button>
              </div>
              <input
                id="issue-skills"
                type="text"
                value={issueForm.skills}
                onChange={(e) => setIssueForm({ ...issueForm, skills: e.target.value })}
                className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            {aiCitationDraft && (
              <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-800/60 space-y-2 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    AI-Synthesized Academic Citation & Conferral Clause
                  </span>
                  <button
                    type="button"
                    onClick={() => setAiCitationDraft(null)}
                    className="text-xs text-slate-400 hover:text-white"
                  >
                    ✕
                  </button>
                </div>
                <p className="text-xs text-slate-200 italic leading-relaxed bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                  "{aiCitationDraft.citation}"
                </p>
                {aiCitationDraft.learningOutcomes && aiCitationDraft.learningOutcomes.length > 0 && (
                  <div className="pt-1">
                    <span className="text-[11px] font-semibold text-slate-400 block mb-1">Accredited Learning Outcomes:</span>
                    <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
                      {aiCitationDraft.learningOutcomes.map((lo, i) => (
                        <li key={i}>{lo}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            <div className="pt-4 border-t border-slate-700 flex justify-end">
              <button
                id="submit-issue-btn"
                type="submit"
                disabled={isIssuing}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-lg transition-colors flex items-center gap-2"
              >
                {isIssuing ? (
                  <>Minting Cryptographic Credential...</>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    Mint Digital Certificate & Seal
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 3: External Uploads Review Queue */}
      {adminTab === 'review' && (
        <div className="space-y-4">
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4 text-xs text-slate-300">
            Students can submit external degrees or competition certificates for official verification and academic credit transfer. Review submissions and award verified institutional seals.
          </div>

          {pendingReviewCerts.length === 0 ? (
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
              <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-emerald-500" />
              <p className="text-sm font-semibold text-white">Verification Queue Clear!</p>
              <p className="text-xs mt-1">No external documents pending administrator endorsement.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingReviewCerts.map((cert) => (
                <div
                  key={cert.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl"
                >
                  <div className="space-y-2 max-w-2xl">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono-code text-amber-400 bg-amber-950 px-2 py-0.5 rounded border border-amber-800">
                        {cert.id}
                      </span>
                      <span className="text-xs font-semibold text-slate-400">
                        Submitted: {cert.issueDate}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-white">
                      {cert.courseName}
                    </h3>

                    <div className="text-xs text-slate-300">
                      Student: <strong className="text-white">{cert.recipientName}</strong> (Roll: {cert.studentRollNo}) • Issuing Body: <span className="text-slate-200">{cert.institutionName}</span>
                    </div>

                    {cert.externalFileName && (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-[11px] font-mono-code text-slate-400">
                        <FileText className="w-3.5 h-3.5 text-slate-400" />
                        Attached File: {cert.externalFileName}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <button
                      onClick={() => setAiScreenCert(cert)}
                      className="px-3.5 py-2 bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-700/60 text-indigo-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="Run AI Pre-Validation and Accreditation Inspection"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                      <span>AI Pre-Screen</span>
                    </button>

                    <button
                      onClick={() => approveUploadedCertificate(cert.id)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow transition-colors cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Approve & Mint Official Seal
                    </button>

                    <button
                      onClick={() => rejectUploadedCertificate(cert.id, 'Unable to verify original signature with issuing registrar')}
                      className="px-3.5 py-2 bg-rose-950 hover:bg-rose-900 border border-rose-800 text-rose-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Academic Events Management */}
      {adminTab === 'events' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 shadow-xl">
            <h3 className="text-base font-bold text-white mb-3">Create Academic Event</h3>
            <form onSubmit={handleCreateEventSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Event Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Winter Blockchain Summit"
                  value={eventForm.title}
                  onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                  className="w-full p-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Category</label>
                <select
                  value={eventForm.category}
                  onChange={(e) => setEventForm({ ...eventForm, category: e.target.value as any })}
                  className="w-full p-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white"
                >
                  <option value="Hackathon">Hackathon</option>
                  <option value="Workshop">Workshop</option>
                  <option value="Conference">Conference</option>
                  <option value="Symposium">Symposium</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Date</label>
                  <input
                    type="date"
                    value={eventForm.date}
                    onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                    className="w-full p-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white font-mono-code"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Credits Awarded</label>
                  <input
                    type="number"
                    value={eventForm.credits}
                    onChange={(e) => setEventForm({ ...eventForm, credits: parseInt(e.target.value) || 50 })}
                    className="w-full p-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Venue</label>
                <input
                  type="text"
                  value={eventForm.venue}
                  onChange={(e) => setEventForm({ ...eventForm, venue: e.target.value })}
                  className="w-full p-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Description</label>
                <textarea
                  rows={3}
                  value={eventForm.description}
                  onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                  placeholder="Short brief on topics, workshops, and certified badge requirements..."
                  className="w-full p-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-xs transition-colors shadow"
              >
                Publish Event
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-base font-bold text-white">Active Academic Events ({events.length})</h3>
            <div className="space-y-3">
              {events.map((evt) => (
                <div key={evt.id} className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-indigo-950 text-indigo-400 border border-indigo-800">
                      {evt.category}
                    </span>
                    <h4 className="text-sm font-bold text-white mt-1">{evt.title}</h4>
                    <p className="text-xs text-slate-400 font-mono-code mt-0.5">
                      📅 {evt.date} • 📍 {evt.venue} • 🏆 +{evt.credits} Credits
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono-code text-emerald-400 font-bold">
                      {evt.registeredStudentIds.length} Registered
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Security Audit Logs */}
      {adminTab === 'audit' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-xs">
            <span className="font-semibold text-white">Verification & Tamper Audit Log</span>
            <span className="text-slate-400 font-mono-code">{logs.length} logged events</span>
          </div>

          <div className="divide-y divide-slate-800/60 max-h-[500px] overflow-y-auto">
            {logs.map((log) => (
              <div key={log.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      log.status === 'VERIFIED_VALID' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                      log.status === 'REVOKED' ? 'bg-rose-950 text-rose-400 border border-rose-800' :
                      log.status === 'TAMPERED_HASH_MISMATCH' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                      'bg-slate-800 text-slate-400'
                    }`}>
                      {log.status}
                    </span>
                    <span className="font-mono-code font-bold text-white">{log.certificateId}</span>
                    <span className="text-slate-400">Method: {log.method}</span>
                  </div>
                  <p className="text-slate-300 text-xs mt-1">{log.details}</p>
                </div>

                <div className="text-right text-[11px] font-mono-code text-slate-500 shrink-0">
                  <div>{log.verifierLocation} ({log.verifierIp})</div>
                  <div>{new Date(log.timestamp).toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Revocation Reason Modal */}
      {revokingCertId && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-rose-800/80 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <ShieldAlert className="w-6 h-6" />
              <h3 className="text-base font-bold text-white">Revoke Certificate</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Revoking this credential will mark it as null & void in all real-time verification checks and QR authentications across the registry.
            </p>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Reason for Revocation *
              </label>
              <textarea
                rows={3}
                required
                value={revocationReason}
                onChange={(e) => setRevocationReason(e.target.value)}
                placeholder="e.g. Administrative credit re-evaluation, honor code sanction, duplicate issuance..."
                className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-rose-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => { setRevokingCertId(null); setRevocationReason(''); }}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmRevocation}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs rounded-xl shadow transition-colors"
              >
                Confirm Revocation
              </button>
            </div>
          </div>
        </div>
      )}
      {/* AI Forensic Audit Modal */}
      {aiAuditCert && (
        <AIForensicAuditModal
          certificate={aiAuditCert}
          onClose={() => setAiAuditCert(null)}
        />
      )}

      {/* AI External Screen Modal */}
      {aiScreenCert && (
        <AIScreenExternalModal
          certificate={aiScreenCert}
          onClose={() => setAiScreenCert(null)}
          onApproveDirect={() => {
            approveUploadedCertificate(aiScreenCert.id);
          }}
        />
      )}
    </div>
  );
};
