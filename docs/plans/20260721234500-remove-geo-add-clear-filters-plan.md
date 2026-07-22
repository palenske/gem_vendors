---
title: "Remover Geolocalização + Adicionar Limpar Filtros"
type: refactor
status: active
date: 2026-07-21
phased: true
---

# Plano — Revisão da Integração Formulário → Backend → Resultados

## Overview

Remover a funcionalidade de geolocalização ("Usar minha localização") e adicionar botão "Limpar filtros" no projeto Localizador de Revendedoras. O usuário buscará revendedoras exclusivamente via filtros manuais (CEP, rua, número, bairro, raio). Ao limpar filtros, a aplicação volta ao estado inicial (antes da primeira busca).

Brainstorm: `docs/brainstorms/20260721234019-revise-form-integration-brainstorm.md`

## Scope / Work Breakdown

| Grupo | Requisitos | Fase |
|-------|-----------|------|
| Backend cleanup | Remover endpoint `/geo/reverse`, `reverseGeocode` do service, DTO, controller, spec | 1 |
| Frontend cleanup | Remover `useGeolocation`, `reverseGeocode` do api.ts, lat/lng do form schema | 2 |
| Clear filters | Adicionar botão "Limpar filtros", `onClear` prop, reset de estado | 3 |

## Proposed Solution

- **Backend**: Deletar `GeoController`, `reverseGeocode()` de `GeocodingService`, `ReverseGeocodeResponseDto`, e seus specs. Manter `geocode()` (forward) e `GeoModule` (sem controller).
- **Frontend**: Deletar `useGeolocation.ts`, remover `reverseGeocode` de `api.ts`, remover `latitude`/`longitude` do `searchFormSchema`. No `SearchForm`: remover botão de geolocalização + imports/hooks/effects associados. Adicionar `onClear` prop e botão "Limpar filtros" (secundário, abaixo de "Buscar", visível apenas quando há campos preenchidos).
- **Shared**: Mantém `latitude`/`longitude` opcionais no `SearchInputSchema` para compatibilidade da API.
- **Estado**: `handleClear` no `index.tsx` reseta `searchResults`, `origin`, `error`, `hasSearched`. Form usa `reset()` do react-hook-form + `setRadiusValue(20)`.

## Technical Considerations

- `geocode()` em `geocoding.service.ts` é usado por `resellers.service.ts` — NÃO remover
- `GeoModule` continua exportando `GeocodingService` — apenas remove `controllers`
- Shared `SearchInputSchema` mantém lat/lng — apenas `searchFormSchema` (form) remove
- Nenhuma migration — sem mudanças no schema Prisma
- Texto: "Informe sua localização..." → "Informe o endereço..."
- Texto validação: remover "...ou use sua localização"

## Acceptance Criteria

1. **GIVEN** user is on search screen **WHEN** page loads **THEN** "Usar minha localização" button is NOT visible
2. **GIVEN** user has searched and results are showing **WHEN** user clicks "Limpar filtros" **THEN** all fields reset (CEP, rua, número, bairro = vazio; raio = 20km)
3. **GIVEN** user has searched and results are showing **WHEN** user clicks "Limpar filtros" **THEN** results list clears, map shows placeholder
4. **GIVEN** form is empty **WHEN** page loads **THEN** "Limpar filtros" button is NOT visible
5. **GIVEN** user types CEP **WHEN** CEP auto-fills street/neighborhood **THEN** user clears CEP manually **THEN** street/neighborhood values persist (campos independentes)
6. **GIVEN** user types valid CEP **WHEN** clicks "Buscar Revendedoras" **THEN** results display correctly
7. **GIVEN** user types street + neighborhood (sem CEP) **WHEN** clicks "Buscar Revendedoras" **THEN** results display correctly
8. **GIVEN** `GET /api/v1/geo/reverse` is called **THEN** returns 404
9. **GIVEN** form has validation error **WHEN** user clicks "Limpar filtros" **THEN** errors clear

## Implementation Plan

