import { View, Text } from "react-native";
import MapView, { Marker, Callout } from "react-native-maps";
import type { ResellerResult, LatLng } from "@localizador/shared";

export interface MapProps {
  origin: LatLng | null;
  results: ResellerResult[];
}

/**
 * Componente de mapa para native usando react-native-maps.
 *
 * Exibe marcadores para a origem (azul) e para cada revendedora (vermelho).
 */
export function Map({ origin, results }: MapProps) {
  if (!origin) {
    return (
      <View className="flex-1 bg-gray-200 dark:bg-gray-700 items-center justify-center">
        <Text className="text-gray-500 dark:text-gray-400">
          Aguardando localização...
        </Text>
      </View>
    );
  }

  // Calcular bounds para ajustar o zoom
  const allCoordinates = [
    { latitude: origin.latitude, longitude: origin.longitude },
    ...results.map((r) => r.location),
  ];

  // Calcular centro e delta para o zoom
  let minLat = origin.latitude;
  let maxLat = origin.latitude;
  let minLng = origin.longitude;
  let maxLng = origin.longitude;

  allCoordinates.forEach((coord) => {
    minLat = Math.min(minLat, coord.latitude);
    maxLat = Math.max(maxLat, coord.latitude);
    minLng = Math.min(minLng, coord.longitude);
    maxLng = Math.max(maxLng, coord.longitude);
  });

  const midLat = (minLat + maxLat) / 2;
  const midLng = (minLng + maxLng) / 2;
  const latDelta = Math.max(maxLat - minLat, 0.01) * 1.2; // 20% de padding
  const lngDelta = Math.max(maxLng - minLng, 0.01) * 1.2;

  return (
    <MapView
      style={{ flex: 1 }}
      initialRegion={{
        latitude: midLat,
        longitude: midLng,
        latitudeDelta: latDelta,
        longitudeDelta: lngDelta,
      }}
    >
      {/* Marcador da origem (azul) */}
      <Marker
        coordinate={{
          latitude: origin.latitude,
          longitude: origin.longitude,
        }}
        pinColor="#3B82F6"
      >
        <Callout>
          <View>
            <Text className="font-bold">Sua localização</Text>
          </View>
        </Callout>
      </Marker>

      {/* Marcadores das revendedoras (vermelho) */}
      {results.map((reseller) => (
        <Marker
          key={reseller.id}
          coordinate={{
            latitude: reseller.location.latitude,
            longitude: reseller.location.longitude,
          }}
          pinColor="#EF4444"
        >
          <Callout>
            <View>
              <Text className="font-bold">{reseller.name}</Text>
              <Text className="text-sm">{reseller.address}</Text>
              <Text className="text-sm text-blue-600">
                {reseller.distanceKm.toFixed(2)} km
              </Text>
            </View>
          </Callout>
        </Marker>
      ))}
    </MapView>
  );
}

export default Map;
