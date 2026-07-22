import { View, Text, Pressable } from "react-native";
import { useState } from "react";

export interface SliderProps {
  value: number;
  onValueChange: (value: number) => void;
  minimumValue?: number;
  maximumValue?: number;
  step?: number;
  label?: string;
  unit?: string;
}

/**
 * Native slider using step buttons (fallback for platforms without native slider).
 */
export function Slider({
  value,
  onValueChange,
  minimumValue = 1,
  maximumValue = 100,
  step = 1,
  label = "Raio de busca",
  unit = "km",
}: SliderProps) {
  const [localValue, setLocalValue] = useState(value);

  const decrease = () => {
    const newVal = Math.max(minimumValue, localValue - step);
    setLocalValue(newVal);
    onValueChange(newVal);
  };

  const increase = () => {
    const newVal = Math.min(maximumValue, localValue + step);
    setLocalValue(newVal);
    onValueChange(newVal);
  };

  return (
    <View className="mb-4">
      <View className="flex-row justify-between items-center mb-2">
        <Text className="ds-label">{label}</Text>
        <Text className="text-label-md text-primary">{localValue} {unit}</Text>
      </View>
      
      <View className="flex-row items-center gap-3">
        <Pressable
          onPress={decrease}
          disabled={localValue <= minimumValue}
          className="w-10 h-10 rounded-full bg-surface-container-high items-center justify-center"
        >
          <Text className="text-on-surface text-headline-md">-</Text>
        </Pressable>
        
        <View className="flex-1 h-2 bg-surface-container-high rounded-full">
          <View
            className="h-2 bg-primary rounded-full"
            style={{ width: `${((localValue - minimumValue) / (maximumValue - minimumValue)) * 100}%` }}
          />
        </View>
        
        <Pressable
          onPress={increase}
          disabled={localValue >= maximumValue}
          className="w-10 h-10 rounded-full bg-surface-container-high items-center justify-center"
        >
          <Text className="text-on-surface text-headline-md">+</Text>
        </Pressable>
      </View>
      
      <View className="flex-row justify-between mt-1">
        <Text className="text-caption text-outline">{minimumValue} {unit}</Text>
        <Text className="text-caption text-outline">{maximumValue} {unit}</Text>
      </View>
    </View>
  );
}

export default Slider;
