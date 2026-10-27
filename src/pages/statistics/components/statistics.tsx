// Component Imports
import { ProgressSpinner } from "primereact/progressspinner";
import TimeFrameSelection from "./timeFrameSelect";
import { Dropdown } from "primereact/dropdown";
import DataVisualizationPanel from "./dataVisualizationPanel";
import ItemFilterButton from "./itemFilterButton";
// Hook Imports
import useGatherPeriodData from "../hooks/useGatherPeriodData";
// React Imports
import { useEffect, useState } from "react";
// Store Imports
import { useSettingsStore } from "../../../stores/useSettingsStore";
import { useDataStore } from "../../../stores/useDataStore";
// Type Imports
import type { StatisticsTab, VisualizationType } from "../../../types/types";
// Utils Imports
import { gatherMostRecentData } from "../utils/utils";

// Component Definition
const Statistics = () => {
  const darkMode = useSettingsStore((state) => state.appSettings.darkMode);
  const tabSettings = useSettingsStore((state) => state.tabSettings);
  const setTabSettings = useSettingsStore((state) => state.setTabSettings);
  const workEntries = useDataStore((state) => state.workEntries);

  const [isMounted, setIsMounted] = useState(false);
  const [periodOptions, setPeriodOptions] = useState<any[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<any>(null);

  // Falls back to the pie for users whose saved settings predate this field
  const visualization: VisualizationType =
    tabSettings.lastUsedVisualization ?? "Pie";

  // Animate on mount
  useEffect(() => {
    const timeout = setTimeout(() => setIsMounted(true), 10);
    return () => clearTimeout(timeout);
  }, []);

  // Whenever the timeframe changes, recompute periods *and* selectedPeriod together
  useEffect(() => {
    const { periodOptions, latestPeriod } = gatherMostRecentData(
      tabSettings.lastUsedPeriodTab,
    );
    setPeriodOptions(periodOptions);
    setSelectedPeriod(latestPeriod);
  }, [tabSettings.lastUsedPeriodTab]);

  // Date Ranges regenerated when selectedPeriod changes
  const { timeFilteredWorkEntries, isLoading } = useGatherPeriodData({
    selectedPeriod: selectedPeriod,
    timeFrame: tabSettings.lastUsedPeriodTab,
    workEntries: workEntries,
  });

  const getPlaceholderText = () => {
    switch (tabSettings.lastUsedPeriodTab) {
      case "W":
        return "Select week";
      case "M":
        return "Select month";
      default:
        return "Select year";
    }
  };

  const updateStatisticsTab = (tab: StatisticsTab) => {
    setTabSettings((prev) => ({
      ...prev,
      lastUsedStatisticsTab: tab,
    }));
  };

  const updateVisualization = (type: VisualizationType) => {
    setTabSettings((prev) => ({
      ...prev,
      lastUsedVisualization: type,
    }));
  };

  const dropdownStyle = {
    backgroundColor: darkMode ? "#52525B" : "#ffffff",
    borderColor: darkMode ? "#6b7280" : "#d1d5db",
  };

  const dropdownClassName = darkMode ? "dark-dropdown" : "light-dropdown";
  const panelClassName = darkMode
    ? "dark-dropdown-panel"
    : "light-dropdown-panel";
  const spinnerClassName = darkMode ? "dark-spinner" : "light-spinner";

  return (
    <div
      className={`${
        darkMode ? "bg-zinc-700" : "bg-white"
      } gap-1 flex flex-col relative p-4 short-laptop:h-75per md:max-h-[60vh] md:h-[60vh] max-h-[80vh] h-[80vh] xl:w-1/2 md:w-2/3 w-11/12 rounded-lg overflow-hidden shadow-[2px_2px_2px_rgba(0,0,0,0.3)] transform transition-transform duration-700 ease-out ${
        isMounted ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
      }`}
    >
      <div className="flex flex-col flex-1 items-center min-h-0">
        <div className="flex flex-col w-full h-30 space-y-2">
          <TimeFrameSelection timeFrame={tabSettings.lastUsedPeriodTab} />

          <Dropdown
            value={selectedPeriod}
            options={periodOptions}
            onChange={(e) => setSelectedPeriod(e.value)}
            placeholder={getPlaceholderText()}
            className={`w-full ${dropdownClassName}`}
            style={dropdownStyle}
            panelClassName={panelClassName}
            panelStyle={dropdownStyle}
          />

          <div className="flex flex-row justify-between">
            <div className="flex flex-row space-x-1">
              <ItemFilterButton
                isActive={tabSettings.lastUsedStatisticsTab === "Task"}
                name="Task"
                setItemFilter={() => updateStatisticsTab("Task")}
              />
              <ItemFilterButton
                isActive={tabSettings.lastUsedStatisticsTab === "Topic"}
                name="Topic"
                setItemFilter={() => updateStatisticsTab("Topic")}
              />
            </div>

            <div className="flex flex-row space-x-1">
              <ItemFilterButton
                isActive={visualization === "Pie"}
                name="Pie"
                setItemFilter={() => updateVisualization("Pie")}
              />
              <ItemFilterButton
                isActive={visualization === "Heatmap"}
                name="Heatmap"
                setItemFilter={() => updateVisualization("Heatmap")}
              />
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex w-full h-full min-h-0 items-center justify-center overflow-y-scroll">
            <ProgressSpinner className={spinnerClassName} />
          </div>
        ) : (
          <div className="flex w-full h-full min-h-0 items-center justify-center">
            {timeFilteredWorkEntries?.length === 0 ? (
              <p className="text-sm p-2">No data found for this period.</p>
            ) : (
              <DataVisualizationPanel
                itemFilter={tabSettings.lastUsedStatisticsTab}
                timeFrame={tabSettings.lastUsedPeriodTab}
                visualization={visualization}
                timeFilteredWorkEntries={timeFilteredWorkEntries}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Statistics;
