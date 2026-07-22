# Spec Flow Analysis: Clear Filters Feature & Geolocation Removal

## 1. User Flow Overview

### Current State (Before Changes)
```
User arrives → Empty form + map placeholder
  ↓
Fills CEP → Auto-fills street/neighborhood
  ↓
Clicks "Usar minha localização" → Gets GPS coords → Reverse geocodes → Fills form
  ↓
Submits form → API call → Results on map + list
```

### Target State (After Changes)
```
User arrives → Empty form + map placeholder + NO clear button
  ↓
Fills CEP → Auto-fills street/neighborhood (ONLY if street/neighborhood are empty)
  ↓
Submits form → API call → Results on map + list
  ↓
Clear button appears (when fields are filled)
  ↓
Clicks "Limpar filtros" → Form resets + Results clear + Map resets + Slider → 20km
```

### User Roles
| Role | Access | Can Search | Can Clear |
|------|--------|------------|-----------|
| **End User** | Full access to search form | Yes | Yes |
| **Reseller** (viewing their listing) | Same as End User | Yes | Yes |
| **Admin** | Same as End User | Yes | Yes |

---

## 2. Flow Permutations Matrix

| Scenario | Form State | Results State | Map State | Clear Button | Expected Outcome |
|----------|------------|---------------|-----------|--------------|------------------|
| Initial load | Empty | Empty | Placeholder | Hidden | No change |
| CEP entered (partial) | zipCode filled | Empty | Placeholder | Visible | Clear resets zipCode only |
| CEP entered (full, valid) | All fields filled | Empty | Placeholder | Visible | Clear resets all fields |
| Street entered | street filled | Empty | Placeholder | Visible | Clear resets street only |
| Neighborhood entered | neighborhood filled | Empty | Placeholder | Visible | Clear resets neighborhood only |
| Radius changed | radiusKm changed | Empty | Placeholder | Visible | Clear resets radiusKm to 20 |
| Form submitted (success) | All fields filled | Results shown | Map with markers | Visible | Clear resets everything |
| Form submitted (no results) | All fields filled | Empty results | Map with origin only | Visible | Clear resets everything |
| Form submitted (error) | All fields filled | Error shown | Placeholder | Visible | Clear resets everything + clears error |
| Loading in progress | All fields filled | Loading | Loading | Visible | Clear disabled during loading |
| CEP cleared after fill | zipCode empty, street/neighborhood still filled | Results shown | Map with markers | Visible | Street/neighborhood PRESERVED |
| All fields cleared manually | All empty | Results shown | Map with markers | Hidden | Clear hidden, results/map persist until next action |

---

## 3. Gaps & Missing Elements

