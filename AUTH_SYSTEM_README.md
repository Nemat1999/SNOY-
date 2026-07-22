# SNOY — Authentication System Documentation

> **Tech Stack:** Next.js 16 (App Router) + Sequelize ORM + PostgreSQL (Neon) + JWT (Dual Token) + bcryptjs + ua-parser-js
> **Architecture:** Stateful JWT — Access Token + Refresh Token with DB-backed sessions

---

## 📁 Complete File Structure

```
SNOY-/
├── .env                          # Environment variables (secrets)
├── .env.example                  # Env template (safe to share)
├── package.json                  # Dependencies & scripts
│
├── database/                     # Sequelize ORM layer
│   ├── config.cjs                # DB connection config (dev/prod)
│   ├── models/
│   │   ├── index.cjs             # Sequelize model loader
│   │   ├── user.cjs              # User model definition
│   │   ├── session.cjs           # Session model definition
│   │   └── ratelimit.cjs         # Rate limit model definition
│   └── migrations/
│       ├── 20260720110000-create-user.cjs
│       ├── 20260720120000-create-session.cjs
│       └── 20260722180000-create-rate-limit.cjs
│
└── src/
    ├── middleware.ts             # Next.js Server-Side Route Guard (Cookie-based redirect)
    │
    ├── lib/                      # Shared utility modules
    │   ├── db.ts                 # Sequelize instance + model init
    │   ├── auth.ts               # JWT sign/verify helpers
    │   ├── authGuard.ts          # Route protection (basic/strict)
    │   └── rateLimit.ts          # DB-backed brute force limiter
    │
    └── app/api/v1/auth/          # Auth API routes (Next.js App Router)
        ├── register/route.ts     # POST — User registration
        ├── login/route.ts        # POST — User login
        ├── refresh/route.ts      # POST — Token rotation
        ├── logout/route.ts       # POST — Single device logout
        ├── logout-all/route.ts   # POST — All devices logout
        ├── me/route.ts           # GET  — Get current user profile
        └── sessions/route.ts     # GET  — List active sessions
```

---

## 🗄️ Database Layer

### Database Config — `database/config.cjs`

```javascript
// Reads from .env file
// Two environments: development & production
// Both use PostgreSQL (Neon) with SSL enabled
{
  development: {
    url: process.env.DATABASE_URL_DEVELOPMENT,
    dialect: 'postgres',
    dialectOptions: { ssl: { require: true, rejectUnauthorized: false } }
  },
  production: {
    url: process.env.DATABASE_URL_PRODUCTION,
    dialect: 'postgres',
    dialectOptions: { ssl: { require: true, rejectUnauthorized: false } }
  }
}
```

### Users Table — `database/models/user.cjs`

| Column     | Type                          | Constraints              |
|------------|-------------------------------|--------------------------|
| `id`       | INTEGER                       | PK, Auto Increment       |
| `name`     | STRING                        | Nullable                 |
| `email`    | STRING                        | NOT NULL, UNIQUE, isEmail |
| `password` | STRING                        | NOT NULL (bcrypt hashed)  |
| `role`     | ENUM('user', 'super_admin')   | NOT NULL, default: 'user' |
| `createdAt`| DATE                          | Auto managed by Sequelize |
| `updatedAt`| DATE                          | Auto managed by Sequelize |

### Sessions Table — `database/models/session.cjs`

| Column      | Type    | Constraints                                      |
|-------------|---------|--------------------------------------------------|
| `id`        | INTEGER | PK, Auto Increment                               |
| `userId`    | INTEGER | NOT NULL, FK → Users.id (CASCADE delete)         |
| `token`     | TEXT    | NOT NULL, UNIQUE (stores current Refresh Token)  |
| `userAgent` | STRING  | Nullable (browser/device info)                   |
| `ipAddress` | STRING  | Nullable (client IP)                             |
| `expiresAt` | DATE    | NOT NULL (refresh token expiry)                  |
| `createdAt` | DATE    | Auto (original login time — never changes)       |
| `updatedAt` | DATE    | Auto (last token rotation time)                  |

**Relationship:** `Session.belongsTo(User)` — Ek user ke multiple sessions ho sakte hain (multi-device login).

### DB Initializer — `src/lib/db.ts`

