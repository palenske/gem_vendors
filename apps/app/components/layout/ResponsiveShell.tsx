import type { ReactNode } from "react";
import { View, ScrollView } from "react-native";

export interface ResponsiveShellProps {
  /** Conteúdo do mapa. */
  map: ReactNode;
  /** Conteúdo da barra lateral (formulário de busca). */
  sidebar: ReactNode;
  /** Conteúdo da lista de resultados (aparece abaixo do mapa no mobile). */
  listContent?: ReactNode;
  /** Conteúdo opcional no topo, largura total (ex.: alertas). */
  bannerSlot?: ReactNode;
}

/**
 * Layout raiz mobile-first do Localizador de Revendedoras.
 *
 * - `< 768px` (mobile): empilhado verticalmente — formulário, mapa, lista.
 * - `>= 768px` (web): split view horizontal — sidebar (40%) à esquerda, mapa (60%) à direita.
 */
export function ResponsiveShell({ map, sidebar, listContent, bannerSlot }: ResponsiveShellProps) {
  return (
    <View className="flex-1 bg-background">
      {bannerSlot ? <View className="w-full">{bannerSlot}</View> : null}

      {/* Mobile: vertical stack */}
      <View className="flex-1 md:hidden">
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {sidebar}
          <View className="h-[50vh] min-h-[300px]">{map}</View>
          {listContent}
        </ScrollView>
      </View>

      {/* Web: horizontal split */}
      <View className="hidden md:flex flex-1 flex-row">
        <View className="w-2/5 max-w-[480px] bg-surface-container-lowest border-r border-outline-variant">
          <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            {sidebar}
            {listContent}
          </ScrollView>
        </View>
        <View className="flex-1 bg-surface-container">{map}</View>
      </View>
    </View>
  );
}

export default ResponsiveShell;
