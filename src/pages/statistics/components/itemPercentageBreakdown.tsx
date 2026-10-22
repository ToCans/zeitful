// Component Imports
import ItemPercentageTile from "./itemPercentageTile";
// Icon Imports
import { PiSortAscending, PiSortDescending } from "react-icons/pi";
import { IconContext } from "react-icons";
// React Imports
import { useEffect, useState } from "react";
// Store Imports
import { useSettingsStore } from "../../../stores/useSettingsStore";
// Type Imports
import type { TaskData, TopicData } from "../../../types/types";
// Utils Imports
import { calculateTopicPercentages } from "../utils/utils";
import { sortWorkItemsByDuration } from "../../../utils/items";

// Interface Defintion
interface ItemPercentageBreakdownProps {
  itemData: TopicData | TaskData | null;
}

// Component Defintion
const ItemPercentageBreakdown = ({
  itemData,
}: ItemPercentageBreakdownProps) => {
  const darkMode = useSettingsStore((state) => state.appSettings.darkMode);
  const [sortMethod, setSortMethod] = useState<"dsc" | "asc">("dsc");
  const [sortedWorkEntries, setSortedWorkEntries] = useState<
    TopicData | TaskData | null
  >(null);

  useEffect(() => {
    if (!itemData) return;

    const sorted = sortWorkItemsByDuration(itemData, sortMethod);
    setSortedWorkEntries(sorted);
  }, [itemData, sortMethod]);

  const topicDataWithPercentage = sortedWorkEntries
    ? calculateTopicPercentages(sortedWorkEntries)
    : null;

  return (
    <div className="flex flex-col w-full flex-1 min-h-0 overflow-y-scroll space-y-2">
      <div className="flex flex-row justify-end space-x-1">
        <IconContext.Provider
          value={{
            className: `${
              darkMode
                ? "fill-gray-200 hover:fill-gray-400"
                : "fill-black hover:fill-gray-600"
            } ${sortMethod === "asc" ? "opacity-100" : "opacity-50"} 
											size-4 custom-target-icon`,
          }}
        >
          <PiSortAscending
            onClick={() => {
              setSortMethod("asc");
            }}
          />
        </IconContext.Provider>
        <IconContext.Provider
          value={{
            className: `${
              darkMode
                ? "fill-gray-200 hover:fill-gray-400"
                : "fill-black hover:fill-gray-600"
            } ${sortMethod === "dsc" ? "opacity-100" : "opacity-50"} 
											size-4 custom-target-icon`,
          }}
        >
          <PiSortDescending
            onClick={() => {
              setSortMethod("dsc");
            }}
          />
        </IconContext.Provider>
      </div>
      <div className="w-full overflow-y-auto">
        {sortedWorkEntries?.itemIds.map((id, index) => (
          <ItemPercentageTile
            key={id}
            index={index}
            id={id}
            color={sortedWorkEntries.itemColors[index]}
            itemName={sortedWorkEntries.itemNames[index]}
            itemDuration={sortedWorkEntries.itemDurations[index]}
            topicPercentage={
              topicDataWithPercentage?.topicPercentage?.[index] ?? 0
            }
          />
        ))}
      </div>
    </div>
  );
};

export default ItemPercentageBreakdown;
