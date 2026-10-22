// API Imports
import { getTasks, deleteTask } from "../../api/localDatabase";
import { deleteWorkTaskSupabaseDatabase } from "../../api/cloudDatabase";
// Component Imports
import ColorIcon from "./colorIcon";
import EditTaskModal from "./editTaskModal";
// Icon Imports
import { PiNotePencil, PiTrash } from "react-icons/pi";
import { IconContext } from "react-icons";
// React Imports
import { useState, useCallback } from "react";
// Store Imports
import { useCloudStore } from "../../stores/useCloudStore";
import { useSettingsStore } from "../../stores/useSettingsStore";
import { useDataStore } from "../../stores/useDataStore";
import { useRefsStore } from "../../stores/useRefsStore";
// Type Imports
import type { WorkTask, WorkTopic } from "../../types/types";
// Utils Imports
import { intToColor } from "../../utils/colors";

// Interface Definition
interface TaskTileProps {
  workTopics: WorkTopic[];
  workTask: WorkTask;
}

const TaskTile = ({ workTopics, workTask }: TaskTileProps) => {
  const darkMode = useSettingsStore((state) => state.appSettings.darkMode);
  const setWorkTasks = useDataStore((state) => state.setWorkTasks);
  const toast = useRefsStore((state) => state.toast);
  const { cloudDatabase } = useCloudStore();

  const [editMode, setEditMode] = useState<boolean>(false);

  const matchedTopic = workTopics.find(
    (topic) => topic.id === workTask.topic_id,
  );

  const tileColor = matchedTopic ? matchedTopic.color : 14408667;
  const topicName = matchedTopic ? matchedTopic.name : "No Topic";

  const convertStatusToText = useCallback((statusNumber: number): string => {
    const statusMap: Record<number, string> = {
      1: "Open",
      2: "Active",
      3: "Closed",
    };
    return statusMap[statusNumber] || "Unknown";
  }, []);

  const handleDelete = useCallback(async () => {
    try {
      const taskResponse = await deleteTask(
        workTask.id,
        workTask,
        new Date().toISOString(),
      );

      if (taskResponse.status === "Failure") {
        toast?.show({
          severity: "error",
          summary: taskResponse.status,
          detail: taskResponse.message,
          life: 3000,
        });
      } else {
        const updatedTasks = await getTasks();
        if (updatedTasks.item) {
          setWorkTasks(updatedTasks.item as WorkTask[]);
        }
      }
    } catch (err) {
      console.error("Local delete task failed", err);
    }

    if (cloudDatabase) {
      try {
        const cloudTopicResponse = await deleteWorkTaskSupabaseDatabase(
          cloudDatabase,
          workTask.id,
          workTask,
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
  }, [workTask, toast, setWorkTasks]);

  const iconClassName = `${
    darkMode
      ? "fill-gray-200 hover:fill-gray-400"
      : "fill-gray-600 hover:fill-gray-400"
  } size-5 custom-target-icon cursor-pointer`;

  return (
    <div className="flex flex-row space-x-2 items-center w-full p-1">
      <ColorIcon color={intToColor(tileColor)} />

      <div className="flex md:flex-row flex-col md:items-center flex-1 gap-1">
        <p className="text-sm text-nowrap w-3/6">{workTask.name}</p>
        <p className="text-sm text-nowrap w-2/6">{topicName}</p>
      </div>

      <p className="text-sm text-nowrap w-1/6">
        {convertStatusToText(workTask.status)}
      </p>

      <IconContext.Provider value={{ className: iconClassName }}>
        <PiNotePencil onClick={() => setEditMode(true)} />
        <PiTrash onClick={handleDelete} />
      </IconContext.Provider>

      {editMode && (
        <EditTaskModal setEditMode={setEditMode} workTask={workTask} />
      )}
    </div>
  );
};

export default TaskTile;
