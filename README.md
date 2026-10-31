# StudioSpace Backend — Better Auth + JWT

Express (ESM) API with:
1. **Better Auth** (MongoDB adapter) — sign-up / sign-in / session
2. **JWT in HTTPOnly cookies** — protects mutations (Challenge 1)

## Auth architecture

| Layer | Technology | Role |
|-------|------------|------|
| Sign-up / Sign-in | **Better Auth** | `/api/auth/sign-up/email`, `/sign-in/email` |
| Session cookie | Better Auth | HTTPOnly `session_token` (+ JWT `session_data` cache) |
| App JWT | **jsonwebtoken** | HTTPOnly cookie named `token` |
| Protected routes | `protect` middleware | Accepts JWT cookie **or** Better Auth session → else **401** |

Flow:
1. User registers/logs in via Better Auth  
2. Frontend calls `GET /api/session/sync` → server sets **JWT in HTTPOnly cookie**  
3. `POST /api/studios`, `DELETE /api/studios/:id`, `POST /api/bookings` require valid JWT/session  

---

## Required credentials (`.env`)

| Variable | Required | How to get |
|----------|----------|------------|
| `MONGODB_URI` | Yes | Local MongoDB or [Atlas](https://www.mongodb.com/cloud/atlas) |
| `BETTER_AUTH_SECRET` | Yes | Generate (see below) |
| `JWT_SECRET` | Yes | Generate (see below) |
| `BETTER_AUTH_URL` | Yes | `http://localhost:5000` |
| `CLIENT_URL` | Yes | `http://localhost:3000` |

### Generate secrets

```bash
# Better Auth secret
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
# or: npx auth secret

# JWT secret (Challenge 1)
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Example `.env`
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://USER:PASS@cluster0.xxxxx.mongodb.net/studiospace?retryWrites=true&w=majority
BETTER_AUTH_SECRET=paste_base64_secret_here
BETTER_AUTH_URL=http://localhost:5000
JWT_SECRET=paste_hex_secret_here
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:3000
```

---

## Setup

```bash
cd studiospace-backend
npm install
# edit .env
npm run seed
npm run dev
```

Register on the frontend (e.g. `host@studiospace.com` / `Password1`).

---

## Key endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/sign-up/email` | Public | Better Auth register |
| POST | `/api/auth/sign-in/email` | Public | Better Auth login |
| GET | `/api/auth/get-session` | Cookie | Better Auth session |
| POST | `/api/auth/sign-out` | Cookie | Better Auth logout |
| GET | `/api/session/sync` | Session | Issue JWT HTTPOnly cookie |
| GET | `/api/session/me` | JWT/Session | Current user |
| POST | `/api/studios` | JWT/Session | Create studio (401 if none) |
| DELETE | `/api/studios/:id` | JWT/Session | Delete studio |
| POST | `/api/bookings` | JWT/Session | Book (+ double-booking check) |

## Challenges
1. **JWT + HTTPOnly cookies** — mutations protected; 401 without valid token/session  
2. **Double-booking prevention** — MongoDB overlap query  
