import { View, Text, Pressable, Linking } from "react-native";
import type { ResellerResult } from "@localizador/shared";
import { getStatusConfig } from "@/utils/statusUtils";
import { formatDistance } from "@/utils/formatDistance";

export interface ResellerCardProps {
  reseller: ResellerResult;
}

/**
 * Card exibindo informações de uma revendedora.
 *
 * Design system: Pro-Locate Unified System
 */
export function ResellerCard({ reseller }: ResellerCardProps) {
  const handleOpenRoute = () => {
    Linking.openURL(reseller.routeUrl);
  };

  const statusConfig = getStatusConfig(reseller.status);

  return (
    <View className="ds-card p-4 mb-3">
      {/* Header: name + status badge */}
      <View className="flex-row justify-between items-start mb-2">
        <View className="flex-1 mr-3">
          <Text className="text-headline-md text-on-surface font-semibold">
            {reseller.name}
          </Text>
        </View>
        <View className={`px-2 py-1 rounded-full ${statusConfig.bgColor}`}>
          <Text className={`text-caption font-medium ${statusConfig.textColor}`}>
            {statusConfig.label}
          </Text>
        </View>
      </View>

      {/* Address */}
      <Text className="text-body-md text-on-surface-variant mb-1">
        {reseller.address}
      </Text>

      {/* Zip code */}
      <Text className="text-caption text-outline mb-3">
        CEP: {reseller.zipCode}
      </Text>

      {/* Distance + route button */}
      <View className="flex-row justify-between items-center">
        <Text className="text-label-md text-secondary">
          {formatDistance(reseller.distanceKm)}
        </Text>
        <Pressable
          onPress={handleOpenRoute}
          className="ds-btn-secondary py-2 px-4"
          style={{ minHeight: 12 }}
        >
          <Text className="text-primary text-caption font-semibold">Ver rota</Text>
        </Pressable>
      </View>
    </View>
  );
}

export default ResellerCard;
