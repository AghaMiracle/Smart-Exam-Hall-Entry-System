# Smart Exam Hall Entry Verification System — API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <access_token>
```

## Response Format
All endpoints return responses in this format:
```json
{
  "success": true|false,
  "message": "Description of result",
  "data": { ... },
  "meta": { "currentPage": 1, "totalPages": 5, "totalItems": 100, ... }
}
```

---

## Health Check

### `GET /api/health`
Returns server status.

**Response:**
```json
{
  "success": true,
  "message": "Smart Hall Entry System API is running",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "version": "1.0.0",
  "uptime": 12345.67
}
```

---

## Authentication

### `POST /api/auth/register`
Register a new institution with an admin account.

**Body:**
```json
{
  "institutionName": "University of Lagos",
  "firstName": "John",
  "lastName": "Doe",
  "email": "admin@unilag.edu.ng",
  "password": "SecurePass123",
  "phone": "+2348012345678",
  "address": "Akoka, Yaba, Lagos"
}
```

### `POST /api/auth/login`
Login for institution users (admin/officer).

**Body:**
```json
{
  "email": "admin@unilag.edu.ng",
  "password": "SecurePass123"
}
```

### `POST /api/auth/student/login`
Login for students.

**Body:**
```json
{
  "username": "john_doe_1234",
  "password": "TempPass123!"
}
```

### `POST /api/auth/refresh-token`
Refresh an expired access token.

**Body:**
```json
{
  "refreshToken": "eyJhbG..."
}
```

### `POST /api/auth/forgot-password`
Request a password reset email.

**Body:**
```json
{
  "email": "admin@unilag.edu.ng",
  "userType": "user"
}
```

### `POST /api/auth/reset-password`
Reset password with token.

**Body:**
```json
{
  "token": "reset-token-from-email",
  "password": "NewSecurePass123",
  "userType": "user"
}
```

### `POST /api/auth/logout`
Invalidate refresh token. **Requires Auth.**

---

## Students

### `POST /api/students`
Create a student. Returns auto-generated credentials. **Requires: Admin/Officer.**

**Body:**
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "matricNumber": "CSC/2020/001",
  "department": "Computer Science",
  "faculty": "Science",
  "level": "400",
  "email": "jane@student.unilag.edu.ng",
  "gender": "female"
}
```

**Response includes:**
```json
{
  "credentials": {
    "username": "jane_smith_4821",
    "temporaryPassword": "kJ3$mNp2Xq"
  }
}
```

### `POST /api/students/bulk-import`
Upload CSV/Excel file. **Requires: Admin.**

**Form data:** `file` (CSV or XLSX)

### `GET /api/students?page=1&limit=20&search=jane&department=Computer+Science&level=400`
List students with filters. **Requires: Admin/Officer.**

### `GET /api/students/export?format=csv`
Export students list. **Requires: Admin.**

### `GET /api/students/:id`
Get student detail. **Requires: Admin/Officer.**

### `PUT /api/students/:id`
Update student. **Requires: Admin.**

### `PATCH /api/students/:id/status`
Suspend/activate student. **Requires: Admin.**

**Body:** `{ "status": "suspended" }`

### `GET /api/students/me/profile`
Student's own profile. **Requires: Student Auth.**

### `PUT /api/students/me/passport`
Upload passport photo. **Requires: Student Auth.**

**Form data:** `passportPhoto` (image file)

---

## Exams

### `POST /api/exams`
Create an exam. **Requires: Admin.**

**Body:**
```json
{
  "title": "Introduction to AI",
  "courseCode": "CSC 401",
  "department": "Computer Science",
  "faculty": "Science",
  "level": "400",
  "examDate": "2024-06-15T00:00:00.000Z",
  "startTime": "09:00",
  "endTime": "12:00",
  "venue": "Hall A",
  "semester": "Second",
  "session": "2023/2024"
}
```