| Phase | Nome | Depends On | Status |
|-------|------|------------|--------|
| 1 | Backend cleanup | None | ✅ Completed |
| 2 | Frontend cleanup | Phase 1 | ✅ Completed |
| 3 | Clear filters feature | Phase 2 | ✅ Completed |

---

### Phase 1: Backend cleanup

**Status**: ✅ Completed
**Objective**: Remover endpoint `/geo/reverse`, `reverseGeocode` do service, DTO, controller e specs
**Dependencies**: None

**Tasks**:

- [x] T001 Deletar `apps/api/src/modules/geo/dto/reverse-geocode.dto.ts`
  - Arquivo inteiro — contém apenas `ReverseGeocodeResponseDto`

- [x] T002 Deletar `apps/api/src/modules/geo/geo.controller.ts`
  - Arquivo inteiro — único endpoint é `GET /reverse`

- [x] T003 Deletar `apps/api/src/modules/geo/geo.controller.spec.ts`
  - Arquivo inteiro — testa o controller removido

- [x] T004 Modificar `apps/api/src/modules/geo/geo.module.ts`
  - Remover import de `GeoController`
  - Remover `controllers: [GeoController]` do decorator `@Module`
  - Resultado: `@Module({ providers: [GeoService, GeocodingService], exports: [GeoService, GeocodingService] })`

- [x] T005 Modificar `apps/api/src/modules/geo/geocoding.service.ts`
  - Remover interface `ReverseGeocodeResult` (linhas 5-11)
  - Remover método `reverseGeocode()` (linhas 77-142)
  - Manter método `geocode()` intacto

- [x] T006 Modificar `apps/api/src/modules/geo/geocoding.service.spec.ts`
  - Remover bloco `describe("reverseGeocode", ...)` inteiro (linhas 123-184)

**Após esta fase**:
1. Rodar `cd apps/api && npx tsc --noEmit` — corrigir erros de tipo
2. Rodar `cd apps/api && npx jest --passWithNoTests` — verificar que specs passam
3. Atualizar plano: marcar Phase 1 como ✅ Completed

---

### Phase 2: Frontend cleanup

**Status**: ✅ Completed
**Objective**: Remover `useGeolocation`, `reverseGeocode`, lat/lng do form schema, e botão de geolocalização
**Dependencies**: Phase 1

**Tasks**:

- [x] T007 Deletar `apps/app/hooks/useGeolocation.ts`
  - Arquivo inteiro — único consumidor é SearchForm

- [x] T008 Modificar `apps/app/services/api.ts`
  - Remover função `reverseGeocode` (linhas 194-214)
  - Remover `reverseGeocode` do objeto export `api` (linha 221)
  - Manter `searchResellers`, `lookupCep`, `health`

- [x] T009 Modificar `apps/app/components/search-form/schema.ts`
  - Remover campos `latitude` e `longitude` do schema (linhas 38-39)
  - Simplificar `superRefine`: remover validação de coordenadas (linhas 60-69)
  - Atualizar mensagem de erro: "Informe ao menos um critério de busca: CEP ou endereço (rua ou bairro)" (remover "...ou use sua localização")

- [x] T010 Modificar `apps/app/components/search-form/SearchForm.tsx`
  - Remover import: `import { useGeolocation } from "@/hooks/useGeolocation"`
  - Remover import: `import { reverseGeocode } from "@/services/api"`
  - Remover destructuring do hook: `const { location: geoLocation, error: geoError, isLoading: geoLoading, requestLocation } = useGeolocation()`
  - Remover `watch("latitude")` e `watch("longitude")` (linhas 56-57)
  - Remover `useEffect` do geoError (linhas 79-83)
  - Remover `handleUseMyLocation` (linhas 85-87)
  - Remover `useEffect` do geoLocation (linhas 89-110)
  - Remover botão "Usar minha localização" do JSX (linhas 142-156)
  - Remover `latitude`/`longitude` do `onFormSubmit` mapping (linhas 119-120)
  - Atualizar texto: "Informe sua localização para encontrar revendedoras próximas" → "Informe o endereço para encontrar revendedoras próximas"

