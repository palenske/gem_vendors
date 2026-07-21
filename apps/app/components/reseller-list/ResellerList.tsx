import { View, Text, ScrollView, ActivityIndicator, Pressable } from "react-native";
import type { ResellerResult } from "@localizador/shared";
import { ResellerCard } from "./ResellerCard";

export interface ResellerListProps {
  results: ResellerResult[];
  loading: boolean;
  error: string | null;
  onRetry?: () => void;
}

/**
 * Lista de revendedoras com estados de loading, vazio e erro.
 */
export function ResellerList({
  results,
  loading,
  error,
  onRetry,
}: ResellerListProps) {
  // Estado de loading
  if (loading) {
    return (
      <View className="flex-1 items-center justify-center p-8">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="mt-4 text-gray-600 dark:text-gray-400 text-center">
          Buscando revendedoras próximas...
        </Text>
      </View>
    );
  }

  // Estado de erro
  if (error) {
    return (
      <View className="flex-1 items-center justify-center p-8">
        <Text className="text-4xl mb-3">⚠️</Text>
        <Text className="text-red-500 text-center mb-2 font-semibold">
          Erro na busca
        </Text>
        <Text className="text-gray-600 dark:text-gray-400 text-center mb-4">
          {error}
        </Text>
        {onRetry && (
          <Pressable
            onPress={onRetry}
            className="bg-blue-500 active:bg-blue-600 px-6 py-3 rounded-lg"
          >
            <Text className="text-white font-semibold">Tentar novamente</Text>
          </Pressable>
        )}
      </View>
    );
  }

  // Estado vazio
  if (results.length === 0) {
    return (
      <View className="flex-1 items-center justify-center p-8">
        <Text className="text-4xl mb-3">🔍</Text>
        <Text className="text-gray-600 dark:text-gray-400 text-center text-lg font-medium">
          Nenhuma revendedora encontrada
        </Text>
        <Text className="text-gray-500 dark:text-gray-500 text-center text-sm mt-2">
          Tente aumentar o raio de busca ou usar outro endereço
        </Text>
      </View>
    );
  }

  // Estado com resultados
  return (
    <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
      <Text className="text-sm text-gray-500 dark:text-gray-400 mb-3">
        {results.length} {results.length === 1 ? "revendedora encontrada" : "revendedoras encontradas"}
      </Text>
      {results.map((reseller) => (
        <ResellerCard key={reseller.id} reseller={reseller} />
      ))}
    </ScrollView>
  );
}

export default ResellerList;
