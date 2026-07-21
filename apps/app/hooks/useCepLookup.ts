import { useEffect, useState } from "react";
import { lookupCep } from "@/services/api";
import type { CepResponse } from "@localizador/shared";

/**
 * Hook para buscar informações de CEP com debounce.
 *
 * @param zipCode - CEP para buscar (pode ter formatação ou não)
 * @param delay - Delay em ms para debounce (default: 500ms)
 * @returns Objeto com data, error, isLoading
 */
export function useCepLookup(zipCode: string | undefined, delay = 500) {
  const [data, setData] = useState<CepResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Limpar estado anterior
    setData(null);
    setError(null);

    // Não buscar se CEP estiver vazio ou incompleto
    if (!zipCode || zipCode.trim().length === 0) {
      return;
    }

    // Validar formato (8 dígitos)
    const digits = zipCode.replace(/\D/g, "");
    if (digits.length !== 8) {
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsLoading(true);
      try {
        const result = await lookupCep(zipCode);
        setData(result);
        setError(null);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Erro ao buscar CEP";
        setError(message);
        setData(null);
      } finally {
        setIsLoading(false);
      }
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [zipCode, delay]);

  return { data, error, isLoading };
}

export default useCepLookup;
