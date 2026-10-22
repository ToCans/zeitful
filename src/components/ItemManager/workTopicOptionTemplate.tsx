// Component Imports
import ColorIcon from "./colorIcon";
// Store Imports
import { useSettingsStore } from "../../stores/useSettingsStore";
// Type Imports
import type { WorkTopic } from "../../types/types";
// Utils Imports
import { intToColor } from "../../utils/colors";

export const WorkTopicOptionTemplate = (workTopic: WorkTopic) => {
  const darkMode = useSettingsStore((state) => state.appSettings.darkMode);

  return (
    <div className="flex flex-row items-center justify-center focus:outline-none">
      <ColorIcon color={intToColor(workTopic.color)} />
      <p
        className={`text-center justify-center ${
          darkMode ? "text-zinc-100" : "text-black"
        }`}
      >
        {workTopic.name}
      </p>
    </div>
  );
};

export const SelectedWorkTopicOptionTemplate = (
  workTopic: WorkTopic | null,
) => {
  const darkMode = useSettingsStore((state) => state.appSettings.darkMode);

  if (workTopic) {
    return (
      <div className="flex flex-row items-center justify-center focus:outline-none">
        <ColorIcon color={intToColor(workTopic.color)} />
        <p
          className={`text-center justify-center ${
            darkMode ? "text-zinc-100" : "text-black"
          }`}
        >
          {workTopic.name}
        </p>
      </div>
    );
  }

  return <p>Select a Work Topic</p>;
};
