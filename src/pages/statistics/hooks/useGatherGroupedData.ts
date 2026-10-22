// React Imports
import { useMemo } from "react";
// Type Imports
import type { WorkEntry, WorkTask, WorkTopic } from "../../../types/types";
// Utils Imports
import {
  getTotalDurationByTaskForSelectedPeriod,
  getTotalDurationByTopicForSelectedPeriod,
  matchItemToTasks,
  matchItemToTopics,
} from "../utils/utils";

// Interface Definition
interface UseGatherGroupedDataProps {
  itemFilter: "Task" | "Topic" | string;
  workEntries: WorkEntry[] | null;
  workTasks: WorkTask[];
  workTopics: WorkTopic[];
}

// Hook Definition
const useGatherGroupedData = ({
  itemFilter,
  workEntries,
  workTasks,
  workTopics,
}: UseGatherGroupedDataProps) => {
  const groupedWorkEntries = useMemo(() => {
    if (!workEntries) return null;

    if (itemFilter === "Task") {
      const durationsByTask =
        getTotalDurationByTaskForSelectedPeriod(workEntries);
      return matchItemToTasks(durationsByTask, workTasks, workTopics);
    }

    const durationsByTopic =
      getTotalDurationByTopicForSelectedPeriod(workEntries);
    return matchItemToTopics(durationsByTopic, workTopics);
  }, [itemFilter, workEntries, workTasks, workTopics]);

  return {
    groupedWorkEntries,
    isLoading: !workEntries,
  };
};

export default useGatherGroupedData;
