import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Certificate,
  Institution,
  AcademicEvent,
  User,
  VerificationLog,
  UserRole,
} from '../types';
import {
  INITIAL_CERTIFICATES,
  INITIAL_INSTITUTIONS,
  INITIAL_EVENTS,
  INITIAL_LOGS,
  INITIAL_USERS,
} from '../data/mockData';
import { computeCertificateHash, verifyIntegrity } from '../utils/crypto';

interface VerificationResult {
  found: boolean;
  certificate?: Certificate;
  status: 'VERIFIED_VALID' | 'TAMPERED_HASH_MISMATCH' | 'REVOKED' | 'EXPIRED' | 'PENDING_REVIEW' | 'NOT_FOUND';
  computedHash?: string;
  storedHash?: string;
  canonicalString?: string;
  message: string;
}

interface CertificateContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  isAuthenticated: boolean;
  login: (emailOrUsername: string, password: string, role: UserRole) => { success: boolean; message?: string; user?: User };
  logout: () => void;
  switchRole: (role: UserRole) => void;
  accessDeniedNotice: { title: string; message: string; requiredRole: UserRole } | null;
  setAccessDeniedNotice: (notice: { title: string; message: string; requiredRole: UserRole } | null) => void;
  allUsers: User[];
  certificates: Certificate[];
  institutions: Institution[];
  events: AcademicEvent[];
  logs: VerificationLog[];
  issueCertificate: (data: Omit<Certificate, 'id' | 'sha256Hash' | 'status' | 'createdAt'>) => Promise<Certificate>;
  revokeCertificate: (id: string, reason: string) => void;
  uploadExternalCertificate: (
    data: {
      recipientName: string;
      studentRollNo: string;
      courseName: string;
      degreeOrTrack: string;
      institutionName: string;
      institutionId: string;
      issueDate: string;
      gradeOrHonors: string;
      skills: string[];
      category: Certificate['category'];
      externalFileName: string;
    }
  ) => Promise<Certificate>;
  approveUploadedCertificate: (id: string, notes?: string) => void;
  rejectUploadedCertificate: (id: string, reason: string) => void;
  verifyCertificateById: (certId: string, method?: 'QR_SCAN' | 'MANUAL_ID' | 'FILE_HASH_CHECK') => Promise<VerificationResult>;
  verifyTamperedPayload: (
    cert: Certificate,
    tamperedFields: Partial<Certificate>
  ) => Promise<{
    originalHash: string;
    tamperedHash: string;
    isTampered: boolean;
  }>;
  registerForEvent: (eventId: string) => boolean;
  createAcademicEvent: (eventData: Omit<AcademicEvent, 'id' | 'registeredStudentIds'>) => void;
  createInstitution: (instData: Omit<Institution, 'id' | 'totalIssued'>) => void;
  selectedCertificateModal: Certificate | null;
  setSelectedCertificateModal: (cert: Certificate | null) => void;
  resetDemoData: () => void;
}

const CertificateContext = createContext<CertificateContextType | undefined>(undefined);

const STORAGE_KEYS = {
  CERTIFICATES: 'cert_vault_certificates_v2',
  LOGS: 'cert_vault_logs_v2',
  EVENTS: 'cert_vault_events_v2',
  INSTITUTIONS: 'cert_vault_institutions_v2',
  USER: 'cert_vault_user_v2',
  AUTH_SESSION: 'cert_vault_session_v2',
};