```
1. .env se DATABASE_URL read karta hai
2. Sequelize instance banata hai (PostgreSQL + SSL)
3. User, Session, aur RateLimit models initialize karta hai
4. Associations setup karta hai (Session → User FK)
5. db object export karta hai: { sequelize, User, Session, RateLimit }
```

### RateLimits Table — `database/models/ratelimit.cjs`

| Column       | Type    | Constraints                                    |
|--------------|---------|------------------------------------------------|
| `id`         | INTEGER | PK, Auto Increment                             |
| `key`        | STRING  | NOT NULL, UNIQUE (IP address being limited)    |
| `attempts`   | INTEGER | NOT NULL, default: 0                           |
| `windowStart`| DATE    | NOT NULL (start of current sliding window)     |
| `blockedUntil`| DATE   | Nullable (cooldown end timestamp)              |
| `createdAt`  | DATE    | Auto managed by Sequelize                      |
| `updatedAt`  | DATE    | Auto managed by Sequelize                      |

---

## 🔑 JWT Token Strategy — `src/lib/auth.ts`

### Dual Token Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    TOKEN STRATEGY                        │
├──────────────────┬──────────────────────────────────────┤
│  Access Token    │  Refresh Token                       │
├──────────────────┼──────────────────────────────────────┤
│  Expiry: 5 min   │  Expiry: 7 days                     │
│  Secret: JWT_ACCESS_SECRET  │  Secret: JWT_REFRESH_SECRET│
│  Purpose: API auth│  Purpose: Get new Access Token      │
│  Stored: Cookie   │  Stored: Cookie + DB (Sessions)    │
│  DB Check: No*    │  DB Check: Yes                     │
└──────────────────┴──────────────────────────────────────┘
  * Except "strict" mode routes (via authGuard)
```

### Token Payload

```typescript
interface TokenPayload {
  id: number;      // User ID
  email: string;   // User email
  role: string;    // 'user' | 'super_admin'
}
```

### 4 Helper Functions

| Function              | Input          | Output               | Purpose                       |
|-----------------------|----------------|----------------------|-------------------------------|
| `signAccessToken()`   | TokenPayload   | JWT string (5m)      | Login/Refresh par Access Token generate |
| `signRefreshToken()`  | TokenPayload   | JWT string (7d)      | Login/Refresh par Refresh Token generate |
| `verifyAccessToken()` | JWT string     | TokenPayload or null | API requests authenticate karna |
| `verifyRefreshToken()`| JWT string     | TokenPayload or null | Refresh endpoint par token verify |

---

## 🔒 Cookie Configuration

Dono tokens HttpOnly cookies mein store hote hain (client-side JS access NAHI kar sakta):

```typescript
{
  httpOnly: true,                                    // XSS protection
  secure: process.env.NODE_ENV === 'production',     // HTTPS only in prod
  sameSite: 'strict',                                // CSRF protection
  path: '/',
  maxAge: 5 * 60          // Access: 5 min
  // OR
  maxAge: 7 * 24 * 60 * 60  // Refresh: 7 days
}
```

---

## 🛡️ Security Features

### 1. Auth Guard — `src/lib/authGuard.ts`

Reusable function jo API routes mein authentication check karta hai:

```
┌──────────────────────────────────────────────────────────┐
│                    authGuard(req, mode)                   │
├────────────┬─────────────────────────────────────────────┤
│  "basic"   │  Sirf JWT verify (fast, no DB query)        │
│            │  → Product listing, general GET routes      │
├────────────┼─────────────────────────────────────────────┤
│  "strict"  │  JWT verify + DB session existence check    │
│            │  → Checkout, Profile update, Password change│
│            │  → Logout-All ke baad 5-min window close    │
└────────────┴─────────────────────────────────────────────┘
```

**Usage:**
```typescript
const auth = await authGuard(req, 'strict');
if (auth.error) return auth.error;   // 401 returned automatically
// auth.user.id, auth.user.email, auth.user.role available
```

**Token extraction order:**
1. Cookie `accessToken` check
2. Fallback: `Authorization: Bearer <token>` header

### 2. Rate Limiting — `src/lib/rateLimit.ts`

Database-backed (PostgreSQL) sliding window rate limiter.
Serverless-safe — works on Vercel, AWS Lambda, etc. because state is in DB, not process memory:

```
┌──────────────────────────────────────────────────────┐
│            RATE LIMIT CONFIGURATION                  │
├──────────────────┬───────────────────────────────────┤
│  Storage         │  PostgreSQL (RateLimits table)    │
│  Max Attempts    │  5 per IP                         │
│  Window          │  5 minutes (sliding)              │
│  Cooldown        │  15 minutes after exceed          │
│  Stale Cleanup   │  Auto during each check           │
│  Applied To      │  /login + /register               │
│  HTTP Status     │  429 Too Many Requests            │
│  Serverless Safe │  Yes (DB-backed, not in-memory)   │
└──────────────────┴───────────────────────────────────┘
```

**How it works:**
```
IP: 192.168.1.1
  Attempt 1 → Allowed (4 remaining)    [DB: attempts=1]
  Attempt 2 → Allowed (3 remaining)    [DB: attempts=2]
  Attempt 3 → Allowed (2 remaining)    [DB: attempts=3]
  Attempt 4 → Allowed (1 remaining)    [DB: attempts=4]
  Attempt 5 → Allowed (0 remaining)    [DB: attempts=5]
  Attempt 6 → BLOCKED (15 min cooldown)[DB: blockedUntil=now+15m]
  ... 15 minutes later ...
  Attempt 7 → Allowed (counter reset)  [DB: attempts=1, blockedUntil=null]
