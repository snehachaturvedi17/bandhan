# Bandhan AI - DPDP Act 2023 Compliant Authentication Backend

A secure, India-compliant authentication service implementing the **Digital Personal Data Protection (DPDP) Act 2023** requirements.

## 🛡️ Compliance Features

| Feature | DPDP Act 2023 Requirement | Implementation |
|---------|---------------------------|----------------|
| **Data Minimization** | Section 7 | Only essential data collected; NO Aadhaar storage |
| **Purpose Limitation** | Section 8 | Purpose-based consent toggles |
| **Age Verification** | Section 9 | 18+ age gate enforced at API level |
| **Data Retention** | Section 8(5) | Auto-delete location after 90 days |
| **Consent Management** | Section 6 | Granular consent with withdrawal rights |
| **Data Security** | Section 8(5) | AWS KMS AES-256-GCM encryption |
| **Audit Trail** | Section 10 | Comprehensive audit logging |

## 🔐 3-Tier Verification System

```
┌─────────────────────────────────────────────────────────────────┐
│                    VERIFICATION TIERS                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Tier 1: Phone OTP (Firebase Auth)                              │
│  ├── Indian phone format: +91XXXXXXXXXX                         │
│  ├── Firebase Phone Authentication                              │
│  └── Stores: isPhoneVerified: boolean                           │
│                                                                 │
│  Tier 2: DigiLocker OAuth (MeitY API)                           │
│  ├── Government-issued identity verification                    │
│  ├── OAuth 2.0 flow with token encryption                       │
│  └── Stores: digiLockerToken: encrypted_string (AES-256-GCM)    │
│                                                                 │
│  Tier 3: Video Selfie (Liveness Detection)                      │
│  ├── Real-time face verification                                │
│  ├── Liveness detection (anti-spoofing)                         │
│  └── Stores: verificationLevel: 0-3                             │
│                                                                 │
│  ⚠️  IMPORTANT: NO Aadhaar numbers are stored at any tier       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 📋 Prisma Schema Overview

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│      User       │     │     Consent     │     │ LocationHistory │
├─────────────────┤     ├─────────────────┤     ├─────────────────┤
│ id (UUID)       │     │ id (UUID)       │     │ id (UUID)       │
│ phone (+91...)  │────▶│ userId (FK)     │     │ userId (FK)     │
│ email           │     │ purposeMatching │     │ latitude        │
│ firebaseUid     │     │ purposeMarketing│     │ longitude       │
│ isPhoneVerified │     │ purposeAnalytics│     │ expiresAt       │
│ digiLockerToken │     │ purposeThirdParty│    │ isExpired       │
│ verificationLvl │     │ consentGivenAt  │     │ createdAt       │
│ dateOfBirth     │     │ consentVersion  │     └─────────────────┘
│ isAgeVerified   │     │ withdrawnAt     │
└─────────────────┘     └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- AWS Account (for KMS)
- Firebase Project
- DigiLocker API credentials (MeitY)

### Installation

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Update .env with your credentials

# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Start development server
npm run dev
```

### Server starts at `http://localhost:4000`

## 📡 API Endpoints

### Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/phone-otp/send` | ❌ | Send OTP to Indian phone |
| POST | `/auth/phone-otp/verify` | ❌ | Verify OTP & login |
| GET | `/auth/digilocker/init` | ✅ | Initialize DigiLocker OAuth |
| GET | `/auth/digilocker/callback` | ❌ | DigiLocker OAuth callback |
| GET | `/auth/digilocker/status` | ✅ | Check DigiLocker status |
| POST | `/auth/age-verify` | ✅ | Submit date of birth |
| GET | `/auth/age-verify/status` | ✅ | Check age verification |
| POST | `/auth/video-selfie/verify` | ✅ | Submit video selfie |
| GET | `/auth/video-selfie/status` | ✅ | Check video verification |
| POST | `/auth/refresh` | ❌ | Refresh access token |
| POST | `/auth/logout` | ✅ | Logout & revoke sessions |

### Consent Management

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/consent` | ✅ | Get current consent |
| POST | `/consent` | ✅ | Update consent |
| POST | `/consent/withdraw` | ✅ | Withdraw all consent |
| GET | `/consent/history` | ✅ | Consent history |
| POST | `/consent/verify-purpose` | ✅ | Verify specific purpose |

### Location

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/location` | ✅ | Record location |
| GET | `/location/history` | ✅ | Get location history |
| DELETE | `/location/history` | ✅ | Delete all location data |

