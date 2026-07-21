# Brainstorm — T6: Fundação do Front-end (Expo Router + NativeWind + Shared Types)

## 1. What We're Building

A fundação arquitetural do frontend do "Localizador de Revendedoras" — primeira de três tarefas de frontend (T6–T8) que transformam o scaffold padrão do Expo Router em uma aplicação funcional de busca geolocalizada.

T6 entrega quatro artefatos que as tarefas seguintes (T7 — formulário, T8 — mapa/resultados, T9 — polimento) consomem diretamente:

1. **NativeWind + Tailwind** — sistema de estilos utilitário para React Native, substituindo o `StyleSheet.create()` disperso por classes `className` consistentes, com suporte a breakpoints responsivos e dark mode via media query do SO.
2. **Schemas de validação compartilhados** — schemas Zod em `packages/shared` que espelham exatamente os DTOs de entrada/saída da API (SearchResellersDto, SearchResponseDto, CepResponseDto). Servem como fonte única de verdade para validação client-side e definição de tipos.
3. **Cliente de API tipado** — serviço `api.ts` que lê `EXPO_PUBLIC_API_URL`, faz fetch com timeout e tratamento de erro, e exporta métodos tipados (`searchResellers()`, `lookupCep()`, `health()`) usando os schemas do shared package.
4. **ResponsiveShell** — componente de layout mobile-first que empilha conteúdo verticalmente em mobile e alterna para split view (mapa 60% / sidebar 40%) a partir de 768px (`md`).

Esta tarefa **não implementa nenhuma interface de usuário final** — formulário de busca (T7), lista de resultados (T8) e mapa (T8) virão depois. T6 é puramente infraestrutura de frontend.

## 2. Current State

### Backend (`apps/api`) — ✅ COMPLETO (NÃO MODIFICADO)

| Componente | Caminho |
|------------|---------|
| Schema Prisma (Reseller + Enums) | `apps/api/prisma/schema.prisma` |
| Seed (CSV → PostgreSQL + geocodificação) | `apps/api/prisma/seed.ts` |
| Módulo Geo (Haversine) | `apps/api/src/modules/geo/geo.service.ts` |
| Módulo Geo (Nominatim) | `apps/api/src/modules/geo/geocoding.service.ts` |
| Módulo CEP (ViaCEP) | `apps/api/src/modules/cep/cep.controller.ts`, `cep.service.ts` |
| Módulo Resellers (search) | `apps/api/src/modules/resellers/resellers.controller.ts`, `resellers.service.ts` |
| DTOs de entrada | `apps/api/src/modules/resellers/dto/search-resellers.dto.ts` |
| DTOs de resposta | `apps/api/src/modules/resellers/dto/reseller-response.dto.ts` |
| DTO CEP | `apps/api/src/modules/cep/dto/cep-response.dto.ts` |
| Filtro global de erros | `apps/api/src/common/filters/http-exception.filter.ts` |

### Frontend (`apps/app`) — ❌ SCAFFOLD APENAS

| Componente | Caminho | Status |
|------------|---------|--------|
| Root layout (Stack) | `apps/app/app/_layout.tsx` | ✅ Scaffold |
| Tab navigator (2 tabs) | `apps/app/app/(tabs)/_layout.tsx` | ✅ Scaffold |
| Tab One (placeholder) | `apps/app/app/(tabs)/index.tsx` | ❌ Placeholder |
| Tab Two (placeholder) | `apps/app/app/(tabs)/two.tsx` | ❌ Placeholder |
| Cores (light/dark) | `apps/app/constants/Colors.ts` | ✅ 5 tokens |
| Theme components | `apps/app/components/Themed.tsx` | ✅ ThemedView/ThemedText |
| NativeWind | — | ❌ NÃO INSTALADO |
| API client service | — | ❌ NÃO EXISTE |
| Schemas compartilhados | — | ❌ NÃO EXISTE |
| ResponsiveShell | — | ❌ NÃO EXISTE |

### Shared (`packages/shared`) — ✅ TYPES EXISTEM

| Artefato | Caminho |
|----------|---------|
| `ResellerStatus` enum | `packages/shared/src/types/reseller.ts` |
| `Reseller`, `SearchResult`, `ResellerResult`, `LatLng`, `SearchParams` interfaces | `packages/shared/src/types/reseller.ts` |
| Index exports | `packages/shared/src/index.ts` |

