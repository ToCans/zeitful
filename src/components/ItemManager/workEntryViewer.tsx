// Component Imports
import WorkEntryTile from "./workEntryTile";
// Icon Imports
import { PiSortAscending, PiSortDescending } from "react-icons/pi";
import { IconContext } from "react-icons";
// React Imports
import { useMemo, useState } from "react";
// Store Imports
import { useSettingsStore } from "../../stores/useSettingsStore";
import { useDataStore } from "../../stores/useDataStore";
// Utils Imports
import { sortWorkEntriesByCompletionTime } from "../../utils/items";

// Component Definition
const WorkEntryViewer = () => {
  const darkMode = useSettingsStore((state) => state.appSettings.darkMode);
  const workEntries = useDataStore((state) => state.workEntries);
  const workTasks = useDataStore((state) => state.workTasks);
  const workTopics = useDataStore((state) => state.workTopics);

  const [sortMethod, setSortMethod] = useState<"dsc" | "asc">("dsc");

  const sortedWorkEntries = useMemo(() => {
    return sortWorkEntriesByCompletionTime(workEntries, sortMethod);
  }, [workEntries, sortMethod]);

  const getIconClassName = (isActive: boolean) =>
    `${
      darkMode
        ? "fill-gray-200 hover:fill-gray-400"
        : "fill-black hover:fill-gray-600"
    } ${isActive ? "opacity-100" : "opacity-50"} size-4 custom-target-icon cursor-pointer`;

  return (
    <div className="flex flex-col w-full h-full space-y-2">
      <div className="flex flex-row h-6 space-x-2 justify-between py-1">
        <h2 className="font-semibold">Work Entries</h2>
        {sortedWorkEntries?.length !== 0 ? (
          <div className="flex flex-row items-center space-x-1">
            <IconContext.Provider
              value={{
                className: getIconClassName(sortMethod === "asc"),
              }}
            >
              <PiSortAscending onClick={() => setSortMethod("asc")} />
            </IconContext.Provider>
            <IconContext.Provider
              value={{
                className: getIconClassName(sortMethod === "dsc"),
              }}
            >
              <PiSortDescending onClick={() => setSortMethod("dsc")} />
            </IconContext.Provider>
          </div>
        ) : null}
      </div>

      <div className="flex flex-col flex-1 min-h-0 overflow-y-auto">
        {sortedWorkEntries?.length !== 0 ? (
          sortedWorkEntries.map((workEntry) => (
            <WorkEntryTile
              key={workEntry.id}
              workEntry={workEntry}
              workTasks={workTasks}
              workTopics={workTopics}
            />
          ))
        ) : (
          <div className="flex w-full h-full min-h-0 items-center justify-center">
            <p className="text-sm p-2">No Work Entries available.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkEntryViewer;
