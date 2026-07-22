# Brainstorm — Revisão da Integração Formulário → Backend → Resultados

## 1. What We're Building

Revisão da integração entre formulário de busca, backend e exibição de resultados no projeto "Localizador de Revendedoras". O objetivo é simplificar a UX removendo a funcionalidade de geolocalização ("Usar minha localização") e adicionando a capacidade de limpar todos os filtros de uma vez, resetando o estado da aplicação ao estado inicial.

O usuário deve buscar revendedoras exclusivamente através de filtros manuais: CEP, rua, número, bairro e raio de busca. O botão de geolocalização e toda a lógica associada (hook `useGeolocation`, chamada `reverseGeocode`, campos ocultos `latitude`/`longitude` no formulário) serão removidos. Um novo botão "Limpar filtros" será adicionado ao formulário, visível apenas quando houver campos preenchidos.

## 2. Current State

### Backend (`apps/api`) — FUNCIONAL

| Componente | Caminho | Status |
|------------|---------|--------|
| Search endpoint | `apps/api/src/modules/resellers/resellers.controller.ts` | `GET /api/v1/resellers/search` |
| Search service (resolveOrigin + search) | `apps/api/src/modules/resellers/resellers.service.ts` | Prioridade: coordenadas → CEP → endereço → throw |
| Search DTO | `apps/api/src/modules/resellers/dto/search-resellers.dto.ts` | Todos opcionais, ao menos um critério |
| CEP endpoint | `apps/api/src/modules/cep/cep.controller.ts` | `GET /api/v1/cep/:zipCode` |
| Geo reverse endpoint | `apps/api/src/modules/geo/geo.controller.ts` | `GET /api/v1/geo/reverse` — **SERÁ REMOVIDO** |
| Geocoding service | `apps/api/src/modules/geo/geocoding.service.ts` | `geocode()` (forward) + `reverseGeocode()` — **reverse será removido** |
| Reverse geocode DTO | `apps/api/src/modules/geo/dto/reverse-geocode.dto.ts` | **SERÁ REMOVIDO** |

### Frontend (`apps/app`) — IMPLEMENTADO

| Componente | Caminho | Status |
|------------|---------|--------|
| Tela principal | `apps/app/app/index.tsx` | State: searchResults, origin, loading, error, hasSearched |
| SearchForm | `apps/app/components/search-form/SearchForm.tsx` | Botão "Usar minha localização" — **SERÁ REMOVIDO** |
| Form schema | `apps/app/components/search-form/schema.ts` | Campos latitude/longitude — **SERÃO REMOVIDOS** |
| useGeolocation hook | `apps/app/hooks/useGeolocation.ts` | **SERÁ REMOVIDO** |
| useCepLookup hook | `apps/app/hooks/useCepLookup.ts` | MANTIDO — auto-preenchimento de rua/bairro |
| API client | `apps/app/services/api.ts` | `reverseGeocode()` — **SERÁ REMOVIDO** |
| ResellerList | `apps/app/components/reseller-list/ResellerList.tsx` | MANTIDO |
| Map | `apps/app/components/map/Map.web.tsx` | MANTIDO |
| ResponsiveShell | `apps/app/components/layout/ResponsiveShell.tsx` | MANTIDO |

### Shared (`packages/shared`) — FUNCIONAL

| Componente | Caminho | Status |
|------------|---------|--------|
| SearchInputSchema | `packages/shared/src/schemas/search.schema.ts` | Mantém latitude/longitude opcionais (compatibilidade API) |
| CepResponseSchema | `packages/shared/src/schemas/search.schema.ts` | MANTIDO |

### Brainstorms Existentes

- `docs/brainstorms/20260721020000-conformidade-enunciado-brainstorm.md` — análise de conformidade vs enunciado
- `docs/brainstorms/20260721110000-t6-frontend-foundation-brainstorm.md` — fundação do frontend

## 3. Architecture & Infrastructure

### Onde a lógica vive

Toda a mudança é **apenas frontend + limpeza de dead code no backend**. Nenhuma mudança funcional no backend.

| Mudança | Localização | Responsabilidade |
|---------|-------------|------------------|
| Remover botão geolocalização | `SearchForm.tsx` | UI — remover JSX do botão |
| Remover hook useGeolocation | `hooks/useGeolocation.ts` | Deletar arquivo |
| Remover reverseGeocode do frontend | `services/api.ts` | Deletar função |
| Remover latitude/longitude do form schema | `components/search-form/schema.ts` | Adaptação do Zod schema |
| Adicionar botão "Limpar filtros" | `SearchForm.tsx` | UI — novo botão secundário |
| Adicionar callback onClear | `app/index.tsx` | State management — resetar estado |
| Remover endpoint /geo/reverse | `apps/api/src/modules/geo/geo.controller.ts` | Backend — deletar endpoint e DTO |
| Remover reverseGeocode do geocoding service | `apps/api/src/modules/geo/geocoding.service.ts` | Backend — deletar método |

### Cloud Services

Nenhuma mudança. Backend já existe.

### Data Model

Nenhuma entidade nova. Nenhuma migration necessária.

### Infrastructure Changes

