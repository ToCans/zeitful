// React Imports
import { useEffect, useState } from "react";
// Type Imports
import type { WorkEntry } from "../../../types/types";
// Utils Imports
import { generateDateRange } from "../utils/utils";
import { filterWorkEntriesByDateRange } from "../utils/utils";

// Interface Definition
interface UseGatherPeriodDataProps {
  selectedPeriod: any;
  timeFrame: "W" | "M" | "Y" | string;
  workEntries: WorkEntry[];
}

// Hook Defintion
const useGatherPeriodData = ({
  selectedPeriod,
  timeFrame,
  workEntries,
}: UseGatherPeriodDataProps) => {
  const [timeFilteredWorkEntries, setTimeFilteredWorkEntries] = useState<
    WorkEntry[] | null
  >(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (selectedPeriod === null) return;

    // Filtering Data based on range
    setIsLoading(true);
    const dateRange = generateDateRange(timeFrame, selectedPeriod);
    const filteredWorkEntries = filterWorkEntriesByDateRange(
      workEntries,
      dateRange,
    );

    // Setting the Corresponsing Data Entries
    setTimeFilteredWorkEntries(filteredWorkEntries);
    setIsLoading(false);
  }, [selectedPeriod, timeFrame, workEntries]);

  return { timeFilteredWorkEntries, isLoading };
};

export default useGatherPeriodData;