| Gap | Impact | Proposed Handling |
|-----|--------|------------------|
| **G1: Clear button visibility logic** | Critical | Button visible only when ANY field (zipCode, street, neighborhood, number) has non-empty value OR radiusKm ≠ 20 |
| **G2: Clear button state management** | Critical | Parent component (IndexScreen) needs `handleClearFilters` callback that resets: form, results, map, error, hasSearched |
| **G3: CEP independent clearing** | High | Clearing zipCode should NOT affect street/neighborhood. The `useEffect` that auto-fills from CEP must only run when CEP is non-empty AND street/neighborhood are empty. |
| **G4: Slider reset to 20km** | High | `radiusValue` state in SearchForm must reset to 20. The `localValue` in Slider component must also reset (currently uses internal state). |
| **G5: SearchForm reset method** | Critical | SearchForm needs a `reset()` method or `resetKey` prop to reset react-hook-form + radiusValue + cepData state |
| **G6: IndexScreen state reset** | Critical | IndexScreen needs to reset: `searchResults`, `origin`, `loading`, `error`, `hasSearched` when clear is clicked |
| **G7: Map component reset** | High | Map.web.tsx checks `!origin` to show placeholder. Resetting `origin` to `null` will show placeholder. |
| **G8: Clear button disabled during loading** | Medium | Button should be disabled when `isSubmitting` is true to prevent state corruption |
| **G9: Clear button accessibility** | Medium | Need `accessibilityLabel`, `accessibilityRole="button"`, keyboard focus support |
| **G10: Clear button animation/feedback** | Low | Visual feedback on click (toast: "Filtros limpos") for user confirmation |
| **G11: Geolocation removal - frontend** | Critical | Remove: useGeolocation import, reverseGeocode import, geoLocation/geoError/geoLoading state, handleUseMyLocation function, all geolocation useEffects, "Usar minha localização" button |
| **G12: Geolocation removal - form schema** | High | Remove `latitude`, `longitude` fields from `searchFormSchema`. Remove related `superRefine` validation. |
| **G13: Geolocation removal - shared schema** | High | Remove `latitude`, `longitude` from `SearchInputSchema` in shared package. Update `superRefine` validation. |
| **G14: Geolocation removal - backend DTO** | High | Remove `latitude`, `longitude` from `SearchResellersDto`. Update `resolveOrigin()` to only use zipCode or address. |
| **G15: Geolocation removal - backend service** | High | Remove geocoding dependency from `resolveOrigin()`. Remove coordinates branch. |
| **G16: Geolocation removal - geo module** | Medium | Consider keeping `GeoService` (haversine) but remove `GeocodingService` reverse geocode. Or keep entire geo module for future use. |
| **G17: Geolocation removal - API client** | High | Remove `reverseGeocode` function from `services/api.ts`. Remove from `api` export. |
| **G18: CEP auto-fill edge case** | Medium | Current logic: `if (cepData && !street && !neighborhood)` - this is CORRECT for independence. But what if user manually edits street after CEP fill? The condition still holds. |
| **G19: Radius value sync** | Medium | `radiusValue` (local state) and `radiusKm` (form field) can get out of sync. Reset must update both. |
| **G20: Clear confirmation** | Low | Should user be asked "Tem certeza?" before clearing? Spec says no, but consider for large result sets. |

---

## 4. Draft Acceptance Criteria

#### AC-1: Clear button hidden on initial load

**Given** I am a user visiting the app for the first time
**When** the page loads
**Then** I do NOT see a "Limpar filtros" button anywhere in the form

**Roles:** End User
**Priority:** Must-have

#### AC-2: Clear button appears when CEP is entered

**Given** I am on the search form
**When** I type a CEP value (e.g., "01310-100")
**Then** the "Limpar filtros" button appears below the form fields

**Roles:** End User
**Priority:** Must-have

#### AC-3: Clear button appears when street is entered

**Given** I am on the search form
**When** I type a street name (e.g., "Av. Paulista")
**Then** the "Limpar filtros" button appears below the form fields

**Roles:** End User
**Priority:** Must-have

#### AC-4: Clear button appears when neighborhood is entered

**Given** I am on the search form
**When** I type a neighborhood name (e.g., "Bela Vista")
**Then** the "Limpar filtros" button appears below the form fields

**Roles:** End User
**Priority:** Must-have

#### AC-5: Clear button appears when number is entered

**Given** I am on the search form
**When** I type a street number (e.g., "1000")
**Then** the "Limpar filtros" button appears below the form fields

**Roles:** End User
**Priority:** Must-have

#### AC-6: Clear button appears when radius is changed from default

**Given** I am on the search form with radius at 20km (default)
**When** I increase or decrease the radius slider
**Then** the "Limpar filtros" button appears below the form fields

**Roles:** End User
**Priority:** Must-have

#### AC-7: Clear button hidden when all fields are empty and radius is default

**Given** I am on the search form with all fields empty and radius at 20km
**When** I clear the last field manually
**Then** the "Limpar filtros" button disappears

**Roles:** End User
**Priority:** Must-have

#### AC-8: Clear resets form fields to empty

**Given** I have filled CEP, street, neighborhood, and number
**When** I click "Limpar filtros"
**Then** all form fields (zipCode, street, number, neighborhood) are cleared to empty strings

**Roles:** End User
**Priority:** Must-have

#### AC-9: Clear resets radius slider to 20km

**Given** I have changed the radius slider to 50km
**When** I click "Limpar filtros"
**Then** the radius slider resets to 20km

**Roles:** End User
**Priority:** Must-have

#### AC-10: Clear resets form schema validation state

**Given** I have triggered a validation error (e.g., invalid CEP format)
**When** I click "Limpar filtros"
**Then** all validation errors are cleared and the form is in a clean state

**Roles:** End User
**Priority:** Must-have

