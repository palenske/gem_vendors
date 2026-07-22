import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
} from "react-native";
import { searchFormSchema, type SearchFormData } from "./schema";
import { useCepLookup } from "@/hooks/useCepLookup";
import type { SearchInput } from "@localizador/shared";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Slider } from "@/components/ui/Slider";

export interface SearchFormProps {
  onSubmit: (data: SearchInput) => void;
  onClear?: () => void;
  isSubmitting?: boolean;
}

/**
 * Formulário de busca de revendedoras.
 *
 * Design system: Pro-Locate Unified System
 */
export function SearchForm({
  onSubmit,
  onClear,
  isSubmitting = false,
}: SearchFormProps) {
  const [radiusValue, setRadiusValue] = useState(20);
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<SearchFormData>({
    resolver: zodResolver(searchFormSchema),
    defaultValues: {
      zipCode: "",
      street: "",
      number: "",
      neighborhood: "",
      radiusKm: 20,
    },
  });

  const zipCode = watch("zipCode");
  const street = watch("street");
  const neighborhood = watch("neighborhood");
  const number = watch("number");
  const hasFilters = Boolean(zipCode || street || neighborhood || number);

  const {
    data: cepData,
    error: cepError,
    isLoading: cepLoading,
  } = useCepLookup(zipCode);

  useEffect(() => {
    if (cepData && !street && !neighborhood) {
      setValue("street", cepData.logradouro || "");
      setValue("neighborhood", cepData.bairro || "");
    }
  }, [cepData, street, neighborhood, setValue]);

  const onFormSubmit = (data: SearchFormData) => {
    const searchInput: SearchInput = {
      zipCode: data.zipCode || undefined,
      street: data.street || undefined,
      number: data.number || undefined,
      neighborhood: data.neighborhood || undefined,
      radiusKm: data.radiusKm ?? radiusValue,
    };
    onSubmit(searchInput);
  };

  const handleClear = () => {
    reset();
    setRadiusValue(20);
    onClear?.();
  };

  const inputClasses = (hasError: boolean) =>
    `w-full px-3 py-3 bg-surface-container-lowest border rounded-md text-on-surface placeholder-outline ${
      hasError
        ? "border-error"
        : "border-outline-variant focus:border-primary"
    }`;

  return (
    <ErrorBoundary>
      <View className="p-4">
        {/* Section header */}
        <View className="mb-4">
          <Text className="text-body-md text-on-surface-variant mt-1">
            Informe o endereço para encontrar revendedoras próximas
          </Text>
        </View>

        <ScrollView className="max-h-full">
          {/* CEP */}
          <View className="mb-3">
            <Text className="ds-label mb-1">CEP</Text>
            <TextInput
              className={inputClasses(!!errors.zipCode)}
              placeholder="00000-000"
              value={zipCode}
              onChangeText={(text) => setValue("zipCode", text)}
              keyboardType="number-pad"
              maxLength={9}
            />
            {errors.zipCode && (
              <Text className="text-error text-caption mt-1">
                {errors.zipCode.message}
              </Text>
            )}
            {cepError && (
              <Text className="text-error text-caption mt-1">{cepError}</Text>
            )}
            {cepLoading && (
              <Text className="text-outline text-caption mt-1">
                Buscando CEP...
              </Text>
            )}
          </View>

          {/* Rua */}
          <View className="mb-3">
            <Text className="ds-label mb-1">Rua</Text>
            <TextInput
              className={inputClasses(!!errors.street)}
              placeholder="Nome da rua"
              value={street}
              onChangeText={(text) => setValue("street", text)}
            />
            {errors.street && (
              <Text className="text-error text-caption mt-1">
                {errors.street.message}
              </Text>
            )}
          </View>

          {/* Número */}
          <View className="mb-3">
            <Text className="ds-label mb-1">Número</Text>
            <TextInput
              className={inputClasses(!!errors.number)}
              placeholder="123"
              value={watch("number")}
              onChangeText={(text) => setValue("number", text)}
              keyboardType="number-pad"
            />
            {errors.number && (
              <Text className="text-error text-caption mt-1">
                {errors.number.message}
              </Text>
            )}
          </View>

          {/* Bairro */}
          <View className="mb-3">
            <Text className="ds-label mb-1">Bairro</Text>
            <TextInput
              className={inputClasses(!!errors.neighborhood)}
              placeholder="Nome do bairro"
              value={neighborhood}
              onChangeText={(text) => setValue("neighborhood", text)}
            />
            {errors.neighborhood && (
              <Text className="text-error text-caption mt-1">
                {errors.neighborhood.message}
              </Text>
            )}
          </View>

          {/* Raio - Slider */}
          <Slider
            value={radiusValue}
            onValueChange={(val) => {
              setRadiusValue(val);
              setValue("radiusKm", val);
            }}
            minimumValue={1}
            maximumValue={100}
            step={1}
            label="Raio de busca"
            unit="km"
          />
        </ScrollView>

        {/* Submit button */}
        <Pressable
          onPress={handleSubmit(onFormSubmit)}
          disabled={isSubmitting}
          className={`w-full py-3 px-4 rounded-md ${
            isSubmitting
              ? "bg-surface-container-high"
              : "bg-primary active:bg-primary-container"
          }`}
        >
          <Text className={`font-semibold text-center ${isSubmitting ? "text-outline" : "text-on-primary"}`}>
            {isSubmitting ? "Buscando..." : "Buscar Revendedoras"}
          </Text>
        </Pressable>

        {/* Clear filters button */}
        {hasFilters && (
          <Pressable
            onPress={handleClear}
            disabled={isSubmitting}
            className="w-full mt-2 py-3 px-4 rounded-md border border-outline-variant bg-transparent active:bg-surface-container-high"
            style={{ minHeight: 48 }}
          >
            <Text className="font-semibold text-center text-on-surface">
              Limpar filtros
            </Text>
          </Pressable>
        )}

        {/* Global form error */}
        {errors.zipCode?.message?.includes("ao menos um critério") && (
          <Text className="text-error text-caption mt-2 text-center">
            {errors.zipCode.message}
          </Text>
        )}
      </View>
    </ErrorBoundary>
  );
}

export { ErrorBoundary };

export default SearchForm;
