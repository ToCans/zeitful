// Component Imports
import ColorIcon from "./colorIcon";
// Store Imports
import { useSettingsStore } from "../../stores/useSettingsStore";
import { useDataStore } from "../../stores/useDataStore";
// Type Imports
import type { WorkTask } from "../../types/types";
// Utils Imports
import { intToColor } from "../../utils/colors";

export const WorkTaskOptionTemplate = (workTask: WorkTask) => {
  const darkMode = useSettingsStore((state) => state.appSettings.darkMode);
  const workTopics = useDataStore((state) => state.workTopics);

  const matchedTopic = workTopics.find((t) => t.id === workTask.topic_id);
  const tileColor = matchedTopic ? matchedTopic.color : 14408667;

  return (
    <div
      className={`flex flex-row items-center justify-center focus:outline-none ${
        darkMode ? "dark-mode" : "light-mode"
      }`}
    >
      <ColorIcon color={intToColor(tileColor)} />
      <p
        className={`text-center justify-center ${
          darkMode ? "text-zinc-100" : "text-black"
        }`}
      >
        {workTask.name}
      </p>
    </div>
  );
};

export const SelectedWorkTaskOptionTemplate = (workTask: WorkTask | null) => {
  const darkMode = useSettingsStore((state) => state.appSettings.darkMode);
  const workTopics = useDataStore((state) => state.workTopics);

  if (workTask) {
    const matchedTopic = workTopics.find((t) => t.id === workTask.topic_id);
    const tileColor = matchedTopic ? matchedTopic.color : 14408667;

    return (
      <div className="flex flex-row items-center justify-center focus:outline-none">
        <ColorIcon color={intToColor(tileColor)} />
        <p
          className={`text-center justify-center ${
            darkMode ? "text-zinc-100" : "text-black"
          }`}
        >
          {workTask.name}
        </p>
      </div>
    );
  }

  return <p>Select an active Work Task</p>;
};