```

### 3. Refresh Token Reuse Detection

```
Normal Flow:
  User has Token A → calls /refresh → gets Token B → Token A deleted from DB

Attack Scenario:
  Hacker stole Token A
  User calls /refresh → gets Token B (Token A deleted from DB)
  Hacker tries Token A → JWT is valid BUT not in DB
  TRAP ACTIVATED → ALL sessions for this user DESTROYED
  → Hacker's Token B session also gone
  → User must re-login (secure)
```

### 4. User-Agent Parsing (Clean Device Names)

Login ke waqt raw User-Agent header ko `ua-parser-js` se parse karke DB mein clean format mein save kiya jata hai:

```
Raw:    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36..."
Parsed: "Chrome on Windows 10"

Raw:    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)..."
Parsed: "Safari on iOS 17.0"
```

Dashboard par user ko seedha "Chrome on Windows 10" dikhega, na ke raw Mozilla string.

### 5. Session Garbage Collection (Auto Cleanup)

Jab koi user login karta hai, background mein (fire-and-forget) ek query chalta hai jo saare expired sessions delete kar deta hai:

```typescript
// Login route mein Session.create ke baad (async, no await)
db.Session.destroy({
  where: {
    expiresAt: { [Op.lt]: new Date() }  // Delete expired sessions
  }
}).catch(() => {});
```

Is se Sessions table mein "dead" rows jama nahi honge, even agar user logout kiye bina app band kar de.

---

## 🔄 Complete Auth Flow

### Flow 1: Registration

```
Client                          Server                         Database
  │                               │                               │
  │  POST /api/v1/auth/register   │                               │
  │  { name, email, password }    │                               │
  │──────────────────────────────→│                               │
  │                               │  Rate Limit Check (IP)        │
  │                               │  Validate email format        │
  │                               │  Validate password >= 6 chars │
  │                               │  Check role (user/super_admin)│
  │                               │──── findOne({ email }) ──────→│
  │                               │←── User exists? ─────────────│
  │                               │  bcrypt.hash(password, 10)    │
  │                               │──── User.create() ───────────→│
  │                               │←── New User ─────────────────│
  │  { message, user: {id,name,   │                               │
  │    email,role} }  201         │                               │
  │←──────────────────────────────│                               │
```

### Flow 2: Login

```
Client                          Server                         Database
  │                               │                               │
  │  POST /api/v1/auth/login      │                               │
  │  { email, password }          │                               │
  │──────────────────────────────→│                               │
  │                               │  Rate Limit Check (IP)        │
  │                               │──── findOne({ email }) ──────→│
  │                               │←── User record ──────────────│
  │                               │  bcrypt.compare(password)     │
  │                               │  signAccessToken(payload)     │
  │                               │  signRefreshToken(payload)    │
  │                               │──── Session.create({         →│
  │                               │       userId, token,           │
  │                               │       userAgent, ip,           │
  │                               │       expiresAt               │
  │                               │     })                         │
  │  Set-Cookie: accessToken      │                               │
  │  Set-Cookie: refreshToken     │                               │
  │  { message, user }  200      │                               │
  │←──────────────────────────────│                               │
