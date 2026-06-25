# Smart Exam Hall Entry Verification System — Backend API

Production-ready Node.js/Express backend for the Smart Exam Hall Entry Verification System Using QR Codes.

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB + Mongoose
- **Authentication:** JWT (Access + Refresh Tokens)
- **Encryption:** AES-256-CBC (QR payloads)
- **Password Hashing:** bcryptjs
- **File Upload:** Multer
- **Email:** Nodemailer
- **Validation:** Express Validator
- **Logging:** Winston
- **Real-time:** Socket.io
- **Security:** Helmet, Rate Limiting, CORS, Compression

## Architecture

```
MVC + Repository Pattern + Service Layer
```

```
Client → Routes → Controllers → Services → Repositories → Models → MongoDB
```

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### Setup

```bash
# 1. Install dependencies
cd backend
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env with your MongoDB URI and secrets

# 3. Seed super admin (optional)
npm run seed

# 4. Start development server
npm run dev
```

### Default Super Admin Credentials (after seeding)
```
Email: admin@smarthallentry.com
Password: Admin@123456
```

## Project Structure

```
backend/
├── server.js              # Entry point
├── package.json
├── .env.example
└── src/
    ├── app.js             # Express app setup
    ├── config/            # DB, CORS, env config
    ├── models/            # Mongoose schemas (7)
    ├── repositories/      # Data access layer (7)
    ├── services/          # Business logic (9)
    ├── controllers/       # Request handlers (8)
    ├── routes/            # API routes (9)
    ├── middlewares/        # Auth, validation, upload, rate limiting
    ├── validations/       # Express-validator chains
    ├── utils/             # Encryption, QR, helpers
    ├── sockets/           # Socket.io handlers
    ├── seeds/             # Database seed script
    └── docs/              # API documentation
```

## API Endpoints Summary

| Module | Base Path | Endpoints |
|--------|-----------|-----------|
| Auth | `/api/auth` | Register, Login, Student Login, Refresh, Forgot/Reset Password, Logout |
| Institutions | `/api/institutions` | Profile CRUD, List (Super Admin), Status management |
| Students | `/api/students` | CRUD, Bulk Import/Export, Self-service profile |
| Exams | `/api/exams` | CRUD, Status, Officer Assignment, Student queries |
| QR Codes | `/api/qrcodes` | Generate, Bulk Generate, Verify, Student Active QR |
| Attendance | `/api/attendance` | List, Stats, Export, Student History, Offline Sync |
| Dashboard | `/api/dashboard` | Institution Stats, Trends, Student Dashboard |
| Audit Logs | `/api/audit-logs` | Paginated Logs |
| Health | `/api/health` | Server status |

See full documentation: [API Docs](src/docs/api.md)

## Roles

1. **Super Admin** — System-wide administration
2. **Institution Admin** — Full institution management
3. **Examination Officer** — Exam management and QR verification
4. **Student** — View exams, QR codes, attendance

## Security Features

- JWT with short-lived access tokens (15min) + refresh tokens (7 days)
- AES-256-CBC encrypted QR payloads with unique nonces
- Password hashing with bcrypt (12 rounds)
- Account lockout after 5 failed login attempts
- Rate limiting on auth and verification endpoints
- Helmet security headers
- CORS whitelist
- Input validation on all endpoints

## License

MIT
