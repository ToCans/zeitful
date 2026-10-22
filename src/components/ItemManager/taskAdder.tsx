// API Imports
import { addTask, getTasks } from "../../api/localDatabase";
import { addWorkTaskSupabaseDatabase } from "../../api/cloudDatabase";
// Component Imports
import {
  SelectedWorkTopicOptionTemplate,
  WorkTopicOptionTemplate,
} from "./workTopicOptionTemplate";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
// Icon Imports
import { IconContext } from "react-icons";
import { PiPlus } from "react-icons/pi";
// Library Imports
import { v4 as uuidv4 } from "uuid";
// React Imports
import { useCallback, useState } from "react";
// Store Imports
import { useSettingsStore } from "../../stores/useSettingsStore";
import { useDataStore } from "../../stores/useDataStore";
import { useCloudStore } from "../../stores/useCloudStore";
import { useRefsStore } from "../../stores/useRefsStore";
// Type Imports
import type { WorkTask, WorkTopic } from "../../types/types";

// Tasks Adder Interface
interface TaskAdderProps {
  setItemAddedSuccess: React.Dispatch<React.SetStateAction<boolean>>;
}

// Component Definition
const TaskAdder = ({ setItemAddedSuccess }: TaskAdderProps) => {
  const darkMode = useSettingsStore((state) => state.appSettings.darkMode);
  const workTopics = useDataStore((state) => state.workTopics);
  const setWorkTasks = useDataStore((state) => state.setWorkTasks);
  const cloudDatabase = useCloudStore((state) => state.cloudDatabase);
  const toast = useRefsStore((state) => state.toast);

  const [newTaskName, setNewTaskName] = useState<string>("");
  const [selectedTopic, setSelectedTopic] = useState<WorkTopic | null>(null);

  // Adding Task to Local DB
  const handleAddTask = useCallback(
    async (workTask: WorkTask) => {
      if (workTask.name !== "") {
        const taskResponse = await addTask(workTask);
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
      } else {
        toast?.show({
          severity: "error",
          summary: "Error",
          detail: "Please enter a task name.",
          life: 3000,
        });
      }
    },
    [toast, setWorkTasks],
  );

  const handleAddTaskToCloudDatabase = useCallback(
    async (workTask: WorkTask) => {
      if (workTask.name !== "" && cloudDatabase) {
        const response = await addWorkTaskSupabaseDatabase(
          cloudDatabase,
          workTask,
        );
        console.log(response.status, response.message);
        const updatedTasks = await getTasks();
        if (updatedTasks.item) {
          setWorkTasks(updatedTasks.item as WorkTask[]);
        }
      }
    },
    [cloudDatabase, setWorkTasks],
  );

  const handleAddTaskClick = async () => {
    const id = uuidv4();
    const taskData: WorkTask = {
      id,
      topic_id: selectedTopic?.id ?? null,
      name: newTaskName,
      status: 1,
      last_action: 1,
      last_action_date: new Date().toISOString(),
    };

    try {
      await handleAddTask(taskData);
    } catch (err) {
      console.error("Local add task failed", err);
    }

    if (cloudDatabase) {
      try {
        await handleAddTaskToCloudDatabase(taskData);
      } catch (err) {
        console.error("Cloud add task failed", err);
      }
    }

    // Trigger Success Notification
    setItemAddedSuccess(true);

    // Clear inputs after successful add
    setNewTaskName("");
    setSelectedTopic(null);

    // Hide it after 3 seconds
    setTimeout(() => setItemAddedSuccess(false), 3000);
  };

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
    <div className="flex flex-row items-center gap-2 w-full">
      <button className="m-2 cursor-pointer group" onClick={handleAddTaskClick}>
        <IconContext.Provider
          value={{
            className:
              "size-6 group-hover:text-zinc-400 transition-colors duration-200",
          }}
        >
          <PiPlus />
        </IconContext.Provider>
      </button>

      <InputText
        className={`w-2/5 ${
          darkMode ? "dark-dropdown text-zinc-100" : "light-dropdown text-black"
        }`}
        id="newTask"
        placeholder="Add a new task"
        value={newTaskName}
        onChange={(e) => setNewTaskName(e.target.value)}
        style={inputStyle}
      />

      <p>under</p>

      <Dropdown
        value={selectedTopic}
        onChange={(e) => setSelectedTopic(e.value)}
        placeholder="Select a Work Topic"
        options={workTopics.filter((topic) => topic.last_action !== 3)}
        optionLabel="name"
        itemTemplate={WorkTopicOptionTemplate}
        valueTemplate={SelectedWorkTopicOptionTemplate}
        className={`w-2/5 ${dropdownClassName}`}
        style={inputStyle}
        panelClassName={panelClassName}
        panelStyle={{
          backgroundColor: darkMode ? "#52525B" : "#ffffff",
        }}
      />
    </div>
  );
};

export default TaskAdder;
