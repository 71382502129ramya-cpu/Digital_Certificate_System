🔐 CERT-VAULT: Digital Certificate Verification System
An enterprise-grade, cryptographic web platform designed for digital academic credential issuance, real-time SHA-256 tamper-proof verification, QR code authentication, and AI-powered credential forensics.
Developed for educational institutions, university registrars, students, and employers to ensure zero-fraud credential validation.
🚀 Key Features
🛡️ Cryptographic Security & Tamper Detection
Deterministic SHA-256 Hashing: Every certificate payload is canonicalized into a strict JSON representation and hashed. Any 1-character modification triggers the avalanche effect, instantly failing authenticity checks.
Dual QR Code Authentication: Every certificate contains a dynamic high-density QR code linking directly to the instant public verification portal.
Interactive Tamper Lab: An experimental sandbox allowing users to modify certificate data (grades, names, dates) in real time to visualize hash divergence and cryptographic failure.
Certificate Revocation Engine: Irreversible revocation mechanism with registrar reason codes, audit timestamps, and real-time invalidation across public queries.
🤖 Gemini AI Forensics & Intelligence
AI Forensic Audit Engine (gemini-3.8-flash): Multi-dimensional inspection of cryptographic hashes, registrar authority credibility, curriculum taxonomy alignment, and tampering probability, producing a 0–100 AI Authenticity Trust Score.
Dual-Persona AI Copilot:
For Students: CertVault Academic & Career Advisor (explaining cryptographic verification to recruiters, drafting LinkedIn bullet points, recommending hackathons).
For Administrators: CertVault Senior Registrar & Security Compliance Copilot (explaining avalanche mechanics, drafting revocation protocols, analyzing audit logs).
AI Career & Competency Matrix: Automatically parses a student's verified credentials into industry-standard competency profiles, market-ready resume bullet points, and target job roles.
AI Formal Citation Synthesizer: Generates accredited academic conferral citations, signatory clauses, and learning outcomes during certificate minting.
AI External Certificate Pre-Screener: Analyzes student-uploaded third-party credentials for institutional accreditation status and formatting red flags.
👥 Role-Based Access Control (RBAC) & Portals
Secure Authentication Screen: Clean, security-focused authentication flow with dedicated portals for Students and Administrators.
Student Dashboard (Credential Wallet):
View, download, and print official tamper-proof certificates.
Run AI Forensic Audits and open the AI Career Matrix.
Upload external certificates for registrar endorsement.
Register for upcoming academic events, hackathons, and workshops.
Administrator Console (Central Registrar Authority):
Mint single or batch cryptographic certificates with official seals.
Review and approve/reject external student submissions with AI Pre-Screening.
Manage live certificate revocations with recorded justification.
Inspect real-time verification audit logs with IP and geolocations.
Create and manage academic events with automatic credit awarding.
Public Verification Portal:
Verification via Certificate ID lookup, QR image scanning, or direct document file SHA-256 byte hashing.
Publicly accessible to employers and background check agencies.
Campus Leaderboard:
Tracks academic credits, distinctions, and verified credential counts across students.
🛠️ Technology Stack
Layer	Technologies
Frontend	React 19, TypeScript, Vite, Tailwind CSS, Lucide Icons, Canvas Confetti
Backend	Node.js, Express, tsx (Full-Stack Vite Middleware)
AI Engine	Google GenAI TypeScript SDK (@google/genai), Model: gemini-3.8-flash
Cryptography	Web Crypto API (SHA-256), Deterministic Canonical Payloads
QR Engine	QRCode (Node/Browser SVG & DataURL Generator)
🔄 Cryptographic Verification Flow
code
Text
Institution Issues Certificate
                     ↓
Deterministic Payload Canonicalization (ID, Name, Institution, Grade, Date)
                     ↓
         SHA-256 Hex Hash Generated
                     ↓
QR Code Generated & Stored in Ledger
                     ↓
Employer / Verifier Enters ID or Scans QR
                     ↓
Browser / Server Computes Fresh SHA-256 Digest
                     ↓
Hash Compared Against Canonical Record & Revocation Ledger
                     ↓
[ MATCH ] → Authentic & Verified (Seal Displayed)
[ MISMATCH ] → Tamper Alert: Hash Avalanche Detected
📦 Getting Started
Prerequisites
Node.js (v18 or higher recommended)
npm or bun
1. Installation
Clone the repository and install dependencies:
code
Bash
npm install
2. Environment Configuration
Copy .env.example to .env and provide your Gemini API key:
code
Bash
cp .env.example .env
Edit .env:
code
Env
# Required for Gemini AI features (forensics, chat copilot, citations, screening)
GEMINI_API_KEY="your-gemini-api-key"

# App URL for public verification link generation
APP_URL="http://localhost:3000"
Note: Even if no GEMINI_API_KEY is provided, the platform includes resilient synthetic fallbacks so all features, verification workflows, and simulations remain fully testable!
3. Running the Development Server
Start the full-stack server (runs Express with Vite middlewares on port 3000):
code
Bash
npm run dev
Open your browser at http://localhost:3000.
4. Production Build & Execution
code
Bash
# Build frontend assets
npm run build

# Start production server
npm start
🔑 Demo Access Credentials
The platform includes convenient one-click test-login buttons on the login screen:
Role	Username / Email	Password	Access Scope
Student	student@apex.edu (or aarav.sharma@apex.edu)	student123	Personal Credential Wallet, AI Career Matrix, Event Registration, Upload Submissions
Admin	admin@apex.edu (or registrar@apex.edu)	admin123	Certificate Directory, Minting Console, External Approvals, Revocation, Audit Logs
📡 Backend API Endpoints
The Express server exposes the following proxy routes:
POST /api/ai/analyze-certificate: Performs multi-factor cryptographic and academic forensic audit using gemini-3.8-flash.
POST /api/ai/chat: Handles conversational queries for both Student and Admin AI Copilot personas.
POST /api/ai/draft-citation: Synthesizes formal conferral citations and accredited learning outcomes for course curricula.
POST /api/ai/screen-external: Evaluates student-uploaded certificates for accreditation plausibility and risk ratings.
POST /api/ai/career-insights: Generates competency matrices, resume bullets, and next milestone credentials for students.
🔒 Security Best Practices
Deterministic Hashing: No non-deterministic fields (like volatile access timestamps) are included in the SHA-256 payload.
Server-Side AI Secrets: All Gemini SDK invocations occur strictly on the backend; the API key is never exposed to the client.
Role-Based Guards: Frontend and API routes strictly separate Student and Administrator access rights with immediate access-denial dialogs.
Permanent Revocation Records: Revoked credentials preserve the exact revocation timestamp and registrar note, ensuring historic transparency.
📄 License
This project is open-source and available under the Apache-2.0 License.
