// Store Imports
import { useSettingsStore } from "../../../stores/useSettingsStore";
// Type Imports
import type { StatisticsTab, VisualizationType } from "../../../types/types";

interface ItemFilterButtonProps {
  isActive: boolean;
  name: StatisticsTab | VisualizationType;
  setItemFilter: () => void;
}

const ItemFilterButton = ({
  isActive,
  name,
  setItemFilter,
}: ItemFilterButtonProps) => {
  const darkMode = useSettingsStore((state) => state.appSettings.darkMode);

  return (
    <button
      className={`h-6 rounded-lg border-2 ${
        isActive ? "opacity-100" : "opacity-50 hover:opacity-100"
      } ${
        darkMode
          ? "border-zinc-500 text-zinc-100"
          : "border-zinc-200 text-black"
      } px-1 cursor-pointer`}
      onClick={setItemFilter}
    >
      <p className="text-xs font-semibold">{name}</p>
    </button>
  );
};

export default ItemFilterButton;
