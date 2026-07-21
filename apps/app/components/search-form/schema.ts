import { z } from "zod";

/**
 * Schema Zod para o formulário de busca de revendedoras.
 *
 * Validação:
 * - CEP: formato brasileiro (8 dígitos ou 5+3 com hífen)
 * - Todos os campos são opcionais individualmente
 * - Ao menos um critério de busca deve ser informado (CEP OU endereço OU coordenadas)
 * - Latitude e longitude devem ser informadas juntas
 */
export const searchFormSchema = z
  .object({
    zipCode: z
      .string()
      .trim()
      .optional()
      .refine(
        (val) => {
          if (!val) return true;
          // Aceita 8 dígitos ou formato 00000-000
          const digits = val.replace(/\D/g, "");
          return digits.length === 8;
        },
        {
          message: "CEP inválido. Use o formato 00000-000 ou 8 dígitos",
        },
      ),
    street: z.string().trim().optional(),
    number: z.string().trim().optional(),
    neighborhood: z.string().trim().optional(),
    radiusKm: z
      .string()
      .trim()
      .optional()
      .refine(
        (val) => {
          if (!val) return true;
          const num = Number(val);
          return !isNaN(num) && num > 0;
        },
        {
          message: "Raio deve ser um número positivo",
        },
      ),
    // Campos ocultos para geolocalização
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),
  })
  .superRefine((data, ctx) => {
    const hasZipCode = Boolean(data.zipCode && data.zipCode.trim().length > 0);
    const hasAddress =
      Boolean(data.street && data.street.trim().length > 0) ||
      Boolean(data.neighborhood && data.neighborhood.trim().length > 0);
    const hasCoordinates =
      data.latitude !== undefined && data.longitude !== undefined;

    // Validação: ao menos um critério de busca
    if (!hasZipCode && !hasAddress && !hasCoordinates) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "Informe ao menos um critério de busca: CEP, endereço (rua ou bairro) ou use sua localização",
        path: ["zipCode"],
      });
    }

    // Validação: latitude e longitude devem vir juntas
    const hasOnlyLatitude = data.latitude !== undefined && data.longitude === undefined;
    const hasOnlyLongitude = data.latitude === undefined && data.longitude !== undefined;

    if (hasOnlyLatitude || hasOnlyLongitude) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Latitude e longitude devem ser informadas juntas",
        path: hasOnlyLatitude ? ["longitude"] : ["latitude"],
      });
    }
  });

export type SearchFormData = z.infer<typeof searchFormSchema>;
