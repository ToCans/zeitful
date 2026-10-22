// API Imports
import { editTask, getTasks } from "../../api/localDatabase";
import { editWorkTaskSupabaseDatabase } from "../../api/cloudDatabase";
// Component Imports
import {
  WorkTopicOptionTemplate,
  SelectedWorkTopicOptionTemplate,
} from "./workTopicOptionTemplate";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
// Icon Imports
import { PiXBold, PiCheckBold } from "react-icons/pi";
import { IconContext } from "react-icons";
// React Imports
import {
  useState,
  useCallback,
  type SetStateAction,
  type Dispatch,
} from "react";
// Store Imports
import { useCloudStore } from "../../stores/useCloudStore";
import { useSettingsStore } from "../../stores/useSettingsStore";
import { useDataStore } from "../../stores/useDataStore";
import { useRefsStore } from "../../stores/useRefsStore";
// Type Imports
import type { EditedWorkTask, WorkTask } from "../../types/types";

interface EditTaskModalProps {
  setEditMode: Dispatch<SetStateAction<boolean>>;
  workTask: WorkTask;
}

const EditTaskModal = ({ setEditMode, workTask }: EditTaskModalProps) => {
  const darkMode = useSettingsStore((state) => state.appSettings.darkMode);
  const workTopics = useDataStore((state) => state.workTopics);
  const setWorkTasks = useDataStore((state) => state.setWorkTasks);
  const toast = useRefsStore((state) => state.toast);
  const { cloudDatabase } = useCloudStore();

  const [editValues, setEditValues] = useState({
    name: workTask.name,
    topic_id: workTask.topic_id,
    status: workTask.status,
    last_action: workTask.last_action,
    last_action_date: new Date().toISOString(),
  });

  const statusOptions = [
    { value: 1, label: "Open" },
    { value: 2, label: "Active" },
    { value: 3, label: "Closed" },
  ];

  const handleConfirmEdit = useCallback(
    async (taskId: string, editedWorkTask: EditedWorkTask) => {
      try {
        const taskResponse = await editTask(taskId, editedWorkTask);

        // Setting Tasks
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
        console.error("Local edit task failed", err);
      }

      if (cloudDatabase) {
        try {
          const cloudTopicResponse = await editWorkTaskSupabaseDatabase(
            cloudDatabase,
            taskId,
            editedWorkTask,
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
          console.error("Cloud edit task failed", err);
        }
      }

      setEditMode(false);
    },
    [toast, setWorkTasks, setEditMode],
  );

  const matchedTopic = workTopics.find(
    (workTopic) => workTopic.id === editValues.topic_id,
  );

  const iconClassName = `${
    darkMode
      ? "fill-gray-200 hover:fill-gray-400"
      : "fill-gray-600 hover:fill-gray-400"
  } size-6 custom-target-icon cursor-pointer`;

  const inputStyle = {
    backgroundColor: darkMode ? "#52525B" : "#ffffff",
    color: darkMode ? "#F4F4F5" : "#000000",
    borderColor: darkMode ? "#6b7280" : "#d1d5db",
  };

  const dropdownClassName = darkMode ? "dark-dropdown" : "light-dropdown";
  const panelClassName = darkMode
    ? "dark-dropdown-panel"
    : "light-dropdown-panel";

  return (
    <div className="absolute top-0 left-0 flex flex-col h-full w-full bg-black/60 z-30 p-2 justify-center items-center">
      <div
        className={`${
          darkMode ? "bg-zinc-700" : "bg-zinc-100"
        } flex lg:size-96 size-80 rounded-lg p-4 flex-col items-center`}
      >
        <div className="flex w-full justify-end space-x-1">
          <IconContext.Provider value={{ className: iconClassName }}>
            <PiXBold onClick={() => setEditMode(false)} />
          </IconContext.Provider>
          <IconContext.Provider value={{ className: iconClassName }}>
            <PiCheckBold
              onClick={() => handleConfirmEdit(workTask.id, editValues)}
            />
          </IconContext.Provider>
        </div>

        <div className="flex flex-1 items-center justify-center">
          <div className="flex flex-col items-center w-full space-y-2">
            {/* Task Name */}
            <div className="flex flex-col w-full">
              <p className="font-semibold">Task Name</p>
              <InputText
                className={`${dropdownClassName} ${
                  darkMode ? "text-zinc-100" : "text-black"
                }`}
                value={editValues.name}
                onChange={(e) =>
                  setEditValues({
                    ...editValues,
                    name: e.target.value,
                  })
                }
                style={inputStyle}
              />
            </div>

            {/* Assigned Topic */}
            <div className="flex flex-col w-full">
              <p className="font-semibold">Assigned Topic</p>
              <Dropdown
                value={matchedTopic}
                onChange={(e) =>
                  setEditValues({
                    ...editValues,
                    topic_id: e.target.value.id,
                  })
                }
                options={workTopics.filter((topic) => topic.last_action !== 3)}
                placeholder="None"
                itemTemplate={WorkTopicOptionTemplate}
                valueTemplate={SelectedWorkTopicOptionTemplate}
                className={dropdownClassName}
                style={inputStyle}
                panelClassName={panelClassName}
                panelStyle={{
                  backgroundColor: darkMode ? "#52525B" : "#ffffff",
                }}
              />
            </div>

            {/* Task Status */}
            <div className="flex flex-col w-full">
              <p className="font-semibold">Task Status</p>
              <Dropdown
                value={editValues.status}
                onChange={(e) =>
                  setEditValues({
                    ...editValues,
                    status: e.value,
                  })
                }
                options={statusOptions}
                optionLabel="label"
                className={dropdownClassName}
                style={inputStyle}
                panelClassName={panelClassName}
                panelStyle={{
                  backgroundColor: darkMode ? "#52525B" : "#ffffff",
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditTaskModal;
