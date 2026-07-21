# Environments — Localizador de Revendedoras

## Environment Matrix

| Variable | Dev | Prod | Notes |
|----------|-----|------|-------|
| `DATABASE_URL` | `postgresql://...localhost:5432/localizador_revendedoras?schema=public` | Managed PostgreSQL (Railway) | Required. Must include `?connection_limit=` for PgBouncer if applicable |
| `PORT` | `3000` (default) | Configurable | Optional. NestJS `app.listen()` fallback |
| `CORS_ORIGIN` | `*` (default) | Specific origin | Optional. Sets CORS policy |
| `NOMINATIM_USER_AGENT` | `localizador-revendedoras-dev` | Production UA string | Required for Nominatim. Usage policy mandates identifying User-Agent |

## Configuration and Secrets Boundaries

- **`DATABASE_URL`** is the only secret — contains credentials
- **All config via env vars** — NestJS `ConfigModule.forRoot({ isGlobal: true })` loads `.env`
- `.env` files are gitignored (root `.gitignore` covers `.env`, `.env.local`, `.env.*.local`)
- `.env.example` in `apps/api/` documents required variables

## Deployment Differences

| Aspect | Dev | Prod |
|--------|-----|------|
| PostgreSQL | Local instance | Managed (Railway) |
| Logging | NestJS default (verbose) | NestJS default |
| CORS | `*` (all origins) | Specific origin |
| Nominatim UA | `localizador-revendedoras-dev` | Production identifier |
| Start command | `pnpm --filter api start:dev` (watch) | `pnpm --filter api start:prod` |

## Operational Access

### Backend

```bash
# Development (watch mode)
pnpm --filter api start:dev

# Production
pnpm --filter api build && pnpm --filter api start:prod

# Database operations
pnpm --filter api prisma:seed        # Seed from CSV
pnpm --filter api prisma migrate dev # Run migrations (dev)
```

### Frontend

```bash
# Web dev server
pnpm --filter app web

# Native dev server
pnpm --filter app start
```

### Monorepo-wide

```bash
pnpm lint    # Lint all packages
pnpm test    # Test all packages
```
