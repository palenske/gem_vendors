import { z } from "zod";

import { ResellerStatus } from "../types/reseller";

/**
 * Espelha `SearchResellersDto` (apps/api/src/modules/resellers/dto/search-resellers.dto.ts).
 *
 * Regra de negócio replicada de `ResellersService.resolveOrigin()`
 * (apps/api/src/modules/resellers/resellers.service.ts): a origem da busca só pode
 * ser resolvida se ao menos um destes critérios for informado, nesta ordem de
 * prioridade no backend:
 *   1. coordenadas (latitude E longitude)
 *   2. CEP (zipCode)
 *   3. endereço (street OU neighborhood)
 *
 * `q`, `status`, `radiusKm`, `page` e `limit` são filtros/paginação, não
 * critérios de origem — por isso não contam para a validação abaixo.
 */
export const SearchInputSchema = z
  .object({
    zipCode: z.string().trim().min(1).optional(),
    street: z.string().trim().min(1).optional(),
    number: z.string().trim().min(1).optional(),
    neighborhood: z.string().trim().min(1).optional(),
    latitude: z.coerce.number().min(-90).max(90).optional(),
    longitude: z.coerce.number().min(-180).max(180).optional(),
    radiusKm: z.coerce.number().positive().optional(),
    q: z.string().trim().min(1).optional(),
    status: z.nativeEnum(ResellerStatus).optional(),
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(100).optional(),
  })
  .superRefine((data, ctx) => {
    const hasCoordinates =
      data.latitude !== undefined && data.longitude !== undefined;
    const hasZipCode = Boolean(data.zipCode);
    const hasAddress = Boolean(data.street) || Boolean(data.neighborhood);

    if (!hasCoordinates && !hasZipCode && !hasAddress) {
      ctx.addIssue({
        code: "custom",
        message:
          "Informe ao menos um critério de busca: CEP, endereço (rua ou bairro) ou coordenadas (latitude e longitude)",
        path: ["zipCode"],
      });
    }

    if (
      (data.latitude !== undefined) !==
      (data.longitude !== undefined)
    ) {
      ctx.addIssue({
        code: "custom",
        message: "Latitude e longitude devem ser informadas juntas",
        path: ["longitude"],
      });
    }
  });

export type SearchInput = z.infer<typeof SearchInputSchema>;

/** Espelha `OriginDto`. */
export const OriginSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  resolvedFrom: z.string(),
});

/** Espelha `LocationDto`. */
export const LocationSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
});

/** Espelha `ResellerResultDto`. */
export const ResellerResultSchema = z.object({
  id: z.number(),
  name: z.string(),
  address: z.string(),
  zipCode: z.string(),
  status: z.nativeEnum(ResellerStatus),
  distanceKm: z.number(),
  location: LocationSchema,
  routeUrl: z.string(),
});

/** Espelha `MetaDto`. */
export const SearchMetaSchema = z.object({
  page: z.number(),
  limit: z.number(),
  total: z.number(),
});

/** Espelha `SearchResponseDto` (resposta de `GET /api/v1/resellers/search`). */
export const SearchResponseSchema = z.object({
  origin: OriginSchema,
  results: z.array(ResellerResultSchema),
  meta: SearchMetaSchema,
});

export type SearchResponse = z.infer<typeof SearchResponseSchema>;

/** Espelha `CepResponseDto` (resposta de `GET /api/v1/cep/:zipCode`). */
export const CepResponseSchema = z.object({
  cep: z.string(),
  logradouro: z.string(),
  bairro: z.string(),
  localidade: z.string(),
  uf: z.string(),
});

export type CepResponse = z.infer<typeof CepResponseSchema>;
