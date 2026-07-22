import { useState } from "react";
import { View, Text, Platform } from "react-native";
import { SearchForm } from "@/components/search-form/SearchForm";
import { ResellerList } from "@/components/reseller-list/ResellerList";
import { ResponsiveShell } from "@/components/layout/ResponsiveShell";
import { Header } from "@/components/layout/Header";
import { searchResellers, ApiError } from "@/services/api";
import type { SearchInput, SearchResponse, ResellerResult, LatLng } from "@localizador/shared";
import { ToastProvider, useToast } from "@/components/ui/Toast/ToastProvider";
import { SuccessBanner } from "@/components/ui/SuccessBanner";

let MapComponent: any = null;
if (Platform.OS === "web") {
  MapComponent = require("@/components/map/Map.web").default;
} else {
  MapComponent = require("@/components/map/Map.native").default;
}

/**
 * Tela principal do Localizador de Revendedoras.
 *
 * Design system: Pro-Locate Unified System
 */
function IndexScreen() {
  const { showToast } = useToast();
  const [searchResults, setSearchResults] = useState<ResellerResult[]>([]);
  const [origin, setOrigin] = useState<LatLng | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [searchParams, setSearchParams] = useState<SearchInput | null>(null);

  const handleSearch = async (params: SearchInput) => {
    setLoading(true);
    setLoadingMore(false);
    setPage(1);
    setHasMore(true);
    setSearchParams(params);
    setError(null);
    setHasSearched(true);

    try {
      const response: SearchResponse = await searchResellers(params);
      setSearchResults(response.results);
      setOrigin(response.origin);
      setError(null);
      // Se o backend paginou menos que 20, não há mais resultados
      setHasMore(response.results.length < 20);
      showToast("success", `${response.results.length} revendedora(s) encontrada(s)`);
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : "Erro ao buscar revendedoras. Tente novamente.";
      setError(message);
      setSearchResults([]);
      setOrigin(null);
      showToast("error", message);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setError(null);
  };

  const handleLoadMore = async () => {
    if (!searchParams) return;

    setLoadingMore(true);

    try {
      const nextPage = page + 1;
      const { page: _, limit: __, ...searchQuery } = searchParams;
      const response: SearchResponse = await searchResellers({
        ...searchQuery,
        page: nextPage,
        limit: 20,
      });
      setSearchResults((prev) => [...prev, ...response.results]);
      setPage(nextPage);
      setHasMore(response.results.length >= 20);
      showToast("success", `${response.results.length} revendedora(s) adicionais`);
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : "Erro ao carregar mais revendedoras.";
      showToast("error", message);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleClear = () => {
    setSearchResults([]);
    setOrigin(null);
    setError(null);
    setHasSearched(false);
  };

  const bannerSlot = error ? (
    <View className="bg-error-container py-3 px-4">
      <Text className="text-on-error-container text-body-md text-center">
        {error}
      </Text>
    </View>
  ) : null;

  const mapContent = (
    <View className="flex-1">
      {!origin && !hasSearched ? (
        <View className="flex-1 items-center justify-center p-4 bg-surface-container">
          <Text className="text-4xl mb-3">🗺️</Text>
          <Text className="text-body-md text-on-surface-variant text-center">
            O mapa aparecerá aqui após a busca
          </Text>
        </View>
      ) : loading ? (
        <View className="flex-1 items-center justify-center bg-surface-container">
          <Text className="text-body-md text-on-surface-variant">
            Carregando mapa...
          </Text>
        </View>
      ) : origin ? (
        <MapComponent origin={origin} results={searchResults} />
      ) : null}
    </View>
  );

  const sidebarContent = (
    <View>
      <SearchForm onSubmit={handleSearch} onClear={handleClear} isSubmitting={loading} />
    </View>
  );

  const listContent = hasSearched ? (
    <ResellerList
      results={searchResults}
      loading={loading || loadingMore}
      error={error}
      onRetry={handleRetry}
      onLoadMore={handleLoadMore}
      hasMore={hasMore && !searchParams?.radiusKm}
    />
  ) : null;

  return (
    <View className="flex-1 bg-background">
      <Header />
      <ResponsiveShell
        map={mapContent}
        sidebar={sidebarContent}
        listContent={listContent}
        bannerSlot={bannerSlot}
      />
    </View>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <IndexScreen />
    </ToastProvider>
  );
}
