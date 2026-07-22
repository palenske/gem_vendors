import { View, Text } from "react-native";

export interface HeaderProps {
  title?: string;
  subtitle?: string;
}

/**
 * Application header with branding.
 *
 * Displays the system name "Gem Vendors" with a professional navy background.
 * Uses the design system's primary color and typography.
 */
export function Header({
  title = "Gem Vendors",
  subtitle = "Localizador de Revendedoras",
}: HeaderProps) {
  return (
    <View className="bg-primary px-4 py-3 md:px-6 md:py-4">
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <Text className="text-white text-headline-lg-mobile md:text-headline-lg font-bold tracking-tight">
            {title}
          </Text>
          {subtitle && (
            <Text className="text-blue-100 text-caption mt-0.5">
              {subtitle}
            </Text>
          )}
        </View>
        <View className="flex-row items-center gap-2">
          <View className="w-2 h-2 rounded-full bg-green-400" />
          <Text className="text-blue-100 text-caption">
            Online
          </Text>
        </View>
      </View>
    </View>
  );
}

export default Header;
