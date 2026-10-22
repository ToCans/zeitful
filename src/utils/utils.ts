// Library Imports
import {
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
} from "date-fns";

// Get Date Range for Statistics
export const getRange = (timeframe: string, period: any) => {
  const now = new Date();
  let start: Date;
  let end: Date;

  if (timeframe === "W") {
    start = startOfWeek(new Date(period), { weekStartsOn: 1 });
    end = endOfWeek(new Date(period), { weekStartsOn: 1 });
  } else if (timeframe === "M") {
    start = startOfMonth(new Date(now.getFullYear(), period));
    end = endOfMonth(new Date(now.getFullYear(), period));
  } else if (timeframe === "Y") {
    // ✅ ensure year is a number
    const year = typeof period === "string" ? parseInt(period, 10) : period;
    start = new Date(year, 0, 1);
    end = new Date(year, 11, 31);
  } else {
    start = startOfWeek(now, { weekStartsOn: 1 });
    end = endOfWeek(now, { weekStartsOn: 1 });
  }

  // ✅ return plain YYYY-MM-DD strings (no UTC conversion!)
  return {
    startDate: format(start, "yyyy-MM-dd"),
    endDate: format(end, "yyyy-MM-dd"),
  };
};
