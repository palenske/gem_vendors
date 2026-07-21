import { useState } from "react";
import { View, Text, ScrollView, Alert, Platform } from "react-native";
import { SearchForm } from "@/components/search-form/SearchForm";
import { ResellerList } from "@/components/reseller-list/ResellerList";
import { ResponsiveShell } from "@/components/layout/ResponsiveShell";
import { searchResellers, ApiError } from "@/services/api";
import type { SearchInput, SearchResponse, ResellerResult, LatLng } from "@localizador/shared";

// Importação condicional do Map para web/native
let MapComponent: any = null;
if (Platform.OS === "web") {
  MapComponent = require("@/components/map/Map.web").default;
} else {
  MapComponent = require("@/components/map/Map.native").default;
}

/**
 * Tela principal do Localizador de Revendedoras.
 *
 * Integra ResponsiveShell, SearchForm, ResellerList e Map.
 */
export default function IndexScreen() {
  const [searchResults, setSearchResults] = useState<ResellerResult[]>([]);
  const [origin, setOrigin] = useState<LatLng | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (params: SearchInput) => {
    setLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const response: SearchResponse = await searchResellers(params);
      setSearchResults(response.results);
      setOrigin(response.origin);
      setError(null);
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : "Erro ao buscar revendedoras. Tente novamente.";
      setError(message);
      setSearchResults([]);
      setOrigin(null);
      
      Alert.alert("Erro na busca", message);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setError(null);
  };

  // Conteúdo do mapa
  const mapContent = (
    <View className="flex-1 bg-gray-200 dark:bg-gray-700">
      {!origin && !hasSearched ? (
        <View className="flex-1 items-center justify-center p-4">
          <Text className="text-4xl mb-3">🗺️</Text>
          <Text className="text-gray-600 dark:text-gray-400 text-center text-lg font-medium">
            O mapa aparecerá aqui após a busca
          </Text>
          <Text className="text-gray-500 dark:text-gray-500 text-center text-sm mt-2">
            Use o formulário ao lado para encontrar revendedoras
          </Text>
        </View>
      ) : loading ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-gray-600 dark:text-gray-400 text-lg">
            Carregando mapa...
          </Text>
        </View>
      ) : origin ? (
        <MapComponent origin={origin} results={searchResults} />
      ) : null}
    </View>
  );

  // Conteúdo da sidebar (formulário + lista)
  const sidebarContent = (
    <ScrollView className="flex-1 bg-white dark:bg-gray-900">
      {/* Header da sidebar */}
      <View className="bg-gradient-to-r from-blue-500 to-blue-600 p-4">
        <Text className="text-white text-2xl font-bold">Localizador de Revendedoras</Text>
        <Text className="text-blue-100 text-sm mt-1">
          Encontre revendedoras próximas a você
        </Text>
      </View>

      <View className="p-4">
        <SearchForm onSubmit={handleSearch} isSubmitting={loading} />
      </View>

      {hasSearched && (
        <View className="flex-1">
          <ResellerList
            results={searchResults}
            loading={loading}
            error={error}
            onRetry={handleRetry}
          />
        </View>
      )}
    </ScrollView>
  );

  // Banner de erro global (opcional)
  const bannerSlot = error ? (
    <View className="bg-red-100 dark:bg-red-900 p-3">
      <Text className="text-red-800 dark:text-red-200 text-center text-sm">
        {error}
      </Text>
    </View>
  ) : null;

  return (
    <View className="flex-1 bg-white dark:bg-black">
      <ResponsiveShell
        map={mapContent}
        sidebar={sidebarContent}
        bannerSlot={bannerSlot}
      />
    </View>
  );
}
