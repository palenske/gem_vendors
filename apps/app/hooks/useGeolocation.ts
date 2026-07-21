import { useState } from "react";
import * as Location from "expo-location";
import { Platform } from "react-native";

export interface GeolocationResult {
  latitude: number;
  longitude: number;
}

export interface UseGeolocationReturn {
  location: GeolocationResult | null;
  error: string | null;
  isLoading: boolean;
  requestLocation: () => Promise<void>;
}

/**
 * Hook para obter geolocalização do dispositivo.
 *
 * No web, usa a Geolocation API nativa do navegador.
 * No native, usa expo-location.
 */
export function useGeolocation(): UseGeolocationReturn {
  const [location, setLocation] = useState<GeolocationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const requestLocation = async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (Platform.OS === "web") {
        // Usar Geolocation API do navegador no web
        if (!navigator.geolocation) {
          throw new Error("Geolocalização não suportada neste navegador");
        }

        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            resolve,
            reject,
            {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 0,
            },
          );
        });

        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        console.log("Geolocalização obtida (web):", position.coords);
      } else {
        // Usar expo-location no native
        const { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== "granted") {
          setError(
            "Permissão de localização negada. Habilite o GPS para usar sua localização.",
          );
          setIsLoading(false);
          return;
        }

        const position = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        console.log("Geolocalização obtida (native):", position.coords);
      }
      setError(null);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Não foi possível obter sua localização. Tente novamente.";
      setError(message);
      setLocation(null);
      console.error("Erro na geolocalização:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    location,
    error,
    isLoading,
    requestLocation,
  };
}

export default useGeolocation;
