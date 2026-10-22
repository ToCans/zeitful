// Library Imports
import {
  format,
  startOfWeek,
  endOfWeek,
  addWeeks,
  startOfMonth,
  endOfMonth,
  addDays,
  startOfYear,
  endOfYear,
} from "date-fns";
// Type Imports
import type {
  PiChartData,
  WorkTask,
  WorkTopic,
  WorkEntry,
  DurationByTask,
  DurationByTopic,
  TaskData,
  TopicData,
} from "../../../types/types";
// Type Defintion
export type PeriodOption = { label: string; value: Date | number };
// Utils Imports
import { formatHourWindow } from "../../../utils/time";
import { intToColor, generateSimilarColor } from "../../../utils/colors";

// Gathers the data for the most recent month
export const gatherMostRecentData = (timeFrame: "W" | "M" | "Y" | string) => {
  const periodOptions = generatePeriodOptions(timeFrame);
  const latestPeriod = periodOptions[periodOptions.length - 1]?.value ?? null;
  return { periodOptions, latestPeriod };
};

// Generates the Period options based on the timeframe
export const generatePeriodOptions = (
  timeframe: "W" | "M" | "Y" | string,
): PeriodOption[] => {
  const now = new Date();

  switch (timeframe) {
    case "W": {
      const weeks: PeriodOption[] = [];
      const currentWeekStart = startOfWeek(now, { weekStartsOn: 1 }); // Monday
      let weekStart = currentWeekStart;

      while (weekStart.getFullYear() === now.getFullYear()) {
        const weekEnd = addDays(addWeeks(weekStart, 1), -1); // Sunday (end of the week)
        const label = `${format(weekStart, "MMM d")} – ${format(weekEnd, "MMM d")}`;

        weeks.push({ label, value: weekStart });
        weekStart = addWeeks(weekStart, -1); // Go back 1 week
      }

      return weeks.reverse(); // oldest → newest
    }

    case "M": {
      const months: PeriodOption[] = [];
      const currentMonth = now.getMonth();

      // 📆 Only include months up to the current one
      for (let i = 0; i <= currentMonth; i++) {
        const monthDate = startOfMonth(new Date(now.getFullYear(), i));
        months.push({
          label: format(monthDate, "MMMM yyyy"),
          value: i,
        });
      }

      return months;
    }

    case "Y": {
      // 📆 Generate the last 5 years (including current)
      const currentYear = now.getFullYear();
      const years: PeriodOption[] = Array.from({ length: 5 }, (_, i) => {
        const year = currentYear - (4 - i);
        return {
          label: `${year}`,
          value: year, // number
        };
      });
      return years;
    }

    default:
      return [];
  }
};

function getWeekRange(date: Date) {
  // weekStartsOn: 0 = Sunday, 1 = Monday
  const startDate = startOfWeek(date, { weekStartsOn: 1 });
  const endDate = endOfWeek(date, { weekStartsOn: 1 });
  return { startDate, endDate };
}

function getMonthRange(month: number): { startDate: Date; endDate: Date } {
  const year = new Date().getFullYear();

  // month in Date constructor is 0-based (Jan = 0)
  const firstDayOfMonth = new Date(year, month, 1);

  const startDate = startOfMonth(firstDayOfMonth);
  const endDate = endOfMonth(firstDayOfMonth);

  return { startDate, endDate };
}

function getYearRange(year: number): { startDate: Date; endDate: Date } {
  // month in Date constructor is 0-based (Jan = 0)
  const firstDayOfMonth = new Date(year, 0, 1);

  const startDate = startOfYear(firstDayOfMonth);
  const endDate = endOfYear(firstDayOfMonth);

  return { startDate, endDate };
}

// Depending on the timeframe selected, a start and end date are generated
export const generateDateRange = (
  timeFrame: "W" | "M" | "Y" | string,
  selectedPeriod: any,
) => {
  let dateRange;

  // 🎯 Determine start and end date based on timeframe & selected period
  switch (timeFrame) {
    case "W": {
      dateRange = getWeekRange(selectedPeriod);
      break;
    }
    case "M": {
      dateRange = getMonthRange(selectedPeriod);
      break;
    }
    case "Y": {
      dateRange = getYearRange(selectedPeriod);
      break;
    }
    default:
      throw new Error("Invalid timeframe");
  }

  return dateRange;
};