#### AC-11: Clear removes search results

**Given** I have submitted a search and see results in the list
**When** I click "Limpar filtros"
**Then** the results list is cleared and shows the initial empty state (no "Nenhuma revendedora encontrada" message)

**Roles:** End User
**Priority:** Must-have

#### AC-12: Clear resets map to placeholder

**Given** I have submitted a search and see the map with markers
**When** I click "Limpar filtros"
**Then** the map resets to the placeholder message "O mapa aparecerá aqui após a busca"

**Roles:** End User
**Priority:** Must-have

#### AC-13: Clear clears error state

**Given** I have encountered an API error during search
**When** I click "Limpar filtros"
**Then** the error banner is removed and the error state is cleared

**Roles:** End User
**Priority:** Must-have

#### AC-14: Clear button disabled during loading

**Given** I have submitted a search and the form is in loading state
**When** I try to click "Limpar filtros"
**Then** the button is disabled and cannot be clicked

**Roles:** End User
**Priority:** Should-have

#### AC-15: Clearing CEP does NOT clear street/neighborhood

**Given** I have entered a CEP that auto-filled street and neighborhood
**When** I clear the CEP field manually
**Then** the street and neighborhood fields retain their values

**Roles:** End User
**Priority:** Must-have

#### AC-16: Clear shows confirmation toast

**Given** I have filled some fields
**When** I click "Limpar filtros"
**Then** I see a toast notification "Filtros limpos" for 2 seconds

**Roles:** End User
**Priority:** Nice-to-have

#### AC-17: Geolocation button removed

**Given** I am on the search form
**When** the page loads
**Then** I do NOT see a "Usar minha localização" button

**Roles:** End User
**Priority:** Must-have

#### AC-18: Latitude/longitude fields removed from schema

**Given** I am a developer reviewing the form schema
**When** I inspect `searchFormSchema`
**Then** there are NO `latitude` or `longitude` fields

**Roles:** Developer
**Priority:** Must-have

#### AC-19: Backend accepts search without coordinates

**Given** I am calling the search API
**When** I send a request with only zipCode or address (no latitude/longitude)
**Then** the API returns results successfully

**Roles:** End User
**Priority:** Must-have

#### AC-20: Clear button keyboard accessible

**Given** I am using keyboard navigation
**When** I tab to the "Limpar filtros" button
**Then** I can press Enter or Space to activate it

**Roles:** End User
**Priority:** Should-have

#### AC-21: Clear button screen reader accessible

**Given** I am using a screen reader
**When** the "Limpar filtros" button is focused
**Then** the screen reader announces "Limpar filtros, botão"

**Roles:** End User
**Priority:** Should-have

#### AC-22: Clear button responsive on mobile

**Given** I am on a mobile device (< 768px)
**When** I see the "Limpar filtros" button
**Then** it is full-width and touch-friendly (min 48px height)

**Roles:** End User
**Priority:** Must-have

#### AC-23: Clear button responsive on web

**Given** I am on a web browser (>= 768px)
**When** I see the "Limpar filtros" button
**Then** it is styled consistently with the design system

**Roles:** End User
**Priority:** Must-have

#### AC-24: CEP auto-fill only when street/neighborhood empty

**Given** I have manually entered a street name
**When** I enter a valid CEP
**Then** the street field retains my manual entry (CEP auto-fill does NOT overwrite it)

**Roles:** End User
**Priority:** Must-have

#### AC-25: Clear button visible after successful search with results

**Given** I have submitted a search and found 5 resellers
**When** I look at the form
**Then** the "Limpar filtros" button is visible

**Roles:** End User
**Priority:** Must-have

#### AC-26: Clear button visible after search with no results

**Given** I have submitted a search and found 0 resellers
**When** I look at the form
**Then** the "Limpar filtros" button is visible

**Roles:** End User
**Priority:** Must-have

#### AC-27: Clear button visible after search with error

**Given** I have submitted a search and got an API error
**When** I look at the form
**Then** the "Limpar filtros" button is visible

**Roles:** End User
**Priority:** Must-have

#### AC-28: Clear after partial form (only CEP)

**Given** I have only entered a CEP (no other fields)
**When** I click "Limpar filtros"
**Then** the CEP field is cleared and the button disappears

