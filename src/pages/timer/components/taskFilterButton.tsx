// Store Imports
import { useSettingsStore } from "../../../stores/useSettingsStore";
// Type Imports
import type { Dispatch } from "react";
import type { WorkTaskStatus } from "../../../types/types";

interface FilterButtonProps {
  isActive: boolean;
  value: WorkTaskStatus;
  setWorkTaskStatus: Dispatch<React.SetStateAction<WorkTaskStatus>>;
}

const TaskFilterButton = ({
  isActive,
  value,
  setWorkTaskStatus,
}: FilterButtonProps) => {
  const darkMode = useSettingsStore((state) => state.appSettings.darkMode);
  const statusOptions = { 1: "Open", 2: "Active", 3: "Closed" };

  return (
    <button
      className={`h-6 rounded-lg border-2 ${isActive ? "opacity-100" : "opacity-50 hover:opacity-100 cursor-pointer"} ${darkMode ? "border-zinc-500 text-zinc-100" : "border-zinc-200 text-black"} px-1`}
      onClick={() => setWorkTaskStatus(value)}
    >
      <p className="text-xs font-semibold">
        {statusOptions[value as keyof typeof statusOptions]}
      </p>
    </button>
  );
};

export default TaskFilterButton;