**Missing**: `CepResponseDto` type, validation schemas, search input schema.

### Documentação Relacionada

- `docs/architecture.md` — arquitetura do monorepo, decisões, invariantes
- `docs/integrations.md` — contratos ViaCEP, Nominatim, PostgreSQL
- `docs/infrastructure.md` — ambientes, deploy, runtime
- `docs/brainstorms/20260721020000-conformidade-enunciado-brainstorm.md` — análise de conformidade vs enunciado

## 3. Architecture & Infrastructure

### Onde a lógica vive

Toda a lógica de T6 vive **no frontend (`apps/app`)  e no shared package (`packages/shared`)**. Nenhum código toca `apps/api/`.

| Artefato | Localização | Responsabilidade |
|----------|-------------|------------------|
| NativeWind config | `apps/app/tailwind.config.js` | Breakpoints, cores, dark mode |
| NativeWind plugin | `apps/app/babel.config.js` | Transformação Metro |
| Global CSS | `apps/app/global.css` | Diretivas @tailwind |
| Validação compartilhada | `packages/shared/src/schemas/search.schema.ts` | Schemas Zod dos DTOs da API |
| Cliente API | `apps/app/services/api.ts` | Fetch tipado com timeout e erro |
| Layout responsivo | `apps/app/components/layout/ResponsiveShell.tsx` | Split view container |
| Hook de breakpoint | `apps/app/hooks/useBreakpoint.ts` | Breakpoint detection via JS |

### Cloud Services

Nenhum. T6 é puramente client-side. A API backend já está implantada.

### Data Model

Nenhuma entidade nova. Schemas Zod espelham DTOs existentes:

- **SearchInput**: espelha `SearchResellersDto` (todos opcionais, ao menos um critério)
- **SearchResponse**: espelha `SearchResponseDto` (origin, results[], meta)
- **CepResponse**: espelha `CepResponseDto` (cep, logradouro, bairro, localidade, uf)

### Infrastructure Changes

| Mudança | Detalhe |
|---------|---------|
| `apps/app/.env.example` | **NOVO** — documenta `EXPO_PUBLIC_API_URL` |
| `apps/app/babel.config.js` | **NOVO** — plugin nativewind/babel + reanimated/plugin |
| `apps/app/metro.config.js` | **NOVO** — plugin Metro do NativeWind |
| `apps/app/tailwind.config.js` | **NOVO** — breakpoints sm/md/lg, darkMode: 'media' |
| `apps/app/global.css` | **NOVO** — diretivas @tailwind |
| `apps/app/nativewind-env.d.ts` | **NOVO** — tipos TS para NativeWind |
| `apps/app/postcss.config.js` | **NOVO** — PostCSS (web) com tailwindcss + autoprefixer |
| `apps/app/package.json` | **MODIFICADO** — adicionar nativewind + tailwindcss@3 + zod |
| `packages/shared/package.json` | **MODIFICADO** — adicionar zod |
| `packages/shared/src/index.ts` | **MODIFICADO** — exportar schemas |

### Security Approach

- API pública (sem auth) — `EXPO_PUBLIC_API_URL` não é secreta
- Nenhum endpoint exposto além dos já existentes no backend
- Validação client-side via Zod não substitui validação server-side (dupla camada)
- `EXPO_PUBLIC_API_URL` com fallback localhost — desenvolvedor deve configurar

## 4. Integration Impact

### Shared Package Impact

| Arquivo | Impacto |
|---------|---------|
| `packages/shared/src/schemas/search.schema.ts` | **NOVO** — schemas Zod para SearchInput, SearchResponse, CepResponse |
| `packages/shared/src/index.ts` | **MODIFICADO** — exportar schemas |
| `packages/shared/package.json` | **MODIFICADO** — adicionar `zod` |

### Frontend Impact

