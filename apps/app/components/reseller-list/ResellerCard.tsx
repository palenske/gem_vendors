import { View, Text, Pressable, Linking, Platform } from "react-native";
import type { ResellerResult } from "@localizador/shared";

export interface ResellerCardProps {
  reseller: ResellerResult;
}

/**
 * Card exibindo informações de uma revendedora.
 *
 * Mostra nome, endereço, distância e botão para ver rota no Google Maps.
 */
export function ResellerCard({ reseller }: ResellerCardProps) {
  const handleOpenRoute = () => {
    Linking.openURL(reseller.routeUrl);
  };

  const getStatusColor = () => {
    switch (reseller.status) {
      case "ATIVA":
        return "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200";
      case "INATIVA":
        return "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200";
      case "EM_PROSPECCAO":
        return "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200";
      default:
        return "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200";
    }
  };

  const getStatusLabel = () => {
    switch (reseller.status) {
      case "ATIVA":
        return "Ativa";
      case "INATIVA":
        return "Inativa";
      case "EM_PROSPECCAO":
        return "Em Prospecção";
      default:
        return reseller.status;
    }
  };

  return (
    <View className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-3 shadow-sm border border-gray-200 dark:border-gray-700">
      {/* Cabeçalho com nome e status */}
      <View className="flex-row justify-between items-start mb-2">
        <View className="flex-1">
          <Text className="text-lg font-bold text-gray-900 dark:text-white">
            {reseller.name}
          </Text>
        </View>
        <View className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor()}`}>
          <Text className="text-xs">{getStatusLabel()}</Text>
        </View>
      </View>

      {/* Endereço */}
      <Text className="text-sm text-gray-600 dark:text-gray-400 mb-2">
        {reseller.address}
      </Text>

      {/* CEP */}
      <Text className="text-sm text-gray-500 dark:text-gray-500 mb-3">
        CEP: {reseller.zipCode}
      </Text>

      {/* Distância e botão de rota */}
      <View className="flex-row justify-between items-center">
        <View className="flex-1">
          <Text className="text-sm font-semibold text-blue-600 dark:text-blue-400">
            {reseller.distanceKm.toFixed(2)} km de distância
          </Text>
        </View>
        <Pressable
          onPress={handleOpenRoute}
          className="bg-blue-500 active:bg-blue-600 px-4 py-2 rounded-lg"
        >
          <Text className="text-white font-semibold text-sm">Ver rota</Text>
        </Pressable>
      </View>
    </View>
  );
}

export default ResellerCard;
