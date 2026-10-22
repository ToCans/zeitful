// Component Imports
import DataHandlerTile from "./dataHandlerTile";
import ItemNavigationBar from "./itemNavigationBar";
import TaskAdder from "../../../components/ItemManager/taskAdder";
import TaskViewer from "../../../components/ItemManager/taskViewer";
import TopicAdder from "../../../components/ItemManager/topicAdder";
import TopicViewer from "../../../components/ItemManager/topicViewer";
import CloudDatabaseTile from "./cloudDatabaseTile";
import WorkEntryViewer from "../../../components/ItemManager/workEntryViewer";
// React Imports
import { useEffect, useState } from "react";
// Store Imports
import { useSettingsStore } from "../../../stores/useSettingsStore";

// Component Definition
const UserPage = () => {
  const darkMode = useSettingsStore((state) => state.appSettings.darkMode);
  const useCloudDatabase = useSettingsStore(
    (state) => state.appSettings.useCloudDatabase,
  );
  const tabSettings = useSettingsStore((state) => state.tabSettings);

  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [itemAddedSuccess, setItemAddedSuccess] = useState<boolean>(false);

  // Trigger the slide-in animation on component mount
  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsMounted(true);
    }, 10);

    return () => {
      clearTimeout(timeout);
      setIsMounted(false);
    };
  }, []);

  const currentTab = tabSettings.lastUsedUserPageTab;
  const showAdder = currentTab !== "Entries";

  return (
    <div
      className={`${
        darkMode ? "bg-zinc-700" : "bg-white"
      } gap-1 flex flex-col relative p-4 flex-1 short-laptop:h-75per md:max-h-[60vh] md:h-[60vh] max-h-[80vh] h-[80vh] xl:w-1/2 md:w-2/3 w-11/12 rounded-lg overflow-hidden shadow-[2px_2px_2px_rgba(0,0,0,0.3)] transform transition-transform duration-700 ease-out ${
        isMounted ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
      }`}
    >
      <div className="flex flex-col w-full h-auto">
        <p className="w-full text-2xl">{currentTab} Management</p>
        <div className="flex flex-row justify-between">
          <ItemNavigationBar itemManagement={currentTab} />
          <DataHandlerTile />
        </div>
        {useCloudDatabase && <CloudDatabaseTile />}
      </div>

      {showAdder && (
        <div className="flex w-full h-auto">
          {currentTab === "Task" && (
            <TaskAdder setItemAddedSuccess={setItemAddedSuccess} />
          )}
          {currentTab === "Topic" && (
            <TopicAdder setItemAddedSuccess={setItemAddedSuccess} />
          )}
        </div>
      )}

      <div className="flex w-full flex-1 min-h-0">
        {currentTab === "Task" && (
          <TaskViewer itemAddedSuccess={itemAddedSuccess} />
        )}
        {currentTab === "Topic" && (
          <TopicViewer itemAddedSuccess={itemAddedSuccess} />
        )}
        {currentTab === "Entries" && <WorkEntryViewer />}
      </div>
    </div>
  );
};

export default UserPage;
