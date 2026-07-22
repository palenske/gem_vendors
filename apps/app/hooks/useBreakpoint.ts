import { useWindowDimensions } from "react-native";

/**
 * Mantidos em sincronia com os `screens` de apps/app/tailwind.config.js.
 * Se um dos dois arquivos mudar, o outro deve ser atualizado junto.
 */
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1440,
} as const;

export type Breakpoint = "base" | "sm" | "md" | "lg";

export interface UseBreakpointResult {
  /** Largura atual da janela/viewport em pixels. */
  width: number;
  /** Maior breakpoint nomeado atingido pela largura atual. */
  breakpoint: Breakpoint;
  isSm: boolean;
  /** >= 768px — limiar do split view do ResponsiveShell. */
  isMd: boolean;
  isLg: boolean;
}

function resolveBreakpoint(width: number): Breakpoint {
  if (width >= BREAKPOINTS.lg) return "lg";
  if (width >= BREAKPOINTS.md) return "md";
  if (width >= BREAKPOINTS.sm) return "sm";
  return "base";
}

/**
 * Detecta o breakpoint responsivo atual via `useWindowDimensions`, o que
 * mantém o valor atualizado em rotações de tela, redimensionamento de janela
 * (web) e mudanças de split-screen — diferente de `Dimensions.get()`, que é
 * lido apenas uma vez.
 */
export function useBreakpoint(): UseBreakpointResult {
  const { width } = useWindowDimensions();

  return {
    width,
    breakpoint: resolveBreakpoint(width),
    isSm: width >= BREAKPOINTS.sm,
    isMd: width >= BREAKPOINTS.md,
    isLg: width >= BREAKPOINTS.lg,
  };
}

export default useBreakpoint;
