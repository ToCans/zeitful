// Component Imports
import { Button } from "primereact/button";
// Store Imports
import { useSettingsStore } from "../../../stores/useSettingsStore";
// Type Imports
import type { TimePeriod } from "../../../types/types";

interface TimeFrameSelectionProps {
  timeFrame: "W" | "M" | "Y" | string;
}

const TimeFrameSelection = ({ timeFrame }: TimeFrameSelectionProps) => {
  const setTabSettings = useSettingsStore((state) => state.setTabSettings);

  const getTitle = () => {
    switch (timeFrame) {
      case "W":
        return "Weekly Stats";
      case "M":
        return "Monthly Stats";
      case "Y":
        return "Yearly Stats";
      default:
        return "Stats";
    }
  };

  const updatePeriodTab = (period: TimePeriod) => {
    setTabSettings((prev) => ({
      ...prev,
      lastUsedPeriodTab: period,
    }));
  };

  const getButtonClassName = (period: string) =>
    `${timeFrame === period ? "opacity-100" : "opacity-50 hover:opacity-100"} cursor-pointer`;

  const periods: Array<{ value: TimePeriod; label: string }> = [
    { value: "W", label: "W" },
    { value: "M", label: "M" },
    { value: "Y", label: "Y" },
  ];

  return (
    <div className="flex flex-row justify-between w-full">
      <p className="text-2xl font-normal">{getTitle()}</p>
      <div className="flex flex-row gap-2">
        {periods.map(({ value, label }) => (
          <Button
            key={value}
            className={getButtonClassName(value)}
            unstyled
            onClick={() => updatePeriodTab(value)}
          >
            {label}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default TimeFrameSelection;