| Mudança | Arquivo | Impacto |
|---------|---------|---------|
| Deletar `apps/app/hooks/useGeolocation.ts` | DELETE | — |
| Deletar `apps/api/src/modules/geo/dto/reverse-geocode.dto.ts` | DELETE | — |
| Modificar `apps/app/components/search-form/SearchForm.tsx` | MAJOR | Remover geolocalização + adicionar limpar filtros |
| Modificar `apps/app/components/search-form/schema.ts` | MINOR | Remover lat/lng do schema do formulário |
| Modificar `apps/app/app/index.tsx` | MINOR | Adicionar handleClear callback |
| Modificar `apps/app/services/api.ts` | MINOR | Remover reverseGeocode |
| Modificar `apps/api/src/modules/geo/geo.controller.ts` | MAJOR | Remover endpoint /reverse |
| Modificar `apps/api/src/modules/geo/geocoding.service.ts` | MAJOR | Remover reverseGeocode method |
| Modificar `apps/api/src/modules/geo/geo.module.ts` | MINOR | Remover GeoController dos controllers |
| Modificar `packages/shared/src/schemas/search.schema.ts` | NONE | Mantém lat/lng opcionais |

### Security Approach

- API pública (sem auth) — nenhuma mudança
- Remoção de endpoint não expõe novos riscos
- Validação client-side mantida

## 4. Integration Impact

### Entity Impact

| Entidade | Impacto | Migration |
|----------|---------|-----------|
| `Reseller` | Nenhuma mudança | Não |
| `SearchInputSchema` | Mantém lat/lng opcionais (backward compat) | Não |
| `searchFormSchema` | Remove lat/lng — apenas formulário | Não |

### Lambda Pipeline Impact

Nenhum. Projeto é NestJS monolith, não Lambda.

### Backend API Impact

| Endpoint | Impacto | Risco |
|----------|---------|-------|
| `GET /api/v1/resellers/search` | Nenhuma mudança no contrato | Nenhum |
| `GET /api/v1/geo/reverse` | **REMOVIDO** — 404 para qualquer chamador | Baixo — frontend era único consumidor |
| `GET /api/v1/cep/:zipCode` | Nenhuma mudança | Nenhum |

### Frontend Feature Impact

| Componente | Impacto | Risco |
|------------|---------|-------|
| `SearchForm.tsx` | **MAJOR** — remover geolocalização + adicionar limpar | Médio |
| `schema.ts` | **MINOR** — remover lat/lng | Baixo |
| `index.tsx` | **MINOR** — adicionar handleClear | Baixo |
| `api.ts` | **MINOR** — remover reverseGeocode | Baixo |
| `ResellerList.tsx` | Nenhum | Nenhum |
| `Map*.tsx` | Nenhum | Nenhum |
| `ResponsiveShell.tsx` | Nenhum | Nenhum |

### Breaking Changes

| Mudança | Severidade | Mitigação |
|---------|------------|-----------|
| "Usar minha localização" removido | **Média** (intencional) | Usuário deve digitar CEP ou endereço manualmente |
| `GET /api/v1/geo/reverse` retorna 404 | **Baixa** | Frontend era único consumidor; remover endpoint é limpeza |
| `useGeolocation` hook deletado | **Baixa** | Apenas importado por SearchForm |
| `reverseGeocode` deletado do frontend | **Baixa** | Apenas importado por SearchForm |
| Botão "Limpar filtros" adicionado | **Baixa** (adicione) | Novo comportamento — reset ao estado inicial |

## 5. Key Decisions

1. **✅ DECIDED:** Botão "Usar minha localização" e toda a lógica de geolocalização serão removidos do frontend
2. **✅ DECIDED:** Hook `useGeolocation.ts` será deletado (arquivo inteiro)
3. **✅ DECIDED:** Função `reverseGeocode()` será removida do `services/api.ts`
4. **✅ DECIDED:** Campos `latitude`/`longitude` serão removidos do `searchFormSchema` (form schema), mas mantidos no `SearchInputSchema` (shared) para compatibilidade da API
5. **✅ DECIDED:** Endpoint `GET /api/v1/geo/reverse` será removido do backend (controller, service method, DTO)
6. **✅ DECIDED:** Botão "Limpar filtros" será adicionado ao formulário, visível apenas quando houver campos preenchidos
7. **✅ DECIDED:** Ao limpar filtros: resetar formulário + limpar resultados + limpar mapa → voltar ao estado inicial (antes da primeira busca)
8. **✅ DECIDED:** Botão "Limpar filtros" será um botão secundário abaixo do botão "Buscar Revendedoras"
9. **✅ DECIDED:** Limpar CEP **NÃO** limpa rua/bairro — campos são independentes, usuário pode buscar por endereço sem CEP
10. **✅ DECIDED:** Slider de raio será resetado para o padrão (20km) ao limpar filtros
11. **✅ DECIDED:** Texto de erro da validação será atualizado para remover referência a "use sua localização"
12. **✅ DECIDED:** Texto "Informe sua localização para encontrar revendedoras próximas" será atualizado para "Informe o endereço para encontrar revendedoras próximas"
13. **✅ DECIDED:** Nenhuma mudança no backend `resellers.service.ts` — `resolveOrigin()` continua com a mesma cadeia de prioridade (coordenadas → CEP → endereço), mas coordenadas nunca mais virão do frontend

## 6. Open Questions

Todas as questões foram resolvidas durante o brainstorm.

## 7. Next Steps

1. Executar `/pwf-plan docs/brainstorms/20260721234019-revise-form-integration-brainstorm.md` para gerar o plano de implementação
2. Durante o plano, definir:
   - Lógica exata do `handleClear` no `index.tsx`
   - Animação/transition ao resetar o mapa
   - Estado do botão "Limpar filtros" durante submissão do formulário