### `GET /api/exams?status=upcoming&page=1`
List exams. **Requires: Admin/Officer.**

### `PUT /api/exams/:id`
Update exam. **Requires: Admin.**

### `DELETE /api/exams/:id`
Delete exam. **Requires: Admin.**

### `PATCH /api/exams/:id/status`
Change exam status. **Requires: Admin.**

**Body:** `{ "status": "active" }`

### `PATCH /api/exams/:id/officers`
Assign exam officers. **Requires: Admin.**

**Body:** `{ "officerIds": ["userId1", "userId2"] }`

### Student Exam Endpoints (Student Auth):
- `GET /api/exams/student/active`
- `GET /api/exams/student/upcoming`
- `GET /api/exams/student/history`

---

## QR Codes

### `POST /api/qrcodes/generate`
Generate QR for student+exam. **Requires: Admin/Officer.**

**Body:**
```json
{
  "studentId": "60f1a...",
  "examId": "60f1b..."
}
```

### `POST /api/qrcodes/bulk-generate`
Generate QR for all eligible students. **Requires: Admin/Officer.**

**Body:** `{ "examId": "60f1b..." }`

### `POST /api/qrcodes/verify`
Verify a scanned QR payload. **Requires: Admin/Officer.**

**Body:**
```json
{
  "encryptedPayload": "aef123...:encrypted_data_here"
}
```

**Response (success):**
```json
{
  "verified": true,
  "status": "VERIFIED",
  "student": { "name": "Jane Smith", "matricNumber": "CSC/2020/001", ... },
  "exam": { "title": "Introduction to AI", "courseCode": "CSC 401", ... }
}
```

**Failure statuses:** `INVALID`, `NOT_FOUND`, `ALREADY_USED`, `EXPIRED`, `REVOKED`, `WRONG_INSTITUTION`, `STUDENT_NOT_FOUND`, `STUDENT_INACTIVE`, `ALREADY_VERIFIED`

### `GET /api/qrcodes/student/active`
Get active QR codes. **Requires: Student Auth.**

---

## Attendance

### `GET /api/attendance?page=1&examId=...`
List attendance records. **Requires: Admin/Officer.**

### `GET /api/attendance/exam/:examId`
Attendance by exam. **Requires: Admin/Officer.**

### `GET /api/attendance/exam/:examId/stats`
Attendance stats (verified/rejected counts). **Requires: Admin/Officer.**

### `GET /api/attendance/export/:examId?format=csv`
Export attendance. **Requires: Admin/Officer.**

### `GET /api/attendance/student/history`
Student's attendance history. **Requires: Student Auth.**

### `POST /api/attendance/offline-sync`
Sync offline scan queue. **Requires: Admin/Officer.**

**Body:**
```json
{
  "records": [
    { "studentId": "...", "examId": "...", "verificationStatus": "verified", "verifiedAt": "..." }
  ]
}
```

---

## Dashboard

### `GET /api/dashboard/institution`
Institution dashboard statistics. **Requires: Admin/Officer.**

### `GET /api/dashboard/trends?from=2024-01-01&to=2024-06-01`
Attendance trend data for charts. **Requires: Admin.**

### `GET /api/dashboard/student`
Student dashboard data. **Requires: Student Auth.**

---

## Audit Logs

### `GET /api/audit-logs?page=1&action=STUDENT_CREATED`
Paginated audit logs. **Requires: Admin.**

---

## Socket.io Events

Connect to: `ws://localhost:5000`

### Client → Server
| Event | Payload | Description |
|-------|---------|-------------|
| `join:institution` | `institutionId` | Join institution room |
| `leave:institution` | `institutionId` | Leave institution room |

### Server → Client
| Event | Payload | Description |
|-------|---------|-------------|
| `verification:success` | `{ student, exam, timestamp }` | Student verified |
| `verification:rejected` | `{ reason, status, timestamp }` | Verification failed |
| `attendance:update` | `{ examId, timestamp }` | Attendance count changed |
