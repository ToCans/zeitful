// React Imports
import { Fragment, useState } from "react";
import { createPortal } from "react-dom";
import type { MouseEvent as ReactMouseEvent } from "react";
// Hook Imports
import useGatherHeatmapData from "../hooks/useGatherHeatmapData";
// Component Imports
import ColorIcon from "../../../components/ItemManager/colorIcon";
// Store Imports
import { useSettingsStore } from "../../../stores/useSettingsStore";
// Type Imports
import type {
  StatisticsTab,
  TimePeriod,
  WorkEntry,
} from "../../../types/types";
// Store Imports
import { useDataStore } from "../../../stores/useDataStore";
// Utils Imports
import { intToColor } from "../../../utils/colors";

interface HeatmapProps {
  itemFilter: StatisticsTab;
  timeFrame: TimePeriod;
  timeFilteredWorkEntries: WorkEntry[] | null;
}

// duration is stored in minutes.
const formatMinutes = (minutes: number) =>
  Math.max(1, Math.round(minutes));

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
  label: string;
  x: number;
  y: number;
}

const Heatmap = ({
  itemFilter,
  timeFrame,
  timeFilteredWorkEntries,
}: HeatmapProps) => {
  const darkMode = useSettingsStore((s) => s.appSettings.darkMode);
  const workTasks = useDataStore((s) => s.workTasks);
  const workTopics = useDataStore((s) => s.workTopics);

  const [tooltip, setTooltip] = useState<TooltipState | null>(null);

  const { heatmapData } = useGatherHeatmapData({
    itemFilter,
    timeFrame,
    workEntries: timeFilteredWorkEntries,
    workTasks,
    workTopics,
  });

  // Anchor to the hovered tile itself (GitHub-style), not the cursor.
  const showTooltip = (value: number, label: string, e: ReactMouseEvent) => {
    const text =
      value === 0
        ? "No time recorded"
        : `${formatMinutes(value)} minutes worked`;
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltip({
      text,
      label,
      x: rect.left + rect.width / 2,
      y: rect.top,
    });
  };

  if (!heatmapData) return null;
  const { columns, rows, maxValue } = heatmapData;

  const noDataColor = darkMode ? "#3f3f46" : "#f3f4f6";

  return (
    <div className="w-full h-full overflow-auto p-1">
      {tooltip &&
        createPortal(
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
            <div>{tooltip.label}</div>
            <div className="mt-0.5">{tooltip.text}</div>
            <div
              className="absolute left-1/2 -bottom-1 -translate-x-1/2 h-0 w-0"
              style={{
                borderLeft: "5px solid transparent",
                borderRight: "5px solid transparent",
                borderTop: `5px solid ${darkMode ? "#52525B" : "#18181b"}`,
              }}
            />
          </div>,
          document.body
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
            <div className="flex items-center pr-2" title={row.label}>
              <ColorIcon color={intToColor(row.color)} />
              <span className="truncate">{row.label}</span>
            </div>
            {row.values.map((v, i) => (
              <div
                key={i}
                className="h-6 rounded-sm"
                onMouseEnter={(e) => showTooltip(v, row.label, e)}
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
