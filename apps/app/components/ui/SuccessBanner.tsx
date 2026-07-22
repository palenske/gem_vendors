import { View, Text } from "react-native";

interface SuccessBannerProps {
  resultsCount: number;
  origin?: string;
}

/**
 * SuccessBanner component for displaying search completion feedback.
 *
 * Design system: Pro-Locate Unified System
 */
export function SuccessBanner({ resultsCount, origin }: SuccessBannerProps) {
  return (
    <View className="bg-tertiary-container py-3 px-4 mx-4 mt-4 rounded-md">
      <Text className="text-tertiary-on-container text-body-md font-semibold text-center">
        {resultsCount} {resultsCount === 1 ? "revendedora encontrada" : "revendedoras encontradas"}
        {origin && ` em ${origin}`}
      </Text>
    </View>
  );
}
