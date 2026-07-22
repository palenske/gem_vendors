import { useState } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import type { ResellerResult } from "@localizador/shared";
import { ResellerCard } from "./ResellerCard";
import { SkeletonCard } from "@/components/ui/SkeletonCard";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export interface ResellerListProps {
  results: ResellerResult[];
  loading: boolean;
  error: string | null;
  onRetry?: () => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
}

/**
 * Lista de revendedoras com estados de loading, vazio e erro.
 *
 * Design system: Pro-Locate Unified System
 */
export function ResellerList({
  results,
  loading,
  error,
  onRetry,
  onLoadMore,
  hasMore = true,
}: ResellerListProps) {
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const handleLoadMore = async () => {
    if (!onLoadMore || isLoadingMore) return;

    setIsLoadingMore(true);
    await onLoadMore();
    setIsLoadingMore(false);
  };

  if (loading) {
    return (
      <View className="p-4">
        <Text className="text-label-md text-on-surface-variant mb-3">
          Buscando revendedoras...
        </Text>
        {[1, 2, 3].map((i) => (
          <SkeletonCard key={i} />
        ))}
      </View>
    );
  }

  if (error) {
    return (
      <View className="items-center justify-center p-8">
        <View className="w-12 h-12 rounded-full bg-error-container items-center justify-center mb-3">
          <Text className="text-error text-headline-md">!</Text>
        </View>
        <Text className="text-headline-md text-on-surface font-semibold mb-2">
          Erro na busca
        </Text>
        <Text className="text-body-md text-on-surface-variant text-center mb-4">
          {error}
        </Text>
        {onRetry && (
          <Pressable onPress={onRetry} className="ds-btn-primary px-6">
            <Text className="text-on-primary font-semibold">
              Tentar novamente
            </Text>
          </Pressable>
        )}
      </View>
    );
  }

  if (results.length === 0) {
    return (
      <View className="items-center justify-center p-8">
        <View className="w-12 h-12 rounded-full bg-surface-container-high items-center justify-center mb-3">
          <Text className="text-outline text-headline-md">🔍</Text>
        </View>
        <Text className="text-headline-md text-on-surface font-semibold mb-2">
          Nenhuma revendedora encontrada
        </Text>
        <Text className="text-body-md text-on-surface-variant text-center">
          Tente aumentar o raio de busca ou usar outro endereço
        </Text>
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <View className="p-4">
        <Text className="text-label-md text-on-surface-variant mb-3">
          {results.length}{" "}
          {results.length === 1
            ? "revendedora encontrada"
            : "revendedoras encontradas"}
        </Text>
        {results.map((reseller) => (
          <ResellerCard key={reseller.id} reseller={reseller} />
        ))}

        {hasMore && onLoadMore && (
          <Pressable
            onPress={handleLoadMore}
            disabled={isLoadingMore}
            className="w-full mt-4 py-3 px-4 rounded-md bg-surface-container-high active:bg-surface-container"
            style={{ minHeight: 48 }}
          >
            {isLoadingMore ? (
              <Text className="text-on-surface text-center font-semibold">
                Carregando...
              </Text>
            ) : (
              <Text className="text-primary text-center font-semibold">
                Carregar mais revendedoras
              </Text>
            )}
          </Pressable>
        )}
      </View>
    </ErrorBoundary>
  );
}

export { ErrorBoundary };

export default ResellerList;