| Arquivo | Impacto | Risco |
|---------|---------|-------|
| `apps/app/app/_layout.tsx` | **MODIFICADO** — import `global.css` (1 linha) | Baixo — aditivo |
| `apps/app/package.json` | **MODIFICADO** — novas deps | Médio — compatibilidade Expo SDK 57 |
| `apps/app/services/api.ts` | **NOVO** — cliente fetch tipado | — |
| `apps/app/components/layout/ResponsiveShell.tsx` | **NOVO** — layout split view | — |
| `apps/app/hooks/useBreakpoint.ts` | **NOVO** — hook de breakpoint | — |
| `apps/app/app/(tabs)/index.tsx` | **NÃO MODIFICADO** (será T8) | — |
| `apps/app/app/(tabs)/_layout.tsx` | **NÃO MODIFICADO** | — |
| `apps/app/constants/Colors.ts` | **NÃO MODIFICADO** | — |

### Breaking Changes

**Nenhuma.** T6 é estritamente aditivo — cria arquivos novos e adiciona 1 linha de import ao `_layout.tsx`. Zero breaking changes.

### Riscos Altos (Edge Cases)

| # | Risco | Severidade | Mitigação |
|---|-------|------------|-----------|
| 1 | NativeWind v4 incompatível com Expo SDK 57 / RN 0.86 | **ALTA** | Fixar versão. Testar imediatamente após `pnpm install`. Fallback: StyleSheet.create |
| 2 | `babel.config.js` sem ordem correta de plugins | **ALTA** | `nativewind/babel` → outros → `react-native-reanimated/plugin` (último) |
| 3 | `metro.config.js` ausente | **ALTA** | Plugin Metro do NativeWind necessário para native |
| 4 | `tailwindcss` v4 instalado em vez de v3 | **ALTA** | Fixar `tailwindcss@3.4.17` |
| 5 | `EXPO_PUBLIC_API_URL` não definida | **ALTA** | Validar no módulo + `.env.example` |
| 6 | Query params numéricos sem coerção string→number | **ALTA** | Zod `z.coerce.number()` |

## 5. Key Decisions

1. **✅ DECIDED:** Zod como biblioteca de validação padrão (schemas compartilhados + formulário). Yup removido do plano.
2. **✅ DECIDED:** Dois tiers de breakpoint — `< 768px` stacked, `>= 768px` split (60/40). Mantendo fidelidade ao plano original T6.
3. **✅ DECIDED:** Slots do ResponsiveShell via named props (`sidebar`, `map`, `bannerSlot`) — tipados, previsíveis.
4. **✅ DECIDED:** `darkMode: 'media'` no tailwind.config.js — sincronizado com `prefers-color-scheme` do SO.
5. **✅ DECIDED:** Zod será adicionado ao `packages/shared` como dependência (não apenas no app).
6. **✅ DECIDED:** NativeWind + Tailwind v3 (fixado em `3.4.17`).
7. **✅ DECIDED:** Cliente API validará `EXPO_PUBLIC_API_URL` no load e lançará erro descritivo se ausente.
8. **✅ DECIDED:** Schema SearchInput terá `.superRefine()` exigindo ao menos um critério de busca.
9. **✅ DECIDED:** `page`/`limit`/`radiusKm` usarão `z.coerce.number()` nos schemas.
10. **⚠️ OPEN:** Compatibilidade exata de `nativewind@4` com Expo SDK 57 + RN 0.86 + React 19 — será testada na implementação.
11. **⚠️ OPEN:** `app.json` tem `"orientation": "portrait"` — split view nunca ativa em phones (só web/tablet). Decisão de mudar ou manter adiada para T9.

## 6. Open Questions

1. **Compatibilidade NativeWind + Expo SDK 57**: A versão mais recente do NativeWind pode não ser compatível com RN 0.86 + React 19. Resolver na instalação — se falhar, usar `StyleSheet.create()` e CSS media queries como fallback (adiando NativeWind para T7).
2. **Orientation lock**: `app.json` trava portrait em mobile. Split view (≥ 768px) nunca dispara em phones. Confirmar em T9 se landscape tablet é desejado.

## 7. Next Steps

1. Executar `/pwf-plan docs/brainstorms/20260721110000-t6-frontend-foundation-brainstorm.md` para gerar o plano de implementação.
2. Durante o plano, definir explicitamente:
   - Versão exata do NativeWind a instalar (validar com Expo SDK 57)
   - Ordem exata dos plugins babel
   - Tipagem do contrato de slots do ResponsiveShell
   - Constantes de breakpoint (sm=640, md=768, lg=1024)
3. Pré-requisitos: nenhum (backend completo, shared types existentes)
