# Integrations — Localizador de Revendedoras

## Integration Catalog

| Service | Protocol | Purpose | Auth | Timeout |
|---------|----------|---------|------|---------|
| PostgreSQL | TCP (PrismaPg) | Primary data store | `DATABASE_URL` (connection string) | — |
| ViaCEP | HTTPS | CEP → address lookup | None | 5s |
| Nominatim/OSM | HTTPS | Address → geocoordinates | User-Agent header | 5s |

## Authentication and Access

- **No user authentication** — public API, no auth guards
- **No API keys** — all endpoints are open
- **External API identification** — Nominatim requires `User-Agent` header (configurable via `NOMINATIM_USER_AGENT` env var)

## Contracts and Data Flows

### ViaCEP

- **Request**: `GET https://viacep.com.br/ws/{cep}/json`
- **Response**: `{ cep, logradouro, bairro, localidade, uf }` or `{ erro: true }`
- **Error handling**: throws `HttpException(503)` on HTTP error, `NotFoundException(404)` on invalid/not-found CEP
- **Called by**: `CepService.findByZipCode()` — standalone endpoint and search origin resolution

### Nominatim/OpenStreetMap

- **Request**: `GET https://nominatim.openstreetmap.org/search?q=...&format=json&limit=1` + `User-Agent` header
- **Response**: `[{ lat: string, lon: string }]` (empty array if no results)
- **Error handling**: throws `HttpException(503)` on HTTP error, `HttpException(422)` on no results
- **Called by**: `GeocodingService.geocode()` — search origin resolution and seed script
- **Rate limit**: ~1 req/sec; seed script uses 1.1s delay

### PostgreSQL (via Prisma)

- **Protocol**: TCP through `@prisma/adapter-pg` (PrismaPg driver adapter)
- **Schema**: single `Reseller` model with indexes on `status`, `zipCode`, `city`
- **Access pattern**: read-heavy (search queries), write-only during seed (upsert)
- **No connection pooling config visible** — may need `?connection_limit=` for PgBouncer in production

## Failure Modes and Retries

| Integration | Failure Mode | Behavior | Retry |
|-------------|-------------|----------|-------|
| ViaCEP timeout | `AbortSignal.timeout(5000)` | `HttpException(503)` | None |
| ViaCEP not found | `data.erro === true` | `NotFoundException(404)` | None |
| Nominatim timeout | `AbortSignal.timeout(5000)` | `HttpException(503)` | None |
| Nominatim no results | Empty array | `HttpException(422)` | None |
| PostgreSQL connection | PrismaClient error | Propagated to caller | None |

**No retry logic exists anywhere** — all external API failures propagate immediately.

## Ownership

- **Backend team** owns all integrations (no separate integration service)
- **ViaCEP** — free public API, no SLA
- **Nominatim** — free OpenStreetMap service, usage policy requires User-Agent and rate limiting
- **PostgreSQL** — managed instance (Railway), team owns schema and queries
