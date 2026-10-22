// Type Imports
import type { TaskData, TopicData, WorkEntry } from "../../../types/types";
// Utils Imports
import {
  getTotalTimeWorked,
  getMostWorkedOn,
  getLeastWorkedOn,
  getBusiestDay,
  getCurrentStreak,
  getLongestStreak,
  getMostEffectiveTimeWindow,
} from "../utils/utils";
import { formatMinutes } from "../../../utils/time";

// Interface Defintion
interface OverallStatsProps {
  itemFilteredData: TopicData | TaskData | null;
  itemFilter: "Task" | "Topic" | string;
  periodFilteredData: WorkEntry[] | null;
  unfilteredData?: WorkEntry[] | null;
}

// Component Defintion
const OverallStats = ({
  itemFilteredData,
  itemFilter,
  periodFilteredData,
  unfilteredData,
}: OverallStatsProps) => {
  if (!itemFilteredData || !periodFilteredData || !unfilteredData) {
    return null;
  }
  return (
    <div className="flex flex-col w-full h-full space-y-3">
      <div className="flex flex-col space-y-1">
        <p className="font-semibold text-sm w-full">Overall Statistics</p>
        <hr className="border-zinc-400 opacity-75"></hr>
        <div className="flex flex-col space-y-1">
          <div className="flex flex-row items-center space-x-1 justify-between">
            <p className="text-sm text-left">Total Working Time</p>
            <p className="text-sm text-right font-semibold">
              {formatMinutes(getTotalTimeWorked(itemFilteredData))}
            </p>
          </div>
          <div className="flex flex-row items-center space-x-1 justify-between">
            <p className="text-sm text-left">Most Worked On {itemFilter}</p>
            <p className="text-sm text-right font-semibold">
              {getMostWorkedOn(itemFilteredData)?.name}
            </p>
          </div>
          <div className="flex flex-row items-center space-x-1 justify-between">
            <p className="text-sm text-left">Least Worked on {itemFilter}</p>
            <p className="text-sm text-right font-semibold">
              {getLeastWorkedOn(itemFilteredData)?.name}
            </p>
          </div>
          <div className="flex flex-row items-center space-x-1 justify-between">
            <p className="text-sm text-left">Busiest Day</p>
            <div className="flex flex-row space-x-1">
              <p className="text-sm font-semibold">
                {formatMinutes(getBusiestDay(periodFilteredData)?.totalMinutes)}
              </p>
              <p className="text-sm text-right font-semibold">on</p>
              <p className="text-sm text-right font-semibold">
                {getBusiestDay(periodFilteredData)?.date}
              </p>
            </div>
          </div>
          <div className="flex flex-row items-center space-x-1 justify-between">
            <p className="text-sm text-left">Most Effective Time Window</p>
            <p className="text-sm font-semibold">
              {getMostEffectiveTimeWindow(periodFilteredData)?.timeWindow}
            </p>
          </div>
        </div>
      </div>
      <div className="flex flex-col space-y-1">
        <p className="font-semibold text-sm w-full">All Time Statistics</p>
        <hr className="border-zinc-400 opacity-75"></hr>
        <div className="flex flex-col space-y-1">
          <div className="flex flex-row items-center space-x-1 justify-between">
            <p className="text-sm text-left">Current Streak</p>
            <p className="text-sm text-right font-semibold">
              {getCurrentStreak(unfilteredData)} Days
            </p>
          </div>
          <div className="flex flex-row items-center space-x-1 justify-between">
            <p className="text-sm text-left">Longest Streak</p>
            <p className="text-sm text-right font-semibold">
              {getLongestStreak(unfilteredData)} Days
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverallStats;
