# Athlete RIA Portal — Monorepo Skeleton

A ready-to-run monorepo for a professional athlete client portal (web + API).

## Stack
- **Web (Next.js + TypeScript + Tailwind + Recharts + lucide-react)**
- **API (NestJS + TypeScript)** — mock data; no DB required yet
- NPM **workspaces**, single `npm install` at the root

## Quick Start
1) Ensure Node.js >= 18 is installed.
2) From repo root:
   ```bash
   npm install
   npm run dev
   ```
   - API: http://localhost:3001
   - Web: http://localhost:3000

## Packages
- `apps/web` — Next.js app router, fetches from the mock API.
- `apps/api` — NestJS with feature modules and mocked controllers.
- `packages/shared` — Common TypeScript types.

## Environment
- Web reads `NEXT_PUBLIC_API_URL` (default `http://localhost:3001`).

## Next Steps
- Add persistent storage (PostgreSQL + Prisma) and auth (Auth0/Okta).
- Replace mock data with real aggregators (Plaid/MX/Akoya) & PMS.
- Build duty-day importer + state apportionment estimator service.
