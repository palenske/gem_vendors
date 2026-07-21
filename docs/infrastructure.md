# Infrastructure — Localizador de Revendedoras

## Infrastructure Overview

pnpm monorepo with three packages: NestJS backend API, Expo frontend app, and shared TypeScript types. No container orchestration, no CI/CD pipeline, no Docker. Standard Node.js deployment.

## Environments

- **Development**: local PostgreSQL, `.env` files per workspace (`apps/api/.env`)
- **Production**: managed PostgreSQL (Railway), env vars injected at deploy

## Core Services and Dependencies

| Service | Role | Protocol |
|---------|------|----------|
| PostgreSQL | Primary data store | TCP via PrismaPg adapter |
| ViaCEP | Brazilian CEP → address lookup | HTTPS (external) |
| Nominatim/OSM | Address → geocoordinates | HTTPS (external, rate-limited ~1 req/sec) |

### Runtime Dependencies

- `pg` + `@prisma/adapter-pg` — PostgreSQL driver and Prisma 7 adapter
- `csv-parse` — CSV parsing for seed script
- `class-validator` + `class-transformer` — request validation (ValidationPipe)

### Dev Dependencies

- `prisma` — schema management, migrations, seed
- `ts-node` — seed script execution
- `jest` + `supertest` — unit and e2e testing
- `eslint` + `prettier` — code quality

## Deployment and Operations

### Backend (`apps/api`)

```bash
pnpm --filter api build          # → dist/
pnpm --filter api start:prod     # → node dist/main
pnpm --filter api prisma:seed    # → seeds DB from CSV
```

### Frontend (`apps/app`)

```bash
pnpm --filter app web            # Expo web dev server
pnpm --filter app start          # Expo native dev server
```

### Database

- Schema: `apps/api/prisma/schema.prisma`
- Migrations: `apps/api/prisma/migrations/`
- Seed data: `data/Base_200_Revendedoras_Fake.csv` (200 fake resellers, semicolon-delimited)

## Known Constraints and Risks

- **Nominatim rate limit** — 1 request/second; seed script uses 1.1s delay between geocoding calls
- **ViaCEP timeout** — 5s configured; throws `HttpException(503)` on failure
- **No retry logic** — external API failures propagate immediately to callers
- **No CI/CD** — no automated testing or deployment pipeline
- **No containerization** — deployment is raw Node.js process
- **Seed is idempotent** — uses `upsert` keyed on integer `id`
- **Single migration** — only `20260720013431_init` exists; no schema drift yet
