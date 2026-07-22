# MtotoCare Tanzania — Child Registration + QR Issuance — Full Flow

## Request flow

1. Nurse/doctor signs in at `frontend/app/login/page.tsx` (`POST /api/v1/auth/login`) and gets a facility-scoped JWT, stored in `localStorage`.
2. They fill the two-step form in `frontend/app/register/page.tsx` (`RegisterChildForm`).
3. `frontend/lib/api.ts` posts to `POST /api/v1/children` with that JWT.
4. `JwtAuthGuard` (validated by `auth/strategies/jwt.strategy.ts`) + `RolesGuard` on `ChildrenController` confirm the caller is a nurse or doctor.
5. `ChildrenService.register()`:
   - Reuses an existing guardian by phone, or creates one.
   - Generates an opaque QR token (no PII inside it).
   - Inserts the child row inside a Postgres transaction.
   - Writes `qr:{token} -> child_id` and `child:{id}:summary` into Redis, so a
     later QR scan at *any* facility resolves in one hop instead of hitting Postgres.
   - Renders the QR token as a PNG data URL via the `qrcode` package.
6. The API returns `{ child, guardian, qrCodeImage }`; the frontend renders the
   `PassportCard` component immediately — no page reload.

## What's now wired up (previously stubbed)

The original drop had the `children` feature reviewed standalone — no `AppModule`,
no Auth module, no way to actually get a JWT. That's now filled in:

- **`backend/src/app.module.ts`** — root module: `ConfigModule`, `TypeOrmModule` (Postgres),
  `RedisModule`, `AuthModule`, `ChildrenModule`.
- **`backend/src/main.ts`** — Nest bootstrap, global `/api/v1` prefix, CORS, `ValidationPipe`.
- **`backend/src/auth/`** — real Auth module: `users` table, `POST /auth/login`
  (bcrypt-checked password → signed JWT), and the `JwtStrategy` that
  `JwtAuthGuard` needed to actually validate anything.
- **`backend/migrations/002_users_and_seed.sql`** — creates `users`, backfills the
  FK from `children.created_by`, and seeds one demo facility + nurse login.
- **`docker-compose.yml`** — Postgres 16 + Redis 7, one command to get local infra up.
- **`frontend/app/login/page.tsx`** — real sign-in screen (was previously a hardcoded
  `'SESSION_ACCESS_TOKEN'` string in `register/page.tsx`).
- **`frontend/app/layout.tsx`, `app/page.tsx`, `next.config.js`, `postcss.config.js`,
  `tsconfig.json`, `package.json`** — the rest of the Next.js project scaffold that
  didn't exist yet, so `register/page.tsx` had nothing to run inside.

## ⚠️ Not executed in this session

This code was written and wired up in a sandboxed environment with **no access to the
npm registry** (installs are blocked by network policy here), so none of it has
actually been run or compiled in this session — only carefully reviewed by hand.
Run it on your own machine to verify:

```bash
# 1. Infra
docker compose up -d

# 2. Backend
cd backend
cp .env.example .env
npm install
npm run migrate      # applies 001 + 002 (needs `psql` on PATH)
npm run start:dev    # → MtotoCare API listening on :4000

# 3. Frontend (new terminal)
cd frontend
cp .env.local.example .env.local
npm install
npm run dev           # → http://localhost:3000
```

Then open `http://localhost:3000`, sign in with `nurse.amina` / `Nurse@2026`,
and submit the registration form — you should land on a `PassportCard` with a
real QR code. To check the API directly:

```bash
TOKEN=$(curl -s -X POST http://localhost:4000/api/v1/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"nurse.amina","password":"Nurse@2026"}' | jq -r .accessToken)

curl -s -X POST http://localhost:4000/api/v1/children \
  -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d '{
    "fullName": "Amina J. Mushi",
    "dateOfBirth": "2026-03-12",
    "sex": "female",
    "birthWeightKg": 3.2,
    "region": "Dar es Salaam",
    "district": "Ilala",
    "guardian": { "fullName": "Neema Mushi", "relation": "mother", "phone": "+255712345678" }
  }' | jq
```

## Next flow to wire up

The `qr:{token}` Redis key this flow writes is exactly what the
**"Nurse scans QR → records vaccination"** flow reads first — that's the
natural next piece to build.