```

### Flow 3: Token Refresh (Rotation)

```
Client                          Server                         Database
  │                               │                               │
  │  POST /api/v1/auth/refresh    │                               │
  │  Cookie: refreshToken=OLD     │                               │
  │──────────────────────────────→│                               │
  │                               │  verifyRefreshToken(OLD)      │
  │                               │──── findOne({ token: OLD }) ─→│
  │                               │                               │
  │                   ┌───────────┴───────────┐                   │
  │                   │  Token found in DB?   │                   │
  │                   └───────┬───────┬───────┘                   │
  │                     YES   │       │  NO (REUSE DETECTED!)     │
  │                           │       │                           │
  │                           │       │── destroy ALL sessions ──→│
  │                           │       │   for this userId          │
  │                           │       │  Return 401 "Suspicious"  │
  │                           │       │←─────────────────────────│
  │                           │                                   │
  │                           │  Check expiresAt                  │
  │                           │  signAccessToken(NEW_A)           │
  │                           │  signRefreshToken(NEW_R)          │
  │                           │                                   │
  │                           │── session.update({               →│
  │                           │     token: NEW_R,                  │
  │                           │     expiresAt: +7 days             │
  │                           │   })                               │
  │                           │   (createdAt, IP, userAgent        │
  │                           │    PRESERVED — no recreate)        │
  │                           │                                   │
  │  Set-Cookie: accessToken=NEW_A                                │
  │  Set-Cookie: refreshToken=NEW_R                               │
  │  { message, user }  200  │                                   │
  │←──────────────────────────│                                   │
```

### Flow 4: Logout (Single Device)

```
Client                          Server                         Database
  │                               │                               │
  │  POST /api/v1/auth/logout     │                               │
  │  Cookie: refreshToken=TOKEN   │                               │
  │──────────────────────────────→│                               │
  │                               │──── destroy({ token }) ──────→│
  │                               │  Clear accessToken cookie      │
  │                               │  Clear refreshToken cookie     │
  │  { message: "Logged out" }   │                               │
  │←──────────────────────────────│                               │
