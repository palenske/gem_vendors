import type { ReactNode } from "react";
import { View } from "react-native";

export interface ResponsiveShellProps {
  /** Conteúdo do mapa. Ocupa 60% da largura em telas >= md (768px). */
  map: ReactNode;
  /** Conteúdo da barra lateral (formulário de busca, lista de resultados). Ocupa 40% da largura em telas >= md. */
  sidebar: ReactNode;
  /** Conteúdo opcional no topo, largura total (ex.: alertas, mensagens de erro globais). */
  bannerSlot?: ReactNode;
}

/**
 * Layout raiz mobile-first do Localizador de Revendedoras.
 *
 * - `< 768px` (abaixo de `md`): empilhado verticalmente — bannerSlot, sidebar, map.
 * - `>= 768px` (`md` e acima): split view horizontal — map (60%) à esquerda, sidebar (40%) à direita.
 *
 * Nota: `apps/app/app.json` define `"orientation": "portrait"`, então em
 * phones a largura raramente atinge 768px e o split view efetivamente só
 * aparece em tablets em paisagem ou na versão web. Ver Open Question #2 do
 * brainstorm de T6 — decisão de destravar a orientação adiada para T9.
 */
export function ResponsiveShell({ map, sidebar, bannerSlot }: ResponsiveShellProps) {
  return (
    <View className="flex-1 bg-white dark:bg-black">
      {bannerSlot ? <View className="w-full">{bannerSlot}</View> : null}

      <View className="flex-1 flex-col md:flex-row">
        <View className="flex-1 md:w-3/5">{map}</View>
        <View className="flex-1 md:w-2/5">{sidebar}</View>
      </View>
    </View>
  );
}

export default ResponsiveShell;
