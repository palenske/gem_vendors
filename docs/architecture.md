# Architecture — Localizador de Revendedoras

## System Overview

pnpm monorepo serving the "Localizador de Revendedoras" (Reseller Locator) application. Backend API (NestJS) provides geocoding, CEP lookup, and reseller search-by-location endpoints. Frontend app (Expo Router) provides web and mobile interfaces. Currently the frontend is scaffolded (Expo template tabs) with no search UI implemented yet.

## Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Monorepo | pnpm workspaces | — |
| Backend | NestJS | 11 |
| TypeScript | TypeScript (strict mode) | 5.7 |
| ORM | Prisma | 7.8 |
| Database driver | PrismaPg adapter (`@prisma/adapter-pg`) | 7.8 |
| Database | PostgreSQL | — |
| Frontend framework | Expo Router (React Native) | 0.86 |
| React | React | 19.2 |
| Web bundler | Expo Web (Metro) | 57 |
| Validation | class-validator + class-transformer | 0.15 / 0.5 |
| CSV parsing | csv-parse | 7.0 |
| Testing | Jest + Supertest | 30 / 7 |

## Module and Service Boundaries

### Backend (`apps/api`)

```
src/
├── app.module.ts              # Root module — imports all feature modules
├── main.ts                    # Bootstrap, ValidationPipe, CORS, HttpExceptionFilter
├── prisma/
│   ├── prisma.module.ts       # Global Prisma module
│   └── prisma.service.ts      # Lifecycle-managed PrismaClient with PrismaPg adapter
├── modules/
│   ├── geo/
│   │   ├── geo.service.ts     # Haversine distance calculation
│   │   └── geocoding.service.ts  # Forward geocoding (address → coordinates)
│   ├── cep/
│   │   ├── cep.controller.ts  # GET /api/v1/cep/:zipCode
│   │   └── cep.service.ts     # ViaCEP API integration
│   ├── resellers/
│   │   ├── resellers.controller.ts  # GET /api/v1/resellers/search
│   │   ├── resellers.service.ts     # Search orchestration
│   │   └── dto/               # SearchResellersDto, response DTOs (interfaces)
│   └── health/
│       └── health.controller.ts  # GET /api/v1/health
└── common/
    └── filters/
        └── http-exception.filter.ts  # Global error formatting
```

### Frontend (`apps/app`)

```
app/
├── _layout.tsx               # Root layout (Stack navigator, theme provider)
├── (tabs)/
│   ├── _layout.tsx           # Tab navigator
│   ├── index.tsx             # Tab One (placeholder)
│   └── two.tsx               # Tab Two (placeholder)
├── modal.tsx                 # Modal screen
├── +html.tsx                 # HTML wrapper for web
└── +not-found.tsx            # 404 screen
```

- Expo Router with file-based routing
- Typed routes enabled (`experiments.typedRoutes`)
- Dark/light theme support via `useColorScheme`
- **No search UI implemented yet** — frontend is still scaffolded Expo template

### Shared (`packages/shared`)

- Exports: `ResellerStatus` enum, `Reseller`, `SearchResult`, `ResellerResult`, `LatLng`, `SearchParams` interfaces
- Imported by frontend as `@localizador/shared`
- **NOT a dependency of the API** — API imports `@prisma/client` directly

## Data and Request Flows

### Search Flow

```
Client (Expo app)
  → GET /api/v1/resellers/search?latitude=...&longitude=...
  → ResellersController (ResellersModule)
  → ResellersService.search(dto)
    → resolveOrigin(dto)
      → coordinates: use directly
      → zipCode: CepService.findByZipCode() → GeocodingService.geocode() → lat/lng
      → street/neighborhood: GeocodingService.geocode() → lat/lng
    → Prisma query (filter by status, non-null coordinates, optional text search via q)
    → GeoService.haversineKm() for each result
    → Filter by radiusKm (if provided)
    → Sort by distance
    → Paginate (default: page=1, limit=20)
  → SearchResponseDto { origin, results[], meta }
```

### CEP Lookup Flow

```
Client → GET /api/v1/cep/:zipCode
  → CepController → CepService.findByZipCode()
    → Strip non-digits, validate 8-digit length
    → GET https://viacep.com.br/ws/{cep}/json (5s timeout)
    → Normalize response
  → CepResponseDto { cep, logradouro, bairro, localidade, uf }
```

### Seed Flow

```
pnpm --filter api prisma:seed
  → Parse data/Base_200_Revendedoras_Fake.csv (semicolon-delimited)
  → For each record:
    → Normalize status string → enum
    → Construct full address
    → Geocode via Nominatim (1.1s rate limit between requests)
    → Fallback: geocode by CEP if full address fails
    → Upsert into PostgreSQL (idempotent by id)
  → Log failures to seed-failures.log
```

## Architecture Invariants

- **PrismaPg adapter is required** — Prisma 7 does not auto-read DATABASE_URL; both `PrismaService` and `seed.ts` must pass `adapter: new PrismaPg({ connectionString })`
- **No geocoding at search time** — reseller coordinates must be pre-computed in database via seed
- **Haversine only** — no PostGIS, no paid routing services (200 records don't warrant it)
- **Shared types in `packages/shared`** — never duplicate type definitions between API and App
- **API imports `@prisma/client` directly** — `@localizador/shared` is NOT a dependency of the API
- **`strict: true` enforced** across monorepo via `tsconfig.base.json`
- **Response DTOs are interfaces** (no class-validator decorators on response types)
- **`ValidationPipe`** uses `whitelist: true` + `forbidNonWhitelisted: true` + `transform: true`
- **Global exception filter** formats all HTTP errors consistently: `{ statusCode, message, error }`
- **Config via env vars** — `ConfigModule.forRoot({ isGlobal: true })` loads `.env`
- **All API routes prefixed** with `/api/v1/`