### Protected

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/profile` | ✅ + 18+ | Get user profile |

## 🎨 DPDP Consent UI Mockup

```
╔══════════════════════════════════════════════════════════════════════════════╗
║                         CONSENT MANAGEMENT                                   ║
║                    (Digital Personal Data Protection Act 2023)               ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║  We value your privacy. Please select how you'd like us to use your data:   ║
║                                                                              ║
║  ┌────────────────────────────────────────────────────────────────────────┐  ║
║  │ ☐ Identity Matching                                                     │  ║
║  │   └─ Used to verify your identity with government databases            │  ║
║  │   └─ Required for: DigiLocker verification, KYC compliance             │  ║
║  │   └─ Data stored: Encrypted tokens only (NO Aadhaar numbers)           │  ║
║  └────────────────────────────────────────────────────────────────────────┘  ║
║                                                                              ║
║  ┌────────────────────────────────────────────────────────────────────────┐  ║
║  │ ☐ Marketing Communications                                              │  ║
║  │   └─ Receive updates about new features and offers                     │  ║
║  │   └─ Channels: Email, SMS, Push notifications                          │  ║
║  │   └─ You can unsubscribe anytime                                       │  ║
║  └────────────────────────────────────────────────────────────────────────┘  ║
║                                                                              ║
║  ┌────────────────────────────────────────────────────────────────────────┐  ║
║  │ ☐ Usage Analytics                                                       │  ║
║  │   └─ Help us improve by analyzing app usage patterns                   │  ║
║  │   └─ Includes: Feature usage, session duration, location (90 days)     │  ║
║  │   └─ Data is anonymized and aggregated                                 │  ║
║  └────────────────────────────────────────────────────────────────────────┘  ║
║                                                                              ║
║  ┌────────────────────────────────────────────────────────────────────────┐  ║
║  │ ☐ Third-Party Sharing                                                   │  ║
║  │   └─ Share data with trusted partners for enhanced services            │  ║
║  │   └─ Partners: Payment processors, verification services               │  ║
║  │   └─ All partners are DPDP Act 2023 compliant                          │  ║
║  └────────────────────────────────────────────────────────────────────────┘  ║
║                                                                              ║
║  ─────────────────────────────────────────────────────────────────────────   ║
║                                                                              ║
║  Your Rights Under DPDP Act 2023:                                            ║
║  ✓ Right to access your personal data                                        ║
║  ✓ Right to correction and erasure                                           ║
║  ✓ Right to grievance redressal                                              ║
║  ✓ Right to withdraw consent at any time                                     ║
║                                                                              ║
║  Data Retention:                                                             ║
║  • Location data: Auto-deleted after 90 days                                 ║
║  • Session data: Auto-deleted after 30 days                                  ║
║  • Audit logs: Retained for 365 days (compliance requirement)                ║
║                                                                              ║
║  Grievance Officer: grievance.officer@bandhan.ai                             ║
║                                                                              ║
║  ┌────────────────────────────┐  ┌────────────────────────────┐              ║
║  │      SAVE PREFERENCES      │  │     WITHDRAW CONSENT       │              ║
║  └────────────────────────────┘  └────────────────────────────┘              ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

## 🔒 Security Features

### Encryption
- **DigiLocker Tokens**: AES-256-GCM via AWS KMS
- **JWT Secrets**: Environment-based, rotated regularly
- **No Hardcoded Keys**: All encryption via AWS KMS

### Age Verification
```typescript
// Middleware blocks all under-18 users
app.get('/profile', { preHandler: [authenticate, ageGate] }, handler)

// Error: AGE_RESTRICTION_VIOLATION (403)
```

### Rate Limiting
- OTP requests: 5 per hour per phone
- API requests: 100 per minute per IP
- Failed logins: Account lockout after 5 attempts

## 📊 Error Codes

| Error Code | HTTP Status | Description |
|------------|-------------|-------------|
| `AGE_RESTRICTION_VIOLATION` | 403 | User is under 18 |
| `AGE_NOT_VERIFIED` | 403 | Age verification required |
| `DIGILOCKER_VERIFICATION_FAILED` | 400 | DigiLocker OAuth failed |
| `INVALID_PHONE_FORMAT` | 400 | Phone not in +91XXXXXXXXXX format |
| `OTP_VERIFICATION_FAILED` | 400 | Invalid OTP |
| `LIVENESS_DETECTION_FAILED` | 400 | Video selfie failed |
| `CONSENT_REQUIRED` | 403 | Consent not given for purpose |
| `ENCRYPTION_FAILED` | 500 | AWS KMS encryption error |

## 🏗️ Project Structure

```
api/
├── prisma/
│   └── schema.prisma          # Database schema (NO Aadhaar fields)
├── src/
│   ├── index.ts               # Main entry point
│   ├── middleware/
│   │   ├── auth.ts            # JWT authentication
│   │   └── ageGate.ts         # 18+ age verification
│   ├── routes/
│   │   ├── auth/
│   │   │   ├── phone-otp.ts   # Tier 1 verification
│   │   │   ├── digilocker.ts  # Tier 2 verification
│   │   │   ├── video-selfie.ts# Tier 3 verification
│   │   │   └── age-verify.ts  # Age verification
│   │   ├── consent.ts         # DPDP consent management
│   │   └── location.ts        # Location with auto-delete
│   └── utils/
│       ├── kms-encryption.ts  # AWS KMS AES-256-GCM
│       ├── firebase-admin.ts  # Firebase Auth (Indian region)
│       ├── digilocker.ts      # MeitY DigiLocker API
│       └── errors.ts          # Error codes & handling
├── .env.example               # Environment template
└── package.json
```

## 📝 Compliance Checklist

- [x] No Aadhaar numbers stored
- [x] Purpose-based consent toggles
- [x] Age gate (18+) before profile access
- [x] Auto-delete location after 90 days
- [x] AWS KMS encryption (no hardcoded keys)
- [x] Comprehensive audit logging
- [x] Consent withdrawal mechanism
- [x] Data principal rights notice
- [x] Grievance officer contact

## 📄 License

ISC
