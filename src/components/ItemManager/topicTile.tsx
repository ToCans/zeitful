// API Imports
import { getTopics, deleteTopic } from "../../api/localDatabase";
import { deleteWorkTopicSupabaseDatabase } from "../../api/cloudDatabase";
// Component Import
import ColorIcon from "./colorIcon";
import EditTopicModal from "./editTopicModal";
// React Imports
import { useState, useCallback } from "react";
// Icon Imports
import { IconContext } from "react-icons";
import { PiNotePencil, PiTrash } from "react-icons/pi";
// Store Imports
import { useCloudStore } from "../../stores/useCloudStore";
import { useSettingsStore } from "../../stores/useSettingsStore";
import { useDataStore } from "../../stores/useDataStore";
import { useRefsStore } from "../../stores/useRefsStore";
// Type Import
import type { WorkTopic } from "../../types/types";
// Utils Imports
import { intToColor } from "../../utils/colors";

// Interface Definition
interface TopicTileProps {
  workTopic: WorkTopic;
}

// Component Definition
const TopicTile = ({ workTopic }: TopicTileProps) => {
  const darkMode = useSettingsStore((state) => state.appSettings.darkMode);
  const setWorkTopics = useDataStore((state) => state.setWorkTopics);
  const toast = useRefsStore((state) => state.toast);
  const { cloudDatabase } = useCloudStore();

  const [editMode, setEditMode] = useState<boolean>(false);

  // Memoized handlers
  const handleDelete = useCallback(async () => {
    try {
      const topicResponse = await deleteTopic(
        workTopic.id,
        workTopic,
        new Date().toISOString(),
      );

      if (topicResponse.status === "Failure") {
        toast?.show({
          severity: "error",
          summary: topicResponse.status,
          detail: topicResponse.message,
          life: 3000,
        });
      } else {
        const updatedTopics = await getTopics();
        if (updatedTopics.item) {
          setWorkTopics(updatedTopics.item as WorkTopic[]);
        }
      }
    } catch (err) {
      console.error("Local delete topic failed", err);
    }

    if (cloudDatabase) {
      try {
        const cloudTopicResponse = await deleteWorkTopicSupabaseDatabase(
          cloudDatabase,
          workTopic.id,
          workTopic,
          new Date().toISOString(),
        );

        if (cloudTopicResponse.status === "Failure") {
          toast?.show({
            severity: "error",
            summary: cloudTopicResponse.status,
            detail: cloudTopicResponse.message,
            life: 3000,
          });
        }
      } catch (err) {
        console.error("Cloud edit topic failed", err);
      }
    }
  }, [workTopic, toast, setWorkTopics]);

  const iconClassName = `${
    darkMode
      ? "fill-gray-200 hover:fill-gray-400"
      : "fill-gray-600 hover:fill-gray-400"
  } size-5 custom-target-icon cursor-pointer`;

  return (
    <div className="flex flex-row space-x-2 items-center w-full p-1">
      <ColorIcon color={intToColor(workTopic.color)} />

      <div className="flex md:flex-row flex-col md:items-center flex-1 gap-1">
        <p className="text-sm text-nowrap w-3/6">{workTopic.name}</p>
      </div>

      <IconContext.Provider value={{ className: iconClassName }}>
        <PiNotePencil onClick={() => setEditMode(true)} />
        <PiTrash onClick={handleDelete} />
      </IconContext.Provider>

      {editMode && (
        <EditTopicModal setEditMode={setEditMode} workTopic={workTopic} />
      )}
    </div>
  );
};

export default TopicTile;
