// React Imports
import { Fragment } from "react";
// Hook Imports
import useGatherHeatmapData from "../hooks/useGatherHeatmapData";
// Store Imports
import { useSettingsStore } from "../../../stores/useSettingsStore";
// Type Imports
import type {
  StatisticsTab,
  TimePeriod,
  WorkEntry,
} from "../../../types/types";

interface HeatmapProps {
  itemFilter: StatisticsTab;
  timeFrame: TimePeriod;
  timeFilteredWorkEntries: WorkEntry[] | null;
}

// ASSUMPTION: duration is in seconds. Adjust if it's minutes/ms.
const formatDuration = (seconds: number) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h === 0 && m === 0) return "<1m";
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
};

const Heatmap = ({
  itemFilter,
  timeFrame,
  timeFilteredWorkEntries,
}: HeatmapProps) => {
  const darkMode = useSettingsStore((s) => s.appSettings.darkMode);

  const { heatmapData } = useGatherHeatmapData({
    itemFilter,
    timeFrame,
    workEntries: timeFilteredWorkEntries,
  });

  if (!heatmapData) return null;
  const { columns, rows, maxValue } = heatmapData;

  return (
    <div className="w-full h-full overflow-auto p-1">
      <div
        className="grid gap-1 items-center text-xs"
        style={{
          gridTemplateColumns: `minmax(5rem, 8rem) repeat(${columns.length}, minmax(1.25rem, 1fr))`,
        }}
      >
        <div />
        {columns.map((c) => (
          <div key={c} className="text-center">
            {c}
          </div>
        ))}

        {rows.map((row) => (
          <Fragment key={row.id}>
            <div className="truncate pr-2" title={row.label}>
              {row.label}
            </div>
            {row.values.map((v, i) => (
              <div
                key={i}
                className="h-6 rounded-sm"
                title={`${row.label}, ${columns[i]}: ${formatDuration(v)}`}
                style={{
                  backgroundColor:
                    v === 0
                      ? darkMode
                        ? "#3f3f46"
                        : "#f3f4f6"
                      : `rgba(59, 130, 246, ${0.2 + 0.8 * (v / maxValue)})`,
                }}
              />
            ))}
          </Fragment>
        ))}
      </div>
    </div>
  );
};

export default Heatmap;
