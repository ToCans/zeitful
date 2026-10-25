// React Imports
import { Fragment, useState } from "react";
import type { MouseEvent as ReactMouseEvent } from "react";
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
const formatMinutes = (seconds: number) =>
  Math.max(1, Math.round(seconds / 60));

// Categorical heat scale: index 0 = lowest non-zero activity,
// last = highest. Zero cells use their own neutral tile instead.
const HEAT_SCALE = [
  "#440154",
  "#482878",
  "#3e4984",
  "#2c718e",
  "#21908c",
  "#38b584",
  "#2dd4bf",
  "#a3e635",
];

const getHeatColor = (value: number, maxValue: number): string | null => {
  if (value <= 0 || maxValue <= 0) return null;
  const t = value / maxValue;
  const idx = Math.min(
    HEAT_SCALE.length - 1,
    Math.max(0, Math.round(t * (HEAT_SCALE.length - 1))),
  );
  return HEAT_SCALE[idx];
};

interface TooltipState {
  text: string;
  x: number;
  y: number;
  flip: boolean;
}

const Heatmap = ({
  itemFilter,
  timeFrame,
  timeFilteredWorkEntries,
}: HeatmapProps) => {
  const darkMode = useSettingsStore((s) => s.appSettings.darkMode);

  const [tooltip, setTooltip] = useState<TooltipState | null>(null);

  const { heatmapData } = useGatherHeatmapData({
    itemFilter,
    timeFrame,
    workEntries: timeFilteredWorkEntries,
  });

  const showTooltip = (value: number, e: ReactMouseEvent) => {
    const text =
      value === 0
        ? "No time recorded"
        : `${formatMinutes(value)} minutes worked`;
    const flip = e.clientX + 16 + 150 > window.innerWidth;
    setTooltip({ text, x: e.clientX + 16, y: e.clientY + 16, flip });
  };

  if (!heatmapData) return null;
  const { columns, rows, maxValue } = heatmapData;

  const noDataColor = darkMode ? "#3f3f46" : "#f3f4f6";

  return (
    <div className="w-full h-full overflow-auto p-1">
      {tooltip && (
        <div
          className="pointer-events-none fixed z-50 whitespace-nowrap rounded-md px-2 py-1 text-xs font-medium shadow-lg"
          style={{
            left: tooltip.x,
            top: tooltip.y,
            transform: tooltip.flip ? "translateX(-100%)" : undefined,
            backgroundColor: darkMode ? "#52525B" : "#18181b",
            color: "#fafafa",
          }}
        >
          {tooltip.text}
        </div>
      )}

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
                onMouseEnter={(e) => showTooltip(v, e)}
                onMouseMove={(e) => showTooltip(v, e)}
                onMouseLeave={() => setTooltip(null)}
                style={{
                  backgroundColor:
                    v === 0
                      ? noDataColor
                      : getHeatColor(v, maxValue) ?? noDataColor,
                }}
              />
            ))}
          </Fragment>
        ))}
      </div>

      <div className="flex items-center gap-1.5 mt-2">
        <p className="text-[10px] opacity-70">no data</p>
        <div className="w-4 h-3 rounded-sm" style={{ backgroundColor: noDataColor }} />
        <p className="text-[10px] opacity-70 ml-1">low</p>
        <div className="flex gap-px">
          {HEAT_SCALE.map((color, i) => (
            <div
              key={i}
              className="w-4 h-3 rounded-sm"
              style={{ backgroundColor: color }}
              title={`level ${i + 1}`}
            />
          ))}
        </div>
        <p className="text-[10px] opacity-70">high</p>
      </div>
    </div>
  );
};

export default Heatmap;