**Roles:** End User
**Priority:** Must-have

#### AC-29: Clear after partial form (only street)

**Given** I have only entered a street name (no other fields)
**When** I click "Limpar filtros"
**Then** the street field is cleared and the button disappears

**Roles:** End User
**Priority:** Must-have

#### AC-30: Clear after partial form (only radius changed)

**Given** I have only changed the radius slider (all other fields empty)
**When** I click "Limpar filtros"
**Then** the radius resets to 20km and the button disappears

**Roles:** End User
**Priority:** Must-have

---

## 5. Tasks to Add to the Plan

### Tasks to Address Gaps

#### Gap: Geolocation Removal - Frontend
**Add to Phase 1:**

1. **Remove geolocation imports from SearchForm** (`apps/app/components/search-form/SearchForm.tsx`):
   - Remove `import { useGeolocation } from "@/hooks/useGeolocation";`
   - Remove `import { reverseGeocode } from "@/services/api";`

2. **Remove geolocation state and effects from SearchForm** (`apps/app/components/search-form/SearchForm.tsx`):
   - Remove `geoLocation`, `geoError`, `geoLoading`, `requestLocation` destructuring from `useGeolocation()`
   - Remove `useEffect` that handles `geoError` toast
   - Remove `useEffect` that handles `geoLocation` reverse geocoding
   - Remove `handleUseMyLocation` function

3. **Remove "Usar minha localização" button from SearchForm** (`apps/app/components/search-form/SearchForm.tsx`):
   - Remove the `<Pressable>` block with `handleUseMyLocation` (lines 143-156)

4. **Remove latitude/longitude from form watch** (`apps/app/components/search-form/SearchForm.tsx`):
   - Remove `const latitude = watch("latitude");`
   - Remove `const longitude = watch("longitude");`

5. **Remove latitude/longitude from form submission** (`apps/app/components/search-form/SearchForm.tsx`):
   - Remove `latitude` and `longitude` from `searchInput` construction in `onFormSubmit`

6. **Remove latitude/longitude from form schema** (`apps/app/components/search-form/schema.ts`):
   - Remove `latitude: z.number().min(-90).max(90).optional()`
   - Remove `longitude: z.number().min(-180).max(180).optional()`
   - Remove `superRefine` validation for coordinates (lines 60-69)
   - Update `superRefine` to only check zipCode and address fields

7. **Remove `reverseGeocode` from API service** (`apps/app/services/api.ts`):
   - Remove `reverseGeocode` function (lines 195-214)
   - Remove from `api` export object

8. **Remove latitude/longitude from shared SearchInputSchema** (`packages/shared/src/schemas/search.schema.ts`):
   - Remove `latitude: z.coerce.number().min(-90).max(90).optional()`
   - Remove `longitude: z.coerce.number().min(-180).max(180).optional()`
   - Update `superRefine` to only check zipCode and address fields

9. **Remove latitude/longitude from backend DTO** (`apps/api/src/modules/resellers/dto/search-resellers.dto.ts`):
   - Remove `latitude` and `longitude` fields

10. **Update backend resolveOrigin** (`apps/api/src/modules/resellers/resellers.service.ts`):
    - Remove the coordinates branch from `resolveOrigin()` (lines 99-106)
    - Keep zipCode and address branches only

11. **Consider removing geo module** (`apps/api/src/modules/geo/`):
    - Keep `GeoService` (haversine) as it's used by `ResellersService`
    - Remove `GeocodingService` if not used elsewhere
    - Or keep entire module for potential future use

#### Gap: Clear Filters Button - Frontend
**Add to Phase 2:**

12. **Add `handleClearFilters` callback to IndexScreen** (`apps/app/app/index.tsx`):
    - Create `handleClearFilters` function that resets: `searchResults` to `[]`, `origin` to `null`, `error` to `null`, `hasSearched` to `false`
    - Pass `onClearFilters` prop to `SearchForm`

13. **Add `onClearFilters` prop to SearchForm** (`apps/app/components/search-form/SearchForm.tsx`):
    - Add `onClearFilters?: () => void` to `SearchFormProps`
    - Call `onClearFilters()` when clear button is clicked