// Filters the work entries based on a range defined by the time frame
export const filterWorkEntriesByDateRange = (
  workEntries: WorkEntry[],
  dateRange: { startDate: Date; endDate: Date },
) => {
  const start = new Date(dateRange.startDate);
  const end = new Date(dateRange.endDate);

  return workEntries.filter((workEntry) => {
    const entryDate = new Date(workEntry.completion_time);
    return entryDate >= start && entryDate <= end;
  });
};

// Gets the total duration for each topic within a specific period
export const getTotalDurationByTopicForSelectedPeriod = (
  workEntries: WorkEntry[],
): DurationByTopic => {
  return workEntries.reduce<DurationByTopic>((acc, workEntry) => {
    const key = workEntry.topic_id ?? "no_topic_id";
    acc[key] = (acc[key] || 0) + workEntry.duration;
    return acc;
  }, {});
};

export const getTotalDurationByTaskForSelectedPeriod = (
  workEntries: WorkEntry[],
): DurationByTask => {
  return workEntries.reduce<DurationByTask>((acc, workEntry) => {
    const key = workEntry.task_id ?? "no_task_id";
    acc[key] = (acc[key] || 0) + workEntry.duration;
    return acc;
  }, {});
};

// Matches the topic durations of existing workTopics to extracted topic durations
export const matchItemToTopics = (
  durationsPerItem: DurationByTopic,
  workTopics: WorkTopic[],
): TopicData => {
  // Extract the labels and data values
  const itemIds = Object.keys(durationsPerItem);
  const itemDurations = Object.values(durationsPerItem);

  // Topic Name and Color Extraction
  let itemNames: string[] = [];
  let colors: number[] = [];
  itemIds.forEach((itemId) => {
    const matchingWorkItem = workTopics.find((item) => item.id === itemId);
    if (matchingWorkItem) {
      itemNames.push(matchingWorkItem.name);
      colors.push(matchingWorkItem.color);
    } else {
      itemNames.push("No Topic");
      colors.push(8947848); // Default color if not found
    }
  });

  // Construct Topic Data
  const topicData: TopicData = {
    itemIds: itemIds,
    itemNames: itemNames,
    itemDurations: itemDurations,
    itemColors: colors,
  };

  return topicData;
};

export const matchItemToTasks = (
  durationsPerItem: DurationByTask,
  workTasks: WorkTask[],
  workTopics: WorkTopic[],
): TaskData => {
  const itemIds = Object.keys(durationsPerItem);
  const itemDurations = Object.values(durationsPerItem);

  let itemNames: string[] = [];
  let colors: number[] = [];

  const seenColors = new Set<number>(); // to avoid duplicates

  itemIds.forEach((itemId) => {
    const matchingWorkItem = workTasks.find((task) => task.id === itemId);
    const matchingWorkTopic = workTopics.find(
      (topic) => topic.id === matchingWorkItem?.topic_id,
    );

    if (matchingWorkTopic) {
      if (!seenColors.has(matchingWorkTopic.color)) {
        colors.push(matchingWorkTopic.color);
        seenColors.add(matchingWorkTopic.color);
      } else {
        const similarColor = generateSimilarColor(matchingWorkTopic.color);
        colors.push(similarColor);
        seenColors.add(similarColor);
      }
    } else {
      colors.push(8947848); // default gray
    }

    if (matchingWorkItem) {
      itemNames.push(matchingWorkItem.name);
    } else {
      itemNames.push("No Task");
    }
  });

  const taskData: TaskData = {
    itemIds,
    itemNames,
    itemDurations,
    itemColors: colors,
  };

  return taskData;
};

export function calculateTopicPercentages(topicData: TopicData): TopicData {
  const totalDuration = topicData.itemDurations.reduce(
    (sum, dur) => sum + dur,
    0,
  );

  const topicPercentage = topicData.itemDurations.map((dur) =>
    totalDuration === 0 ? 0 : (dur / totalDuration) * 100,
  );

  return {
    ...topicData,
    topicPercentage,
  };
}

