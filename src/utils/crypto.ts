import QRCode from 'qrcode';
import { Certificate } from '../types';

/**
 * Converts ArrayBuffer to lowercase hex string
 */
export function bufferToHex(buffer: ArrayBuffer): string {
  const byteArray = new Uint8Array(buffer);
  return Array.from(byteArray)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Builds deterministic canonical representation of certificate critical payload
 */
export function buildCanonicalPayload(cert: {
  id: string;
  recipientName: string;
  studentRollNo: string;
  courseName: string;
  institutionName: string;
  issueDate: string;
  gradeOrHonors: string;
}): string {
  return [
    `ID:${cert.id.trim()}`,
    `NAME:${cert.recipientName.trim().toUpperCase()}`,
    `ROLL:${cert.studentRollNo.trim().toUpperCase()}`,
    `COURSE:${cert.courseName.trim().toUpperCase()}`,
    `INSTITUTION:${cert.institutionName.trim().toUpperCase()}`,
    `DATE:${cert.issueDate.trim()}`,
    `GRADE:${cert.gradeOrHonors.trim().toUpperCase()}`,
  ].join('|');
}

/**
 * Computes SHA-256 hash string from string using browser native Web Crypto API
 */
export async function computeSHA256(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return bufferToHex(hashBuffer);
}

/**
 * Computes SHA-256 for a certificate based on its canonical payload
 */
export async function computeCertificateHash(cert: {
  id: string;
  recipientName: string;
  studentRollNo: string;
  courseName: string;
  institutionName: string;
  issueDate: string;
  gradeOrHonors: string;
}): Promise<string> {
  const canonical = buildCanonicalPayload(cert);
  return await computeSHA256(canonical);
}

/**
 * Computes SHA-256 of an uploaded file (ArrayBuffer)
 */
export async function computeFileSHA256(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
  return bufferToHex(hashBuffer);
}

/**
 * Generates a verification QR code data URL
 */
export async function generateCertificateQRCode(
  certId: string,
  hash: string
): Promise<string> {
  try {
    // Encodes a standard verification payload or URL
    const payload = JSON.stringify({
      certId,
      hash: hash.substring(0, 16),
      verifyUrl: `https://verify.cert-vault.edu/?id=${certId}`,
    });
    return await QRCode.toDataURL(payload, {
      width: 256,
      margin: 1,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'H',
    });
  } catch (err) {
    console.error('Failed to generate QR code:', err);
    return '';
  }
}

/**
 * Verifies certificate integrity against stored hash
 */
export async function verifyIntegrity(
  cert: Certificate
): Promise<{
  isValid: boolean;
  computedHash: string;
  storedHash: string;
  canonicalString: string;
}> {
  const canonical = buildCanonicalPayload(cert);
  const computedHash = await computeSHA256(canonical);
  const isValid = computedHash.toLowerCase() === cert.sha256Hash.toLowerCase();

  return {
    isValid,
    computedHash,
    storedHash: cert.sha256Hash,
    canonicalString: canonical,
  };
}

/**
 * Formats a long SHA-256 hash into human-readable segments (e.g. 8 chars each)
 */
export function formatHashDisplay(hash: string): string {
  if (!hash) return '';
  return hash.match(/.{1,8}/g)?.join(' ') || hash;
}
