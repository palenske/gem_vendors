import { View } from "react-native";

/**
 * Skeleton card para loading states.
 *
 * Design system: Pro-Locate Unified System
 */
export function SkeletonCard() {
  return (
    <View className="ds-card p-4 mb-3">
      {/* Header: name + status */}
      <View className="flex-row justify-between items-start mb-2">
        <View className="flex-1">
          <View className="h-6 w-3/4 bg-surface-container-high rounded mb-2" />
          <View className="h-3 w-1/2 bg-surface-container rounded" />
        </View>
        <View className="px-2 py-1 rounded-full bg-surface-container-high">
          <View className="h-3 w-12 rounded" />
        </View>
      </View>

      {/* Address */}
      <View className="h-3 w-full bg-surface-container-high rounded mb-2" />
      <View className="h-3 w-5/6 bg-surface-container rounded mb-3" />

      {/* Zip */}
      <View className="h-3 w-1/2 bg-surface-container-high rounded mb-3" />

      {/* Distance + button */}
      <View className="flex-row justify-between items-center">
        <View className="h-3 w-20 bg-surface-container rounded" />
        <View className="h-8 w-20 bg-surface-container-high rounded" />
      </View>
    </View>
  );
}

export default SkeletonCard;
