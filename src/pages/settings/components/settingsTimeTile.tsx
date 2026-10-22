// Component Import
import { InputText } from "primereact/inputtext";
import { Slider } from "primereact/slider";
// Store Imports
import { useSettingsStore } from "../../../stores/useSettingsStore";
// Type Import
import type { Dispatch } from "react";

interface SettingsItemTileProps {
  label: string;
  value: number;
  setter: Dispatch<React.SetStateAction<number>>;
}

const handleMinutesChange = (
  value: string | number,
  setter: Dispatch<React.SetStateAction<number>>,
) => {
  const num = Number(value);
  if (isNaN(num)) return;
  const clamped = Math.max(1, Math.min(num, 60));
  setter(clamped * 60);
};

const SettingsTimeTile = ({ label, value, setter }: SettingsItemTileProps) => {
  const darkMode = useSettingsStore((state) => state.appSettings.darkMode);

  const minutes = Math.floor(value / 60);

  const inputStyle = {
    backgroundColor: darkMode ? "#52525B" : "#ffffff",
    color: darkMode ? "#f9fafb" : "#000000",
    borderColor: darkMode ? "#6b7280" : "#d1d5db",
  };

  return (
    <div className="flex flex-row xl:text-lg text-lg items-center justify-center w-full">
      <div className="flex flex-row items-center gap-4">
        <p className="text-center align-middle select-none">{label}</p>
        <Slider
          className="min-w-20"
          value={minutes}
          onChange={(e: any) => setter(e.value * 60)}
          min={1}
          max={60}
          step={1}
        />
        <InputText
          className={`w-12 h-10 text-center ${
            darkMode
              ? "dark-dropdown text-zinc-100"
              : "light-dropdown text-black"
          }`}
          value={String(minutes)}
          onChange={(e) => handleMinutesChange(e.target.value, setter)}
          style={inputStyle}
        />
      </div>
    </div>
  );
};

export default SettingsTimeTile;
