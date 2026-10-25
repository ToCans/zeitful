// React Imports
import { useMemo } from "react";

// Types
import type {
  HeatmapData,
  HeatmapRow,
  StatisticsTab,
  TimePeriod,
  WorkEntry,
  WorkTask,
  WorkTopic,
} from "../../../types/types";

interface UseGatherHeatmapDataProps {
  itemFilter: StatisticsTab;
  timeFrame: TimePeriod;
  workEntries: WorkEntry[] | null; // already filtered to the selected period
  workTasks: WorkTask[];
  workTopics: WorkTopic[];
}

// Default gray when no color is found (matches utils.ts)
const DEFAULT_COLOR = 8947848;

const getColorForId = (
  id: string,
  itemFilter: StatisticsTab,
  workTasks: WorkTask[],
  workTopics: WorkTopic[],
): number => {
  if (itemFilter === "Topic") {
    const topic = workTopics.find((t) => t.id === id);
    return topic?.color ?? DEFAULT_COLOR;
  }
  // Task rows take the color of their parent topic
  const task = workTasks.find((t) => t.id === id);
  const topic = task
    ? workTopics.find((t) => t.id === task.topic_id)
    : undefined;
  return topic?.color ?? DEFAULT_COLOR;
};

const WEEK_COLUMNS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const YEAR_COLUMNS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const getBucketIndex = (date: Date, timeFrame: TimePeriod): number => {
  switch (timeFrame) {
    case "W":
      return (date.getDay() + 6) % 7; // Monday-first
    case "M":
      return date.getDate() - 1;
    default:
      return date.getMonth();
  }
};

// Hook Definition
const useGatherHeatmapData = ({
  itemFilter,
  timeFrame,
  workEntries,
  workTasks,
  workTopics,
}: UseGatherHeatmapDataProps) => {
  const heatmapData = useMemo<HeatmapData | null>(() => {
    if (!workEntries) return null;

    // ----- Columns -----
    let columns: string[];
    if (timeFrame === "W") {
      columns = WEEK_COLUMNS;
    } else if (timeFrame === "M") {
      const ref = workEntries.length
        ? new Date(workEntries[0].completion_time)
        : new Date();
      const daysInMonth = new Date(
        ref.getFullYear(),
        ref.getMonth() + 1,
        0,
      ).getDate();
      columns = Array.from({ length: daysInMonth }, (_, i) => String(i + 1));
    } else {
      columns = YEAR_COLUMNS;
    }

    // ----- Fill matrix -----
    const rowsById = new Map<string, HeatmapRow>();

    for (const entry of workEntries) {
      const isTask = itemFilter === "Task";
      const id = (isTask ? entry.task_id : entry.topic_id) ?? "none";
      const label =
        (isTask ? entry.task_name : entry.topic_name) ??
        (isTask ? "No task" : "No topic");

      let row = rowsById.get(id);
      if (!row) {
        row = {
          id,
          label,
          values: new Array(columns.length).fill(0),
          total: 0,
          color: getColorForId(id, itemFilter, workTasks, workTopics),
        };
        rowsById.set(id, row);
      }

      const idx = getBucketIndex(new Date(entry.completion_time), timeFrame);
      if (idx >= 0 && idx < columns.length) {
        row.values[idx] += entry.duration;
        row.total += entry.duration;
      }
    }

    const rows = [...rowsById.values()].sort((a, b) => b.total - a.total);
    const maxValue = Math.max(0, ...rows.flatMap((r) => r.values));

    return { columns, rows, maxValue };
  }, [itemFilter, timeFrame, workEntries, workTasks, workTopics]);

  return { heatmapData, isLoading: !workEntries };
};

export default useGatherHeatmapData;