14. **Add form reset logic to SearchForm** (`apps/app/components/search-form/SearchForm.tsx`):
    - Import `reset` from `useForm`
    - Create `handleClearFilters` function that calls `reset()` to reset all form fields
    - Reset `radiusValue` state to 20
    - Reset `cepData` state to null (via `useCepLookup` - may need to clear zipCode first)

15. **Add "Limpar filtros" button to SearchForm** (`apps/app/components/search-form/SearchForm.tsx`):
    - Add `<Pressable>` button with text "Limpar filtros"
    - Position below the submit button
    - Style with `bg-surface-container-high` and `text-on-surface`

16. **Implement button visibility logic** (`apps/app/components/search-form/SearchForm.tsx`):
    - Add `const hasActiveFilters = Boolean(zipCode || street || neighborhood || watch("number") || radiusValue !== 20)`
    - Conditionally render clear button only when `hasActiveFilters` is true

17. **Disable clear button during loading** (`apps/app/components/search-form/SearchForm.tsx`):
    - Add `disabled={isSubmitting}` to the clear button Pressable
    - Style disabled state with `bg-surface-container-high` and `text-outline`

18. **Add accessibility to clear button** (`apps/app/components/search-form/SearchForm.tsx`):
    - Add `accessibilityLabel="Limpar filtros"`
    - Add `accessibilityRole="button"`

19. **Add confirmation toast on clear** (`apps/app/components/search-form/SearchForm.tsx`):
    - After clearing, call `showToast("success", "Filtros limpos")`

20. **Update Slider component to accept reset prop** (`apps/app/components/ui/Slider.tsx`):
    - Add `resetKey?: number` prop
    - Use `useEffect` to sync `localValue` when `resetKey` changes
    - Or: Add `value` prop as controlled mode (currently uncontrolled with internal state)

21. **Sync radiusValue in SearchForm** (`apps/app/components/search-form/SearchForm.tsx`):
    - When clearing, set `radiusValue` to 20
    - Ensure `setValue("radiusKm", 20)` is called to sync with form

#### Gap: Independent Field Clearing
**Add to Phase 2:**

22. **Verify CEP auto-fill independence** (`apps/app/components/search-form/SearchForm.tsx`):
    - Current logic: `if (cepData && !street && !neighborhood)` - this is CORRECT
    - No code change needed, but add test to verify

23. **Add test for CEP clearing independence** (new test file):
    - Test: When street is filled, clearing CEP does NOT clear street
    - Test: When neighborhood is filled, clearing CEP does NOT clear neighborhood

#### Gap: Backend Validation Update
**Add to Phase 1:**

24. **Update backend validation** (`apps/api/src/modules/resellers/resellers.service.ts`):
    - Remove coordinates check from `resolveOrigin()`
    - Ensure `BadRequestException` is thrown when neither zipCode nor address is provided

25. **Update backend tests** (`apps/api/src/modules/resellers/resellers.service.spec.ts`):
    - Remove tests for coordinates-based search
    - Add tests for zipCode-only search
    - Add tests for address-only search
    - Add tests for error when no criteria provided

#### Gap: Shared Schema Update
**Add to Phase 1:**

26. **Update shared SearchInputSchema** (`packages/shared/src/schemas/search.schema.ts`):
    - Remove latitude/longitude fields
    - Update `superRefine` validation
    - Update `SearchParams` type in `packages/shared/src/types/reseller.ts`

27. **Update shared type definitions** (`packages/shared/src/types/reseller.ts`):
    - Remove `latitude` and `longitude` from `SearchParams` interface
    - Keep `latitude` and `longitude` in `Reseller` interface (they're the reseller's location, not search criteria)

---

## Summary

### Critical Tasks (Must Complete)
- Remove geolocation from frontend (tasks 1-7)
- Remove geolocation from shared schema (task 8)
- Remove geolocation from backend (tasks 9-10)
- Add clear filters button with visibility logic (tasks 12-18)
- Implement form/results/map reset (tasks 19-21)
- Update backend validation (tasks 24-25)
- Update shared types (tasks 26-27)

### Should-Have Tasks
- Clear button disabled during loading (task 17)
- Clear button accessibility (task 18)
- Confirmation toast (task 19)
- Slider reset sync (tasks 20-21)

### Nice-to-Have Tasks
- Clear button animation
- Undo clear functionality
- Analytics tracking
