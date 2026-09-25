import React, { useState } from 'react';
import {
  Building2,
  Award,
  ShieldCheck,
  FileText,
  Users,
  MapPin,
  Mail,
  Calendar,
  CheckCircle,
  BarChart,
  Plus,
  ExternalLink,
} from 'lucide-react';
import { useCertificate } from '../context/CertificateContext';
import { Institution } from '../types';

export const InstitutionDashboard: React.FC = () => {
  const { institutions, certificates, setSelectedCertificateModal, createInstitution } = useCertificate();
  const [selectedInstId, setSelectedInstId] = useState<string>(institutions[0]?.id || 'inst-apex');
  const [showAddInst, setShowAddInst] = useState(false);

  // New Institution Form
  const [newInst, setNewInst] = useState({
    name: '',
    code: '',
    accreditation: 'ABET Accredited | ISO 9001:2015',
    location: '',
    authorizedSignatory: '',
    signatoryTitle: 'Registrar & Provost',
    contactEmail: '',
    establishedYear: 2000,
    sealColor: '#0369a1',
  });

  const currentInst = institutions.find((i) => i.id === selectedInstId) || institutions[0];
  const instCertificates = certificates.filter((c) => c.institutionId === currentInst.id);

  const handleAddInstitution = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInst.name || !newInst.code) return;

    createInstitution({
      ...newInst,
    });
    setShowAddInst(false);
    setNewInst({
      name: '',
      code: '',
      accreditation: 'ABET Accredited | ISO 9001:2015',
      location: '',
      authorizedSignatory: '',
      signatoryTitle: 'Registrar & Provost',
      contactEmail: '',
      establishedYear: 2000,
      sealColor: '#0369a1',
    });
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950 border border-blue-800 text-blue-400 text-xs font-semibold mb-2">
            <Building2 className="w-4 h-4" />
            ACCREDITED INSTITUTION DIRECTORY
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Institution & Authority Governance
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Manage academic institutions, accreditation records, cryptographic public keys, and authorized signatory credentials.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedInstId}
            onChange={(e) => setSelectedInstId(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-white text-xs rounded-xl px-3.5 py-2.5 font-medium focus:ring-1 focus:ring-emerald-500"
          >
            {institutions.map((i) => (
              <option key={i.id} value={i.id}>{i.name}</option>
            ))}
          </select>

          <button
            onClick={() => setShowAddInst(true)}
            className="px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Institution
          </button>
        </div>
      </div>

      {/* Institution Detail Showcase */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-slate-700">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-900 border-2 border-[#d4af37] flex items-center justify-center shadow-lg">
              <Award className="w-8 h-8 text-[#d4af37]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-bold text-white">{currentInst.name}</h2>
                <span className="text-xs font-mono-code px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-emerald-400">
                  {currentInst.code}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 font-medium">
                {currentInst.accreditation}
              </p>
              <div className="flex items-center gap-4 mt-2 text-xs text-slate-400 font-mono-code">
                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {currentInst.location}</span>
                <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> {currentInst.contactEmail}</span>
                <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Est. {currentInst.establishedYear}</span>
              </div>
            </div>
          </div>

          <div className="flex sm:flex-col items-end gap-2 text-right">
            <div className="text-xs text-slate-400">Total Authenticated Issuances</div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono-code">
              {(currentInst.totalIssued + instCertificates.length).toLocaleString()}
            </div>
          </div>
        </div>

        {/* Signatory & Security Info */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
          <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
            <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold block">Authorized Signatory</span>
            <div className="text-sm font-bold text-white mt-1">{currentInst.authorizedSignatory}</div>
            <div className="text-xs text-slate-400">{currentInst.signatoryTitle}</div>
          </div>

          <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
            <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold block">Cryptographic Assurance</span>
            <div className="text-sm font-bold text-emerald-400 mt-1">SHA-256 / Dual-Hash Standard</div>
            <div className="text-xs text-slate-400">ECDSA + Web Crypto Verification</div>
          </div>

          <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
            <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold block">Accreditation Status</span>
            <div className="text-sm font-bold text-white mt-1 flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              Fully Verified & In Good Standing
            </div>
            <div className="text-xs text-slate-400">Official Government Registry</div>
          </div>
        </div>
      </div>

      {/* Institution Issued Certificates Table */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-white">
          Active Certificates Issued by {currentInst.name} ({instCertificates.length})
        </h3>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold text-[10px] border-b border-slate-800">
                <tr>
                  <th className="p-3.5">ID</th>
                  <th className="p-3.5">Student</th>
                  <th className="p-3.5">Program</th>
                  <th className="p-3.5">Issue Date</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Certificate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {instCertificates.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3.5 font-mono-code font-semibold text-slate-200">{c.id}</td>
                    <td className="p-3.5 text-white font-medium">{c.recipientName}</td>
                    <td className="p-3.5 text-slate-300">{c.courseName}</td>
                    <td className="p-3.5 font-mono-code text-slate-400">{c.issueDate}</td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        c.status === 'active' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-rose-950 text-rose-400 border border-rose-800'
                      }`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => setSelectedCertificateModal(c)}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px]"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Institution Modal */}
      {showAddInst && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Register New Educational Institution</h3>
              <button onClick={() => setShowAddInst(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleAddInstitution} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Institution Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cambridge Science & Technology Institute"
                  value={newInst.name}
                  onChange={(e) => setNewInst({ ...newInst, name: e.target.value })}
                  className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Code / Prefix *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CSTI-8801"
                    value={newInst.code}
                    onChange={(e) => setNewInst({ ...newInst, code: e.target.value })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-mono-code"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Established Year</label>
                  <input
                    type="number"
                    value={newInst.establishedYear}
                    onChange={(e) => setNewInst({ ...newInst, establishedYear: parseInt(e.target.value) || 2000 })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Accreditation Standards</label>
                <input
                  type="text"
                  value={newInst.accreditation}
                  onChange={(e) => setNewInst({ ...newInst, accreditation: e.target.value })}
                  className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Signatory Officer</label>
                  <input
                    type="text"
                    value={newInst.authorizedSignatory}
                    onChange={(e) => setNewInst({ ...newInst, authorizedSignatory: e.target.value })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Official Contact Email</label>
                  <input
                    type="email"
                    value={newInst.contactEmail}
                    onChange={(e) => setNewInst({ ...newInst, contactEmail: e.target.value })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddInst(false)}
                  className="px-3 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow"
                >
                  Save Institution
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
