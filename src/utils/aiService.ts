import { Certificate } from '../types';

export interface ForensicAuditResult {
  trustScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  verdict: 'AUTHENTIC' | 'QUESTIONABLE' | 'SUSPICIOUS' | 'TAMPERED';
  summary: string;
  checks: Array<{
    name: string;
    status: 'PASS' | 'WARN' | 'FAIL';
    detail: string;
  }>;
  forensicObservations: string[];
  recommendations: string[];
}

export interface CareerInsightsResult {
  executiveHeadline: string;
  summary: string;
  topCompetencies: Array<{
    area: string;
    proficiency: string;
    skills: string[];
  }>;
  linkedInBulletPoints: string[];
  recommendedNextCredentials: string[];
  targetJobRoles: string[];
}

export interface CitationDraftResult {
  citation: string;
  learningOutcomes: string[];
  suggestedSkills: string[];
  signatoryEndorsement: string;
}

export interface ScreenExternalResult {
  recommendation: 'APPROVE' | 'NEEDS_MANUAL_REVIEW' | 'REJECT';
  confidence: number;
  riskRating: 'LOW' | 'MEDIUM' | 'HIGH';
  summary: string;
  validationNotes: string[];
  suggestedReviewerQuestions: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
}

// 1. Analyze Certificate Forensics
export async function analyzeCertificateForensics(
  certificate: Certificate,
  isTampered: boolean = false,
  computedHash?: string
): Promise<ForensicAuditResult> {
  const res = await fetch('/api/ai/analyze-certificate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ certificate, isTampered, computedHash }),
  });
  if (!res.ok) {
    throw new Error(`Failed to audit certificate: ${res.statusText}`);
  }
  return res.json();
}

// 2. Chat with CertVault Copilot
export async function sendAIChatMessage(
  messages: Array<{ role: 'user' | 'model'; content: string }>,
  userRole: 'student' | 'admin' | 'institution',
  contextData?: any
): Promise<string> {
  const res = await fetch('/api/ai/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, userRole, contextData }),
  });
  if (!res.ok) {
    throw new Error(`AI chat error: ${res.statusText}`);
  }
  const data = await res.json();
  return data.reply;
}

// 3. Draft Citation & Learning Outcomes
export async function draftCertificateCitation(params: {
  courseName: string;
  recipientName: string;
  institutionName: string;
  skills: string[];
  category: string;
  gradeOrHonors: string;
}): Promise<CitationDraftResult> {
  const res = await fetch('/api/ai/draft-citation', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    throw new Error(`Citation draft error: ${res.statusText}`);
  }
  return res.json();
}

// 4. Screen External Certificate
export async function screenExternalCertificate(params: {
  recipientName: string;
  studentRollNo: string;
  institutionName: string;
  courseName: string;
  skills: string[];
  fileName?: string;
}): Promise<ScreenExternalResult> {
  const res = await fetch('/api/ai/screen-external', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    throw new Error(`Screening error: ${res.statusText}`);
  }
  return res.json();
}

// 5. Generate Career Insights
export async function generateStudentCareerInsights(
  studentName: string,
  certificates: Certificate[]
): Promise<CareerInsightsResult> {
  const res = await fetch('/api/ai/career-insights', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ studentName, certificates }),
  });
  if (!res.ok) {
    throw new Error(`Career insights error: ${res.statusText}`);
  }
  return res.json();
}