```

### Flow 5: Logout All Devices

```
Client                          Server                         Database
  │                               │                               │
  │  POST /api/v1/auth/logout-all │                               │
  │  Cookie: accessToken=TOKEN    │                               │
  │──────────────────────────────→│                               │
  │                               │  verifyAccessToken(TOKEN)     │
  │                               │──── destroy ALL sessions ────→│
  │                               │     where: { userId }          │
  │                               │  Clear accessToken cookie      │
  │                               │  Clear refreshToken cookie     │
  │  { message: "Logged out      │                               │
  │    from all devices" }       │                               │
  │←──────────────────────────────│                               │
```

### Flow 6: Get Active Sessions

```
Client                          Server                         Database
  │                               │                               │
  │  GET /api/v1/auth/sessions    │                               │
  │  Cookie: accessToken=TOKEN    │                               │
  │──────────────────────────────→│                               │
  │                               │  verifyAccessToken(TOKEN)     │
  │                               │──── findAll({ userId }) ─────→│
  │                               │←── All sessions ─────────────│
  │                               │  Mark isCurrentDevice flag     │
  │  { sessions: [{              │                               │
  │    id, userAgent, ip,         │                               │
  │    expiresAt, createdAt,      │                               │
  │    isCurrentDevice: true/false│                               │
  │  }] }                        │                               │
  │←──────────────────────────────│                               │
```

---

## 📡 API Endpoints Reference

### `POST /api/v1/auth/register`
**Rate Limited:** Yes (5/5min per IP)

| Field      | Type   | Required | Notes                     |
|------------|--------|----------|---------------------------|
| `name`     | string | No       |                           |
| `email`    | string | Yes      | Must be valid email       |
| `password` | string | Yes      | Min 6 characters          |
| `role`     | string | No       | 'user' (default) or 'super_admin' |

**Success (201):**
```json
{
  "message": "User registered successfully",
  "user": { "id": 1, "name": "Ali", "email": "ali@test.com", "role": "user" }
}
```

---

### `POST /api/v1/auth/login`
**Rate Limited:** Yes (5/5min per IP)

| Field      | Type   | Required |
|------------|--------|----------|
| `email`    | string | Yes      |
| `password` | string | Yes      |

**Success (200):** Returns user object + sets 2 HttpOnly cookies

---

### `POST /api/v1/auth/refresh`
**Auth:** Requires `refreshToken` cookie
**Rate Limited:** No

**Success (200):** Rotates both tokens, updates session in DB

### `GET /api/v1/auth/me`
**Auth:** Requires `accessToken` cookie or `Authorization: Bearer <token>` header
**Rate Limited:** No

**Success (200):**
```json
{
  "user": {
    "id": 1,
    "name": "Super Admin",
    "email": "admin@snoy.com",
    "role": "super_admin",
    "createdAt": "2026-07-22T...",
    "updatedAt": "2026-07-22T..."
  }
}
```

---

### `GET /api/v1/auth/sessions`
**Auth:** Requires `accessToken` cookie or `Authorization: Bearer <token>` header

**Success (200):**
```json
{
  "sessions": [
    {
      "id": 5,
      "userAgent": "Mozilla/5.0 ...",
      "ipAddress": "192.168.1.1",
      "expiresAt": "2026-07-29T...",
      "createdAt": "2026-07-22T...",
      "isCurrentDevice": true
    }
  ]
}
```

---

### `POST /api/v1/auth/logout`
**Auth:** Requires `refreshToken` cookie
**Effect:** Current device session destroy + cookies clear

---

### `POST /api/v1/auth/logout-all`
**Auth:** Requires `accessToken` cookie or `Authorization: Bearer <token>` header
**Effect:** ALL user sessions destroy + cookies clear

**5-Min Window Note:** After logout-all, other devices' Access Tokens are still technically valid for up to 5 minutes. To close this gap on sensitive routes, use `authGuard(req, 'strict')` which does an extra DB check.

---

## 🌍 Environment Variables

```env
# Database
DATABASE_URL_DEVELOPMENT="postgresql://user:pass@host/db?sslmode=require"
DATABASE_URL_PRODUCTION="postgresql://user:pass@host/db?sslmode=require"

# JWT Secrets (must be strong random strings)
JWT_ACCESS_SECRET="your_access_secret"
JWT_REFRESH_SECRET="your_refresh_secret"
```

---

## 📦 Key Dependencies

| Package        | Version | Purpose                         |
|----------------|---------|----------------------------------|
| `next`         | ^16     | Framework (App Router API Routes)|
| `sequelize`    | ^6.37   | ORM for PostgreSQL               |
| `pg`           | ^8.22   | PostgreSQL driver                |
| `jsonwebtoken` | ^9.0    | JWT sign/verify                  |
| `bcryptjs`     | ^3.0    | Password hashing                 |
| `ua-parser-js` | latest  | User-Agent string parsing        |
| `sequelize-cli`| ^6.6    | DB migrations (dev dependency)   |

---

## Database Commands

```bash
# Run migrations (create tables)
npm run db:migrate:dev        # development
npm run db:migrate:prod       # production

# Seed Super Admin
npm run db:seed:dev           # development
npm run db:seed:prod          # production
```

> **Default Super Admin Credentials:**
> - Email: `admin@snoy.com`
> - Password: `Admin@123456`
> - Role: `super_admin`

---

## How Everything Connects

```
                    ┌─────────────────────┐
                    │    Client/Browser    │
                    │  (Cookies stored)    │
                    └─────────┬───────────┘
                              │
                    ┌─────────▼───────────┐
                    │   Rate Limiter      │  ← /login, /register only
                    │  (rateLimit.ts →DB) │
                    └─────────┬───────────┘
                              │
                    ┌─────────▼───────────┐
                    │   API Route Handler  │  ← Next.js App Router
                    │   (route.ts files)   │
                    │   + UA Parser        │
                    │   + Session Cleanup  │
                    └─────────┬───────────┘
                              │
              ┌───────────────┼───────────────┐
              │               │               │
    ┌─────────▼──────┐ ┌─────▼──────┐ ┌──────▼─────────┐
    │   auth.ts      │ │  db.ts     │ │  authGuard.ts  │
    │ JWT sign/verify│ │ Sequelize  │ │ basic/strict   │
    │                │ │ Models     │ │ route protect  │
    └────────────────┘ └─────┬──────┘ └────────────────┘
                             │
                    ┌────────▼────────┐
                    │   PostgreSQL    │
                    │   (Neon Cloud)  │
                    │ ┌─────┐┌──────┐│
                    │ │Users││Sess. ││
                    │ └─────┘└──────┘│
                    │ ┌──────────┐   │
                    │ │RateLimits│   │
                    │ └──────────┘   │
                    └─────────────────┘
```
