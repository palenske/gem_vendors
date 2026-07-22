import {
  CepResponseSchema,
  SearchInputSchema,
  SearchResponseSchema,
  type CepResponse,
  type SearchInput,
  type SearchResponse,
} from "@localizador/shared";

/**
 * Cliente de API tipado para o backend do Localizador de Revendedoras
 * (apps/api). Rotas confirmadas no backend:
 *   - GET /api/v1/resellers/search
 *   - GET /api/v1/cep/:zipCode
 *   - GET /api/v1/health
 *
 * O formato de erro de resposta é definido por
 * apps/api/src/common/filters/http-exception.filter.ts:
 *   { statusCode: number; message: string; error: string }
 */

const DEFAULT_TIMEOUT_MS = 10_000;

/**
 * Lê e valida EXPO_PUBLIC_API_URL no carregamento do módulo. Falha alto e
 * cedo com um erro descritivo em vez de deixar cada chamada de fetch falhar
 * silenciosamente com uma URL inválida.
 */
function readApiBaseUrl(): string {
  const rawUrl = process.env.EXPO_PUBLIC_API_URL;

  if (!rawUrl || rawUrl.trim().length === 0) {
    throw new Error(
      "EXPO_PUBLIC_API_URL não está definida. Copie apps/app/.env.example " +
        "para apps/app/.env e configure a URL da API antes de iniciar o app.",
    );
  }

  return rawUrl.replace(/\/+$/, "");
}

const API_BASE_URL = readApiBaseUrl();

/** Erro lançado para qualquer falha de comunicação com a API. */
export class ApiError extends Error {
  readonly statusCode?: number;
  readonly cause?: unknown;

  constructor(message: string, options?: { statusCode?: number; cause?: unknown }) {
    super(message);
    this.name = "ApiError";
    this.statusCode = options?.statusCode;
    this.cause = options?.cause;
  }
}

interface BackendErrorPayload {
  statusCode: number;
  message: string;
  error: string;
}

function isBackendErrorPayload(value: unknown): value is BackendErrorPayload {
  return (
    typeof value === "object" &&
    value !== null &&
    "message" in value &&
    "statusCode" in value
  );
}

interface RequestOptions {
  timeoutMs?: number;
  signal?: AbortSignal;
}

/**
 * Wrapper de fetch com timeout via AbortController e tratamento de erro
 * consistente. Lança ApiError para qualquer situação anômala (timeout, rede
 * offline, status HTTP de erro, corpo de resposta que não é JSON válido).
 */
async function apiFetch<T>(path: string, options?: RequestOptions): Promise<T> {
  const controller = new AbortController();
  const timeoutMs = options?.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  // Permite que o chamador também cancele a requisição (ex.: unmount de tela).
  options?.signal?.addEventListener("abort", () => controller.abort());

  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method: "GET",
      headers: { Accept: "application/json" },
      signal: controller.signal,
    });
  } catch (error) {
    if (controller.signal.aborted) {
      throw new ApiError(
        `A requisição para ${path} excedeu o tempo limite de ${timeoutMs}ms.`,
        { cause: error },
      );
    }

    throw new ApiError(
      "Não foi possível conectar à API. Verifique sua conexão e se " +
        "EXPO_PUBLIC_API_URL aponta para um servidor acessível.",
      { cause: error },
    );
  } finally {
    clearTimeout(timeoutId);
  }

  let body: unknown;

  try {
    body = await response.json();
  } catch (error) {
    throw new ApiError("A API retornou uma resposta que não é JSON válido.", {
      statusCode: response.status,
      cause: error,
    });
  }

  if (!response.ok) {
    const message = isBackendErrorPayload(body)
      ? body.message
      : `Erro ${response.status} ao chamar ${path}.`;

    throw new ApiError(message, { statusCode: response.status });
  }

  return body as T;
}

function buildSearchQueryString(params: SearchInput): string {
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    query.set(key, String(value));
  }

  const queryString = query.toString();
  return queryString.length > 0 ? `?${queryString}` : "";
}

/**
 * Busca revendedoras próximas a uma origem (CEP, endereço ou coordenadas).
 * Valida `params` com `SearchInputSchema` antes de montar a query string —
 * lança ZodError (via .parse) se nenhum critério de busca for informado.
 */
export async function searchResellers(
  params: SearchInput,
  options?: RequestOptions,
): Promise<SearchResponse> {
  const validatedParams = SearchInputSchema.parse(params);
  const query = buildSearchQueryString(validatedParams);

  const raw = await apiFetch<unknown>(`/api/v1/resellers/search${query}`, options);

  const parsed = SearchResponseSchema.safeParse(raw);
  if (!parsed.success) {
    throw new ApiError(
      "A resposta da API não corresponde ao formato esperado de busca.",
      { cause: parsed.error },
    );
  }

  return parsed.data;
}

/** Resolve um CEP para endereço via ViaCEP (proxied pela API). */
export async function lookupCep(
  zipCode: string,
  options?: RequestOptions,
): Promise<CepResponse> {
  const sanitized = zipCode.replace(/\D/g, "");

  const raw = await apiFetch<unknown>(`/api/v1/cep/${sanitized}`, options);

  const parsed = CepResponseSchema.safeParse(raw);
  if (!parsed.success) {
    throw new ApiError(
      "A resposta da API não corresponde ao formato esperado de CEP.",
      { cause: parsed.error },
    );
  }

  return parsed.data;
}

/** Verifica se a API está no ar. */
export async function health(options?: RequestOptions): Promise<{ status: string }> {
  return apiFetch<{ status: string }>("/api/v1/health", options);
}

export const api = { searchResellers, lookupCep, health };
export default api;
