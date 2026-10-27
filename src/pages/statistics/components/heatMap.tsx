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
import { useDataStore } from "../../../stores/useDataStore";
// Type Imports
import type {
  StatisticsTab,
  TimePeriod,
  WorkEntry,
} from "../../../types/types";
// Utils Imports
import { intToColor } from "../../../utils/colors";
import { formatMinutes } from "../../../utils/time";

interface HeatmapProps {
  itemFilter: StatisticsTab;
  timeFrame: TimePeriod;
  timeFilteredWorkEntries: WorkEntry[] | null;
}

// GitHub contribution-graph palette: index 0 = empty cell, last = densest.
const LIGHT_SCALE = ["#ebedf0", "#9be9a8", "#40c463", "#30a14e", "#216e39"];
const DARK_SCALE = ["#161b22", "#0e4428", "#006d32", "#26a641", "#39d353"];

// Quantize a value into one of the 5 palette buckets (GitHub-style).
const getHeatIndex = (value: number, maxValue: number): number => {
  if (value <= 0 || maxValue <= 0) return 0;
  return Math.min(4, Math.max(1, Math.round((value / maxValue) * 4)));
};

// GitHub highlights the current day with a blue ring. Returns the index of
// the column containing today, or null if today isn't in the shown range.
const getTodayIndex = (
  timeFrame: TimePeriod,
  workEntries: WorkEntry[],
): number | null => {
  const today = new Date();
  if (timeFrame === "Y") {
    return today.getMonth(); // columns are Jan..Dec
  }
  if (timeFrame === "M") {
    const ref = new Date(workEntries[0].completion_time);
    if (
      ref.getFullYear() === today.getFullYear() &&
      ref.getMonth() === today.getMonth()
    ) {
      return today.getDate() - 1;
    }
    return null;
  }
  // W: only when the selected week contains today
  const startOfToday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  const latest = workEntries.reduce(
    (max, e) => Math.max(max, new Date(e.completion_time).getTime()),
    0,
  );
  return latest >= startOfToday.getTime() ? (today.getDay() + 6) % 7 : null;
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

  if (!heatmapData || !timeFilteredWorkEntries) return null;
  const { columns, rows, maxValue } = heatmapData;

  const scale = darkMode ? DARK_SCALE : LIGHT_SCALE;
  const todayIndex = getTodayIndex(timeFrame, timeFilteredWorkEntries);

  // Anchor to the hovered tile itself (GitHub-style), not the cursor.
  const showTooltip = (
    value: number,
    label: string,
    column: string,
    e: ReactMouseEvent,
  ) => {
    const text =
      value === 0
        ? "No time recorded"
        : `${column} · ${formatMinutes(value)} worked`;
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltip({
      text,
      label,
      x: rect.left + rect.width / 2,
      y: rect.top,
    });
  };

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

      {/* Grid: row labels (items) + one fixed-size column per period */}
      <div
        className="grid gap-[3px]"
        style={{
          gridTemplateColumns: `minmax(5rem, 8rem) repeat(${columns.length}, 11px)`,
        }}
      >
        <div />
        {columns.map((c) => (
          <div key={c} className="text-center text-[9px] opacity-70">
            {c}
          </div>
        ))}

        {rows.map((row) => (
          <Fragment key={row.id}>
            <div
              className="flex items-center gap-1 text-xs"
              title={row.label}
            >
              <ColorIcon color={intToColor(row.color)} />
              <span className="truncate">{row.label}</span>
            </div>
            {row.values.map((v, i) => (
              <div
                key={i}
                className="size-[11px] rounded-[2px]"
                onMouseEnter={(e) => showTooltip(v, row.label, columns[i], e)}
                onMouseLeave={() => setTooltip(null)}
                style={{
                  backgroundColor: scale[getHeatIndex(v, maxValue)],
                  outline: todayIndex === i ? "1px solid #1f6feb" : undefined,
                }}
              />
            ))}
          </Fragment>
        ))}
      </div>

      {/* GitHub-style legend */}
      <div className="flex items-center justify-end gap-1.5 mt-2 text-[10px] opacity-70">
        <span>Less</span>
        {scale.map((color, i) => (
          <div
            key={i}
            className="size-[11px] rounded-[2px]"
            style={{ backgroundColor: color }}
          />
        ))}
        <span>More</span>
      </div>
    </div>
  );
};

export default Heatmap;
