import { z } from "zod";

/**
 * Schema Zod para o formulário de busca de revendedoras.
 *
 * Validação:
 * - CEP: formato brasileiro (8 dígitos ou 5+3 com hífen)
 * - Todos os campos são opcionais individualmente
 * - Ao menos um critério de busca deve ser informado (CEP OU endereço)
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
      .number()
      .min(1, "Raio deve ser pelo menos 1 km")
      .max(100, "Raio máximo é 100 km")
      .optional(),
  })
  .superRefine((data, ctx) => {
    const hasZipCode = Boolean(data.zipCode && data.zipCode.trim().length > 0);
    const hasAddress =
      Boolean(data.street && data.street.trim().length > 0) ||
      Boolean(data.neighborhood && data.neighborhood.trim().length > 0);

    if (!hasZipCode && !hasAddress) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "Informe ao menos um critério de busca: CEP ou endereço (rua ou bairro)",
        path: ["zipCode"],
      });
    }
  });

export type SearchFormData = z.infer<typeof searchFormSchema>;
