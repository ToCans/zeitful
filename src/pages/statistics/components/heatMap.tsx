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

// Categorical green heat scale: index 0 = lightest (light work),
// last = darkest (lots of work). Zero cells keep the gray tile.
const HEAT_SCALE = [
  "#dcfce7",
  "#bbf7d0",
  "#86efac",
  "#4ade80",
  "#22c55e",
  "#16a34a",
  "#15803d",
  "#14532d",
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

  // Anchor to the hovered tile itself (GitHub-style), not the cursor.
  const showTooltip = (value: number, e: ReactMouseEvent) => {
    const text =
      value === 0
        ? "No time recorded"
        : `${formatMinutes(value)} minutes worked`;
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltip({ text, x: rect.left + rect.width / 2, y: rect.top });
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
            top: tooltip.y - 2,
            transform: "translate(-50%, -100%)",
            backgroundColor: darkMode ? "#52525B" : "#18181b",
            color: "#fafafa",
          }}
        >
          {tooltip.text}
          <div
            className="absolute left-1/2 -bottom-1 -translate-x-1/2 h-0 w-0"
            style={{
              borderLeft: "5px solid transparent",
              borderRight: "5px solid transparent",
              borderTop: `5px solid ${darkMode ? "#52525B" : "#18181b"}`,
            }}
          />
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