export const CertificateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const session = localStorage.getItem(STORAGE_KEYS.AUTH_SESSION);
    return session === 'true';
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const session = localStorage.getItem(STORAGE_KEYS.AUTH_SESSION);
    if (session === 'true') {
      const saved = localStorage.getItem(STORAGE_KEYS.USER);
      if (saved) {
        try { return JSON.parse(saved); } catch (e) { /* ignore */ }
      }
      return INITIAL_USERS[0];
    }
    return null;
  });

  const [accessDeniedNotice, setAccessDeniedNotice] = useState<{
    title: string;
    message: string;
    requiredRole: UserRole;
  } | null>(null);

  const [certificates, setCertificates] = useState<Certificate[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CERTIFICATES);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return INITIAL_CERTIFICATES;
  });

  const [institutions, setInstitutions] = useState<Institution[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.INSTITUTIONS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return INITIAL_INSTITUTIONS;
  });

  const [events, setEvents] = useState<AcademicEvent[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.EVENTS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return INITIAL_EVENTS;
  });

  const [logs, setLogs] = useState<VerificationLog[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.LOGS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return INITIAL_LOGS;
  });

  const [selectedCertificateModal, setSelectedCertificateModal] = useState<Certificate | null>(null);

  // Synchronize authentic hashes for initial certificates on mount
  useEffect(() => {
    const syncHashes = async () => {
      let changed = false;
      const updated = await Promise.all(
        certificates.map(async (cert) => {
          if (cert.status !== 'revoked' && !cert.isUploadedExternal) {
            const expectedHash = await computeCertificateHash(cert);
            if (cert.sha256Hash !== expectedHash) {
              changed = true;
              return { ...cert, sha256Hash: expectedHash };
            }
          }
          return cert;
        })
      );
      if (changed) {
        setCertificates(updated);
      }
    };
    syncHashes();
  }, []);

  // Persistence effects
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CERTIFICATES, JSON.stringify(certificates));
  }, [certificates]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs));
  }, [logs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.INSTITUTIONS, JSON.stringify(institutions));
  }, [institutions]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(STORAGE_KEYS.USER);
    }
  }, [currentUser]);

  const login = (
    emailOrUsername: string,
    password: string,
    role: UserRole
  ): { success: boolean; message?: string; user?: User } => {
    const trimmed = emailOrUsername.trim().toLowerCase();
    if (!trimmed) {
      return {
        success: false,
        message: 'Please enter your institutional email, username, or student roll number.',
      };
    }
    if (!password || password.length < 3) {
      return { success: false, message: 'Password must contain at least 3 characters.' };
    }

    // 1. Direct match on email, studentRollNo, or name
    let matchedUser = INITIAL_USERS.find(
      (u) =>
        u.role === role &&
        (u.email.toLowerCase() === trimmed ||
          (u.studentRollNo && u.studentRollNo.toLowerCase() === trimmed) ||
          u.name.toLowerCase().includes(trimmed))
    );

    // 2. Convenience aliases (e.g. "admin", "student", "aarav", "vance")
    if (!matchedUser) {
      if (role === 'admin' && (trimmed === 'admin' || trimmed.includes('vance') || trimmed.includes('admin') || trimmed === 'registrar')) {
        matchedUser = INITIAL_USERS.find((u) => u.role === 'admin');
      } else if (role === 'student' && (trimmed === 'student' || trimmed.includes('aarav') || trimmed.includes('2021cs') || trimmed === 'learner')) {
        matchedUser = INITIAL_USERS.find((u) => u.role === 'student');
      } else if (role === 'institution' && (trimmed === 'institution' || trimmed.includes('metro') || trimmed.includes('dean'))) {
        matchedUser = INITIAL_USERS.find((u) => u.role === 'institution');
      }
    }

    // 3. Check if entered credentials match an account of another role
    const otherAccount = INITIAL_USERS.find(
      (u) =>
        u.email.toLowerCase() === trimmed ||
        (u.studentRollNo && u.studentRollNo.toLowerCase() === trimmed)
    );
    if (otherAccount && otherAccount.role !== role) {
      return {
        success: false,
        message: `Account is registered as '${otherAccount.role.toUpperCase()}'. Please select the '${otherAccount.role.toUpperCase()}' role above.`,
      };
    }

    // 4. Default fallback for testing if user chose that role
    if (!matchedUser) {
      matchedUser = INITIAL_USERS.find((u) => u.role === role);
    }

    if (matchedUser) {
      setCurrentUser(matchedUser);
      setIsAuthenticated(true);
      setAccessDeniedNotice(null);
      localStorage.setItem(STORAGE_KEYS.AUTH_SESSION, 'true');
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(matchedUser));
      return { success: true, user: matchedUser };
    }

    return {
      success: false,
      message: 'Invalid credentials. Please verify your email and password.',
    };
  };

  const logout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    setAccessDeniedNotice(null);
    localStorage.removeItem(STORAGE_KEYS.AUTH_SESSION);
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem('cert_vault_active_view_v2');
  };

  const switchRole = (role: UserRole) => {
    const targetUser = INITIAL_USERS.find((u) => u.role === role) || INITIAL_USERS[0];
    setCurrentUser(targetUser);
    if (isAuthenticated) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(targetUser));
    }
  };

  const issueCertificate = async (
    data: Omit<Certificate, 'id' | 'sha256Hash' | 'status' | 'createdAt'>
  ): Promise<Certificate> => {
    const uniqueNum = Math.floor(1000 + Math.random() * 9000);
    const suffix = String.fromCharCode(65 + Math.floor(Math.random() * 26));
    const year = new Date().getFullYear();
    const id = `CERT-${year}-${uniqueNum}${suffix}`;

    const preliminary = {
      ...data,
      id,
      status: 'active' as const,
      createdAt: new Date().toISOString(),
    };

    const sha256Hash = await computeCertificateHash(preliminary);
    const newCert: Certificate = {
      ...preliminary,
      sha256Hash,
    };

    setCertificates((prev) => [newCert, ...prev]);

    // Update institution issuance count
    setInstitutions((prev) =>
      prev.map((inst) =>
        inst.id === data.institutionId
          ? { ...inst, totalIssued: inst.totalIssued + 1 }
          : inst
      )
    );

    // Add issuance audit log
    const auditLog: VerificationLog = {
      id: `LOG-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toISOString(),
      certificateId: id,
      recipientName: data.recipientName,
      courseName: data.courseName,
      verifierIp: '127.0.0.1 (Admin Node)',
      verifierLocation: 'Primary Issuer Registry',
      status: 'VERIFIED_VALID',
      method: 'MANUAL_ID',
      details: `New digital credential formally minted with SHA-256 hash ${sha256Hash.substring(0, 16)}...`,
    };
    setLogs((prev) => [auditLog, ...prev]);

    return newCert;
  };

  const revokeCertificate = (id: string, reason: string) => {
    setCertificates((prev) =>
      prev.map((cert) => {
        if (cert.id === id) {
          return {
            ...cert,
            status: 'revoked',
            revocationReason: reason || 'Administrative decision by issuing authority',
            revokedAt: new Date().toISOString(),
          };
        }
        return cert;
      })
    );

    const revokedCert = certificates.find((c) => c.id === id);
    const auditLog: VerificationLog = {
      id: `LOG-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toISOString(),
      certificateId: id,
      recipientName: revokedCert?.recipientName,
      courseName: revokedCert?.courseName,
      verifierIp: '127.0.0.1 (Admin Node)',
      verifierLocation: 'Authority Compliance Center',
      status: 'REVOKED',
      method: 'MANUAL_ID',
      details: `Certificate revoked: ${reason}`,
    };
    setLogs((prev) => [auditLog, ...prev]);
  };

  const uploadExternalCertificate = async (data: {
    recipientName: string;
    studentRollNo: string;
    courseName: string;
    degreeOrTrack: string;
    institutionName: string;
    institutionId: string;
    issueDate: string;
    gradeOrHonors: string;
    skills: string[];
    category: Certificate['category'];
    externalFileName: string;
  }): Promise<Certificate> => {
    const id = `CERT-EXT-${Math.floor(1000 + Math.random() * 9000)}P`;
    const preliminary = {
      ...data,
      id,
      recipientEmail: currentUser?.email || 'student@apex.edu',
      issuerSignatoryName: 'External Registrar Verification',
      issuerTitle: 'Authority Pending Review',
      status: 'pending_review' as const,
      isUploadedExternal: true,
      createdAt: new Date().toISOString(),
      adminReviewNotes: 'Submitted for verification and credit transfer.',
    };

    const sha256Hash = await computeCertificateHash(preliminary);
    const newCert: Certificate = {
      ...preliminary,
      sha256Hash,
    };

    setCertificates((prev) => [newCert, ...prev]);
    return newCert;
  };

  const approveUploadedCertificate = async (id: string, notes?: string) => {
    const target = certificates.find((c) => c.id === id);
    if (!target) return;

    // Convert from pending review to active authentic credential
    const officialId = `CERT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}V`;
    const updatedCert: Certificate = {
      ...target,
      id: officialId,
      status: 'active',
      adminReviewNotes: notes || 'Approved and endorsed by Central Academic Registrar.',
      issuerSignatoryName: 'Dr. Alistair Vance (Central Endorsement)',
      issuerTitle: 'Chief Academic Registrar',
    };
    updatedCert.sha256Hash = await computeCertificateHash(updatedCert);

    setCertificates((prev) =>
      prev.map((c) => (c.id === id ? updatedCert : c))
    );

    // Award student credits
    setCurrentUser((prev) => {
      if (!prev) return null;
      if (prev.studentRollNo === target.studentRollNo) {
        return { ...prev, credits: (prev.credits || 0) + 100 };
      }
      return prev;
    });

    const auditLog: VerificationLog = {
      id: `LOG-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toISOString(),
      certificateId: officialId,
      recipientName: updatedCert.recipientName,
      courseName: updatedCert.courseName,
      verifierIp: '127.0.0.1 (Admin Node)',
      verifierLocation: 'Academic Credentials Review Board',
      status: 'VERIFIED_VALID',
      method: 'MANUAL_ID',
      details: 'External credential approved and issued official tamper-proof verification seal.',
    };
    setLogs((prev) => [auditLog, ...prev]);
  };

  const rejectUploadedCertificate = (id: string, reason: string) => {
    setCertificates((prev) => prev.filter((c) => c.id !== id));
    const auditLog: VerificationLog = {
      id: `LOG-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toISOString(),
      certificateId: id,
      verifierIp: '127.0.0.1 (Admin Node)',
      verifierLocation: 'Academic Credentials Review Board',
      status: 'REVOKED',
      method: 'MANUAL_ID',
      details: `External certificate submission rejected: ${reason}`,
    };
    setLogs((prev) => [auditLog, ...prev]);
  };

  const verifyCertificateById = async (
    query: string,
    method: 'QR_SCAN' | 'MANUAL_ID' | 'FILE_HASH_CHECK' = 'MANUAL_ID'
  ): Promise<VerificationResult> => {
    const cleaned = query.trim();

    // Check if query is JSON from QR code
    let searchId = cleaned;
    if (cleaned.startsWith('{') && cleaned.includes('certId')) {
      try {
        const parsed = JSON.parse(cleaned);
        searchId = parsed.certId || cleaned;
      } catch (e) {
        // keep as is
      }
    }

    const cert = certificates.find(
      (c) =>
        c.id.toLowerCase() === searchId.toLowerCase() ||
        c.sha256Hash.toLowerCase() === cleaned.toLowerCase()
    );

    const verifierLocations = [
      'New York, USA',
      'London, UK',
      'Singapore',
      'Berlin, Germany',
      'Tokyo, Japan',
      'Toronto, Canada',
    ];
    const randomLoc = verifierLocations[Math.floor(Math.random() * verifierLocations.length)];
    const randomIp = `192.168.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}`;

    if (!cert) {
      const logEntry: VerificationLog = {
        id: `LOG-${Date.now().toString().slice(-4)}`,
        timestamp: new Date().toISOString(),
        certificateId: searchId,
        verifierIp: randomIp,
        verifierLocation: randomLoc,
        status: 'NOT_FOUND',
        method,
        details: 'Lookup failed. No matching certificate found in public registry.',
      };
      setLogs((prev) => [logEntry, ...prev]);

      return {
        found: false,
        status: 'NOT_FOUND',
        message: 'No certificate matching this ID or cryptographic hash was found in the authoritative registry.',
      };
    }

    // Check Revocation first
    if (cert.status === 'revoked') {
      const logEntry: VerificationLog = {
        id: `LOG-${Date.now().toString().slice(-4)}`,
        timestamp: new Date().toISOString(),
        certificateId: cert.id,
        recipientName: cert.recipientName,
        courseName: cert.courseName,
        verifierIp: randomIp,
        verifierLocation: randomLoc,
        status: 'REVOKED',
        method,
        details: `Certificate has been officially revoked by issuing authority. Reason: ${cert.revocationReason || 'Administrative revocation'}`,
      };
      setLogs((prev) => [logEntry, ...prev]);

      return {
        found: true,
        certificate: cert,
        status: 'REVOKED',
        storedHash: cert.sha256Hash,
        message: `This certificate was REVOKED on ${cert.revokedAt ? new Date(cert.revokedAt).toLocaleDateString() : 'earlier date'}. Reason: ${cert.revocationReason}`,
      };
    }

    // Check Pending Review
    if (cert.status === 'pending_review') {
      return {
        found: true,
        certificate: cert,
        status: 'PENDING_REVIEW',
        storedHash: cert.sha256Hash,
        message: 'This external document is currently under institutional review and has not yet received a verified seal.',
      };
    }

    // Perform Cryptographic SHA-256 Tamper Detection
    const integrity = await verifyIntegrity(cert);

    if (!integrity.isValid) {
      const logEntry: VerificationLog = {
        id: `LOG-${Date.now().toString().slice(-4)}`,
        timestamp: new Date().toISOString(),
        certificateId: cert.id,
        recipientName: cert.recipientName,
        courseName: cert.courseName,
        verifierIp: randomIp,
        verifierLocation: randomLoc,
        status: 'TAMPERED_HASH_MISMATCH',
        method,
        details: `CRITICAL INTEGRITY FAILURE: Stored hash does not match computed SHA-256 of certificate payload! Potential unauthorized modification detected.`,
      };
      setLogs((prev) => [logEntry, ...prev]);

      return {
        found: true,
        certificate: cert,
        status: 'TAMPERED_HASH_MISMATCH',
        computedHash: integrity.computedHash,
        storedHash: integrity.storedHash,
        canonicalString: integrity.canonicalString,
        message: 'TAMPER WARNING: The certificate data payload does not match the immutable cryptographic hash recorded at time of issuance!',
      };
    }

    // Genuine and Valid!
    const logEntry: VerificationLog = {
      id: `LOG-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toISOString(),
      certificateId: cert.id,
      recipientName: cert.recipientName,
      courseName: cert.courseName,
      verifierIp: randomIp,
      verifierLocation: randomLoc,
      status: 'VERIFIED_VALID',
      method,
      details: `Authenticity confirmed. 256-bit hash matched canonical registry records. Issuing authority: ${cert.institutionName}.`,
    };
    setLogs((prev) => [logEntry, ...prev]);

    return {
      found: true,
      certificate: cert,
      status: 'VERIFIED_VALID',
      computedHash: integrity.computedHash,
      storedHash: integrity.storedHash,
      canonicalString: integrity.canonicalString,
      message: 'Certificate is 100% authentic, tamper-free, and actively validated by the issuing institution.',
    };
  };

  const verifyTamperedPayload = async (
    cert: Certificate,
    tamperedFields: Partial<Certificate>
  ) => {
    const altered = { ...cert, ...tamperedFields };
    const tamperedHash = await computeCertificateHash(altered);
    const isTampered = tamperedHash.toLowerCase() !== cert.sha256Hash.toLowerCase();

    return {
      originalHash: cert.sha256Hash,
      tamperedHash,
      isTampered,
    };
  };

  const registerForEvent = (eventId: string): boolean => {
    const event = events.find((e) => e.id === eventId);
    if (!event || !currentUser) return false;

    if (event.registeredStudentIds.includes(currentUser.id)) {
      return false; // already registered
    }

    setEvents((prev) =>
      prev.map((e) =>
        e.id === eventId
          ? { ...e, registeredStudentIds: [...e.registeredStudentIds, currentUser.id] }
          : e
      )
    );

    // Award student credits
    setCurrentUser((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        credits: (prev.credits || 0) + event.credits,
      };
    });

    return true;
  };

  const createAcademicEvent = (
    eventData: Omit<AcademicEvent, 'id' | 'registeredStudentIds'>
  ) => {
    const newEvent: AcademicEvent = {
      ...eventData,
      id: `evt-${Date.now().toString().slice(-4)}`,
      registeredStudentIds: [],
    };
    setEvents((prev) => [newEvent, ...prev]);
  };

  const createInstitution = (
    instData: Omit<Institution, 'id' | 'totalIssued'>
  ) => {
    const newInst: Institution = {
      ...instData,
      id: `inst-${Date.now().toString().slice(-4)}`,
      totalIssued: 0,
    };
    setInstitutions((prev) => [...prev, newInst]);
  };

  const resetDemoData = () => {
    localStorage.removeItem(STORAGE_KEYS.CERTIFICATES);
    localStorage.removeItem(STORAGE_KEYS.LOGS);
    localStorage.removeItem(STORAGE_KEYS.EVENTS);
    localStorage.removeItem(STORAGE_KEYS.INSTITUTIONS);
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.AUTH_SESSION);
    setCertificates(INITIAL_CERTIFICATES);
    setInstitutions(INITIAL_INSTITUTIONS);
    setEvents(INITIAL_EVENTS);
    setLogs(INITIAL_LOGS);
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  return (
    <CertificateContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        isAuthenticated,
        login,
        logout,
        switchRole,
        accessDeniedNotice,
        setAccessDeniedNotice,
        allUsers: INITIAL_USERS,
        certificates,
        institutions,
        events,
        logs,
        issueCertificate,
        revokeCertificate,
        uploadExternalCertificate,
        approveUploadedCertificate,
        rejectUploadedCertificate,
        verifyCertificateById,
        verifyTamperedPayload,
        registerForEvent,
        createAcademicEvent,
        createInstitution,
        selectedCertificateModal,
        setSelectedCertificateModal,
        resetDemoData,
      }}
    >
      {children}
    </CertificateContext.Provider>
  );
};

export const useCertificate = () => {
  const context = useContext(CertificateContext);
  if (!context) {
    throw new Error('useCertificate must be used within a CertificateProvider');
  }
  return context;
};
