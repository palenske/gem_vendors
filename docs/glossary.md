# Glossary — Localizador de Revendedoras

## Domain Terms

- **Revendedora** — Reseller/vendor of products (the core entity; Portuguese feminine noun)
- **CEP** — Código de Endereçamento Postal — Brazilian postal code (8 digits, format `XXXXX-XXX`)
- **Geocoding** — Converting address text to latitude/longitude coordinates
- **Haversine** — Formula for computing great-circle distance between two lat/lng points on a sphere
- **Localizador** — Locator/searcher (the application's purpose: find resellers by location)

## Technical Terms and Acronyms

- **Prisma** — TypeScript ORM for PostgreSQL (v7.8)
- **PrismaPg** — Prisma driver adapter for PostgreSQL via `pg` driver (required for Prisma 7 to connect)
- **Nominatim** — OpenStreetMap geocoding service (free, rate-limited)
- **ViaCEP** — Brazilian free CEP lookup API
- **Expo** — React Native development platform (SDK 57)
- **Expo Router** — File-based routing for Expo/React Native
- **NativeWind** — Tailwind CSS for React Native (planned, not yet in dependencies)
- **NestJS** — Node.js backend framework (v11)
- **ValidationPipe** — NestJS request validation decorator using class-validator
- **PgBouncer** — PostgreSQL connection pooler (may be used in production; requires `connection_limit` in URL)

## Naming Conventions

- **Files**: `kebab-case` (e.g., `resellers.service.ts`, `cep-response.dto.ts`)
- **Classes**: `PascalCase` (e.g., `ResellersService`, `GeocodingService`)
- **Interfaces**: `PascalCase` with `Dto` suffix for data transfer objects (e.g., `SearchResponseDto`)
- **Enums**: `PascalCase` with `SCREAMING_SNAKE_CASE` values (e.g., `ResellerStatus.ATIVA`)
- **API routes**: `/api/v1/{resource}` prefix
- **Environment variables**: `SCREAMING_SNAKE_CASE` (e.g., `DATABASE_URL`, `NOMINATIM_USER_AGENT`)
- **Packages**: scoped as `@localizador/{name}` (e.g., `@localizador/shared`)
