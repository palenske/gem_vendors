import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Alert,
} from "react-native";
import { searchFormSchema, type SearchFormData } from "./schema";
import { useCepLookup } from "@/hooks/useCepLookup";
import { useGeolocation } from "@/hooks/useGeolocation";
import { reverseGeocode } from "@/services/api";
import type { SearchInput } from "@localizador/shared";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useToast } from "@/components/ui/Toast/ToastProvider";

export interface SearchFormProps {
  onSubmit: (data: SearchInput) => void;
  isSubmitting?: boolean;
}

/**
 * Formulário de busca de revendedoras.
 *
 * Campos:
 * - CEP (com autofill via ViaCEP)
 * - Rua, Número, Bairro
 * - Raio de busca (km)
 * - Botão "Usar minha localização"
 */
export function SearchForm({
  onSubmit,
  isSubmitting = false,
}: SearchFormProps) {
  const { showToast } = useToast();
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SearchFormData>({
    resolver: zodResolver(searchFormSchema),
    defaultValues: {
      zipCode: "",
      street: "",
      number: "",
      neighborhood: "",
      radiusKm: "",
    },
  });

  const zipCode = watch("zipCode");
  const street = watch("street");
  const neighborhood = watch("neighborhood");
  const latitude = watch("latitude");
  const longitude = watch("longitude");

  // Hook para buscar CEP
  const {
    data: cepData,
    error: cepError,
    isLoading: cepLoading,
  } = useCepLookup(zipCode);

  // Hook para geolocalização
  const {
    location: geoLocation,
    error: geoError,
    isLoading: geoLoading,
    requestLocation,
  } = useGeolocation();

  // Autofill de endereço quando CEP é encontrado
  useEffect(() => {
    if (cepData && !street && !neighborhood) {
      // Só preenche se os campos estiverem vazios (não sobrescreve edição manual)
      setValue("street", cepData.logradouro || "");
      setValue("neighborhood", cepData.bairro || "");
    }
  }, [cepData, street, neighborhood, setValue]);

  // Tratar erro de geolocalização
  useEffect(() => {
    if (geoError) {
      showToast("error", geoError);
    }
  }, [geoError]);

  const handleUseMyLocation = async () => {
    await requestLocation();
  };

  // Preencher endereço quando geolocalização é obtida
  useEffect(() => {
    if (geoLocation) {
      // Always set coordinates
      setValue("latitude", geoLocation.latitude);
      setValue("longitude", geoLocation.longitude);

      // Reverse geocode to fill address fields
      const fillAddress = async () => {
        try {
          const address = await reverseGeocode(
            geoLocation.latitude,
            geoLocation.longitude,
          );
          if (address.cep) setValue("zipCode", address.cep);
          if (address.logradouro) setValue("street", address.logradouro);
          if (address.bairro) setValue("neighborhood", address.bairro);
          // number is not available from reverse geocoding — leave empty
        } catch (err) {
          // Silently fail — coordinates are still set, user can fill manually
          console.warn("Reverse geocoding failed:", err);
        }
      };

      fillAddress();
    }
  }, [geoLocation, setValue]);

  const onFormSubmit = (data: SearchFormData) => {
    // Converter para formato esperado pela API
    const searchInput: SearchInput = {
      zipCode: data.zipCode || undefined,
      street: data.street || undefined,
      number: data.number || undefined,
      neighborhood: data.neighborhood || undefined,
      radiusKm: data.radiusKm ? Number(data.radiusKm) : undefined,
      latitude: data.latitude !== undefined ? data.latitude : undefined,
      longitude: data.longitude !== undefined ? data.longitude : undefined,
    };
    onSubmit(searchInput);
  };

  return (
    <ErrorBoundary>
      <View className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <Text className="text-lg font-bold mb-4 text-gray-900 dark:text-white">
          📍 Informe sua localização
        </Text>

        {/* Botão de geolocalização */}
        <Pressable
          onPress={handleUseMyLocation}
          disabled={geoLoading}
          className={`mb-4 p-3 rounded-lg flex-row items-center justify-center ${
            geoLoading
              ? "bg-gray-300 dark:bg-gray-700"
              : "bg-blue-500 active:bg-blue-600"
          }`}
        >
          <Text className="text-white font-semibold">
            {geoLoading
              ? "Obtendo localização..."
              : "📍 Usar minha localização"}
          </Text>
        </Pressable>

        {/* Indicador de usando geolocalização */}
        {latitude && longitude && (
          <View className="mb-4 p-2 bg-green-100 dark:bg-green-900 rounded">
            <Text className="text-sm text-green-800 dark:text-green-200">
              ✓ Usando sua localização atual
            </Text>
          </View>
        )}

        <ScrollView className="max-h-full">
          {/* Campo CEP */}
          <View className="mb-3">
            <Text className="text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              CEP
            </Text>
            <TextInput
              className={`border rounded-lg p-3 text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800 ${
                errors.zipCode
                  ? "border-red-500"
                  : "border-gray-300 dark:border-gray-600"
              }`}
              placeholder="00000-000"
              value={zipCode}
              onChangeText={(text) => setValue("zipCode", text)}
              keyboardType="number-pad"
              maxLength={9}
            />
            {errors.zipCode && (
              <Text className="text-red-500 text-xs mt-1">
                {errors.zipCode.message}
              </Text>
            )}
            {cepError && (
              <Text className="text-red-500 text-xs mt-1">{cepError}</Text>
            )}
            {cepLoading && (
              <Text className="text-gray-500 text-xs mt-1">
                Buscando CEP...
              </Text>
            )}
          </View>

          {/* Campo Rua */}
          <View className="mb-3">
            <Text className="text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Rua
            </Text>
            <TextInput
              className={`border rounded-lg p-3 text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800 ${
                errors.street
                  ? "border-red-500"
                  : "border-gray-300 dark:border-gray-600"
              }`}
              placeholder="Nome da rua"
              value={street}
              onChangeText={(text) => setValue("street", text)}
            />
            {errors.street && (
              <Text className="text-red-500 text-xs mt-1">
                {errors.street.message}
              </Text>
            )}
          </View>

          {/* Campo Número */}
          <View className="mb-3">
            <Text className="text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Número
            </Text>
            <TextInput
              className={`border rounded-lg p-3 text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800 ${
                errors.number
                  ? "border-red-500"
                  : "border-gray-300 dark:border-gray-600"
              }`}
              placeholder="123"
              value={watch("number")}
              onChangeText={(text) => setValue("number", text)}
              keyboardType="number-pad"
            />
            {errors.number && (
              <Text className="text-red-500 text-xs mt-1">
                {errors.number.message}
              </Text>
            )}
          </View>

          {/* Campo Bairro */}
          <View className="mb-3">
            <Text className="text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Bairro
            </Text>
            <TextInput
              className={`border rounded-lg p-3 text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800 ${
                errors.neighborhood
                  ? "border-red-500"
                  : "border-gray-300 dark:border-gray-600"
              }`}
              placeholder="Nome do bairro"
              value={neighborhood}
              onChangeText={(text) => setValue("neighborhood", text)}
            />
            {errors.neighborhood && (
              <Text className="text-red-500 text-xs mt-1">
                {errors.neighborhood.message}
              </Text>
            )}
          </View>

          {/* Campo Raio */}
          <View className="mb-4">
            <Text className="text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Raio de busca (km) - opcional
            </Text>
            <TextInput
              className={`border rounded-lg p-3 text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800 ${
                errors.radiusKm
                  ? "border-red-500"
                  : "border-gray-300 dark:border-gray-600"
              }`}
              placeholder="Ex: 5"
              value={watch("radiusKm")}
              onChangeText={(text) => setValue("radiusKm", text)}
              keyboardType="number-pad"
            />
            {errors.radiusKm && (
              <Text className="text-red-500 text-xs mt-1">
                {errors.radiusKm.message}
              </Text>
            )}
          </View>
        </ScrollView>

        {/* Botão Submit */}
        <Pressable
          onPress={handleSubmit(onFormSubmit)}
          disabled={isSubmitting}
          className={`p-4 rounded-lg ${
            isSubmitting
              ? "bg-gray-300 dark:bg-gray-700"
              : "bg-green-500 active:bg-green-600"
          }`}
        >
          <Text className="text-white font-bold text-center">
            {isSubmitting ? "Buscando..." : "🔍 Buscar Revendedoras"}
          </Text>
        </Pressable>

        {/* Erro global do formulário */}
        {errors.zipCode?.message?.includes("ao menos um critério") && (
          <Text className="text-red-500 text-xs mt-2 text-center">
            {errors.zipCode.message}
          </Text>
        )}
      </View>
    </ErrorBoundary>
  );
}

export { ErrorBoundary };

export default SearchForm;
