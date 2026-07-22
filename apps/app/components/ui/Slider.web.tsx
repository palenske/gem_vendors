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
 * Web slider using native HTML input range.
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setLocalValue(val);
    onValueChange(val);
  };

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: "#444651" }}>{label}</span>
        <span style={{ fontSize: 14, fontWeight: 600, color: "#00236f" }}>{localValue} {unit}</span>
      </div>
      
      <input
        type="range"
        min={minimumValue}
        max={maximumValue}
        step={step}
        value={localValue}
        onChange={handleChange}
        style={{
          width: "100%",
          height: 6,
          appearance: "none",
          background: `linear-gradient(to right, #00236f 0%, #00236f ${((localValue - minimumValue) / (maximumValue - minimumValue)) * 100}%, #e7e8e9 ${((localValue - minimumValue) / (maximumValue - minimumValue)) * 100}%, #e7e8e9 100%)`,
          borderRadius: 3,
          outline: "none",
          cursor: "pointer",
        }}
      />
      
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
        <span style={{ fontSize: 12, color: "#757682" }}>{minimumValue} {unit}</span>
        <span style={{ fontSize: 12, color: "#757682" }}>{maximumValue} {unit}</span>
      </div>
    </div>
  );
}

export default Slider;
