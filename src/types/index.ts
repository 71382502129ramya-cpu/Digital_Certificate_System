export type UserRole = 'student' | 'admin' | 'institution';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl: string;
  department?: string;
  studentRollNo?: string;
  institutionId?: string;
  institutionName?: string;
  credits?: number;
  rank?: number;
}

export type CertificateStatus = 'active' | 'revoked' | 'expired' | 'pending_review';

export type CertificateCategory = 
  | 'Academic Degree'
  | 'Professional Certification'
  | 'Hackathon & Competition'
  | 'Workshop & Seminar'
  | 'Honor & Award';

export interface Certificate {
  id: string;
  recipientName: string;
  recipientEmail: string;
  studentRollNo: string;
  courseName: string;
  degreeOrTrack: string;
  institutionName: string;
  institutionId: string;
  issueDate: string;
  expiryDate?: string;
  gradeOrHonors: string;
  skills: string[];
  issuerSignatoryName: string;
  issuerTitle: string;
  sha256Hash: string;
  status: CertificateStatus;
  revocationReason?: string;
  revokedAt?: string;
  category: CertificateCategory;
  isUploadedExternal?: boolean;
  externalFileName?: string;
  adminReviewNotes?: string;
  createdAt: string;
}

export interface VerificationLog {
  id: string;
  timestamp: string;
  certificateId: string;
  recipientName?: string;
  courseName?: string;
  verifierIp: string;
  verifierLocation: string;
  status: 'VERIFIED_VALID' | 'TAMPERED_HASH_MISMATCH' | 'REVOKED' | 'NOT_FOUND';
  method: 'QR_SCAN' | 'MANUAL_ID' | 'FILE_HASH_CHECK';
  details: string;
}

export interface AcademicEvent {
  id: string;
  title: string;
  organizer: string;
  category: 'Hackathon' | 'Workshop' | 'Conference' | 'Symposium';
  date: string;
  venue: string;
  description: string;
  credits: number;
  certificateProvided: boolean;
  registeredStudentIds: string[];
  maxSeats: number;
  bannerColor: string;
}

export interface Institution {
  id: string;
  name: string;
  code: string;
  accreditation: string;
  location: string;
  authorizedSignatory: string;
  signatoryTitle: string;
  totalIssued: number;
  contactEmail: string;
  establishedYear: number;
  sealColor: string;
}