**Após esta fase**:
1. Rodar `cd apps/app && npx tsc --noEmit` — corrigir erros de tipo
2. Verificar que nenhum import de `useGeolocation` ou `reverseGeocode` permanece
3. Atualizar plano: marcar Phase 2 como ✅ Completed

---

### Phase 3: Clear filters feature

**Status**: ✅ Completed
**Objective**: Adicionar botão "Limpar filtros" com reset completo de estado
**Dependencies**: Phase 2

**Tasks**:

- [x] T011 Modificar `apps/app/components/search-form/SearchForm.tsx` — props
  - Adicionar `onClear?: () => void` à interface `SearchFormProps`

- [x] T012 Modificar `apps/app/components/search-form/SearchForm.tsx` — hook form
  - Adicionar `reset` ao destructuring de `useForm`: `const { control, handleSubmit, watch, setValue, reset, formState: { errors } }`

- [x] T013 Modificar `apps/app/components/search-form/SearchForm.tsx` — estado local
  - Adicionar estado para controlar visibilidade do botão: `const hasFilters = Boolean(zipCode || street || neighborhood || watch("number"))`
  - Observação: `zipCode`, `street`, `neighborhood` já são watched. Adicionar `number` ao watch ou usar `watch()` sem argumento para observar todos os campos.

- [x] T014 Modificar `apps/app/components/search-form/SearchForm.tsx` — handler de limpar
  - Adicionar `handleClear` que:
    1. Chama `reset()` (reseta todos os campos para defaultValues: strings vazias, radiusKm=20)
    2. Chama `setRadiusValue(20)` (reseta estado local do slider)
    3. Chama `onClear?.()` (notifica parent)

- [x] T015 Modificar `apps/app/components/search-form/SearchForm.tsx` — botão JSX
  - Adicionar botão "Limpar filtros" abaixo do botão "Buscar Revendedoras"
  - Estilo: botão secundário (bg-transparent, border outline-variant, text-on-surface)
  - Visível apenas quando `hasFilters` é true
  - `onPress={handleClear}`
  - `disabled={isSubmitting}`
  - `style={{ minHeight: 48 }}`

- [x] T016 Modificar `apps/app/app/index.tsx` — handleClear
  - Adicionar `handleClear`:
    ```typescript
    const handleClear = () => {
      setSearchResults([]);
      setOrigin(null);
      setError(null);
      setHasSearched(false);
    };
    ```
  - Passar `onClear={handleClear}` ao `SearchForm`

**Após esta fase**:
1. Rodar `cd apps/app && npx tsc --noEmit` — corrigir erros de tipo
2. Testar manualmente: buscar → limpar → verificar que formulário, resultados e mapa resetam
3. Atualizar plano: marcar Phase 3 como ✅ Completed

---

## Master Checklist

### Phase 1: Backend cleanup
- [x] T001 Deletar `reverse-geocode.dto.ts`
- [x] T002 Deletar `geo.controller.ts`
- [x] T003 Deletar `geo.controller.spec.ts`
- [x] T004 Modificar `geo.module.ts` — remover controller
- [x] T005 Modificar `geocoding.service.ts` — remover reverseGeocode
- [x] T006 Modificar `geocoding.service.spec.ts` — remover reverseGeocode tests
- [x] TypeScript validation passes

### Phase 2: Frontend cleanup
- [x] T007 Deletar `useGeolocation.ts`
- [x] T008 Modificar `api.ts` — remover reverseGeocode
- [x] T009 Modificar `schema.ts` — remover lat/lng
- [x] T010 Modificar `SearchForm.tsx` — remover geolocalização
- [x] TypeScript validation passes

### Phase 3: Clear filters feature
- [x] T011 Adicionar `onClear` prop
- [x] T012 Adicionar `reset` ao destructuring
- [x] T013 Adicionar `hasFilters` state
- [x] T014 Adicionar `handleClear` handler
- [x] T015 Adicionar botão "Limpar filtros" JSX
- [x] T016 Modificar `index.tsx` — handleClear + passar prop
- [x] TypeScript validation passes