// Extracts and formats the data for the Pi Chart
export const piChartDataFormatter = (topicData: TopicData): PiChartData => {
  // Construct Chart Data
  const chartData: PiChartData = {
    labels: topicData.itemNames,
    datasets: [
      {
        data: topicData.itemDurations,
        backgroundColor: topicData.itemColors.map((colorAsInt) =>
          intToColor(colorAsInt),
        ),
      },
    ],
  };

  return chartData;
};

export function getTotalTimeWorked(data: TopicData): number {
  return data.itemDurations.reduce((sum, duration) => sum + duration, 0);
}

/**
 * Returns the item with the most time worked on
 */
export function getMostWorkedOn(data: TopicData) {
  if (data.itemDurations.length === 0) return null;

  const maxDuration = Math.max(...data.itemDurations);
  const index = data.itemDurations.indexOf(maxDuration);

  return {
    id: data.itemIds[index],
    name: data.itemNames[index],
    color: data.itemColors[index],
    duration: maxDuration,
    percentage: data.topicPercentage?.[index] ?? null,
  };
}

/**
 * Returns the item with the least time worked on
 */
export function getLeastWorkedOn(data: TopicData) {
  if (data.itemDurations.length === 0) return null;

  const minDuration = Math.min(...data.itemDurations);
  const index = data.itemDurations.indexOf(minDuration);

  return {
    id: data.itemIds[index],
    name: data.itemNames[index],
    color: data.itemColors[index],
    duration: minDuration,
    percentage: data.topicPercentage?.[index] ?? null,
  };
}

export const getMostEffectiveTimeWindow = (
  entries: WorkEntry[],
): {
  timeWindow: string;
  totalDuration: number;
} | null => {
  if (entries.length === 0) return null;

  const buckets: Record<number, number> = {};

  for (const e of entries) {
    const hour = new Date(e.completion_time).getHours();
    buckets[hour] = (buckets[hour] || 0) + e.duration;
  }

  const [hourStr, totalDuration] = Object.entries(buckets).sort(
    (a, b) => b[1] - a[1],
  )[0];

  return {
    timeWindow: formatHourWindow(Number(hourStr)),
    totalDuration,
  };
};

export const getBusiestDay = (entries: WorkEntry[]) => {
  const totals: Record<string, number> = {};

  for (const entry of entries) {
    const day = entry.completion_time.split("T")[0];
    totals[day] = (totals[day] || 0) + entry.duration;
  }

  let busiestDay = null;
  let maxDuration = 0;

  for (const [day, duration] of Object.entries(totals)) {
    if (duration > maxDuration) {
      maxDuration = duration;
      busiestDay = day;
    }
  }

  return {
    date: busiestDay, // "2024-09-09"
    totalMinutes: maxDuration,
  };
};

export const getCurrentStreak = (entries: WorkEntry[]): number => {
  // Helper: local YYYY-MM-DD for a Date
  const toLocalISODate = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${dd}`;
  };

  // Build set of local-date strings from entries
  const days = new Set(
    entries.map((e) => toLocalISODate(new Date(e.completion_time))),
  );

  let streak = 0;
  const today = new Date();
  const todayIso = toLocalISODate(today);

  // If there's no entry for today, start from yesterday (so streak can continue)
  const startDay = days.has(todayIso)
    ? today
    : new Date(today.getTime() - 24 * 60 * 60 * 1000);

  let checkDay = new Date(startDay);

  while (true) {
    const iso = toLocalISODate(checkDay);

    if (days.has(iso)) {
      streak++;
      // move back 1 day
      checkDay.setDate(checkDay.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
};

export const getLongestStreak = (entries: WorkEntry[]) => {
  // Extract unique days with activity
  const days = Array.from(
    new Set(entries.map((e) => e.completion_time.split("T")[0])),
  ).sort();

  let longest = 0;
  let current = 1; // at least one day counts

  for (let i = 1; i < days.length; i++) {
    const prev = new Date(days[i - 1]);
    const curr = new Date(days[i]);

    const diff = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);

    if (diff === 1) {
      current++;
    } else {
      longest = Math.max(longest, current);
      current = 1;
    }
  }

  longest = Math.max(longest, current);

  return longest;
};
