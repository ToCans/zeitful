// Component Imports
import { Dropdown } from "primereact/dropdown";
import {
  WorkTaskOptionTemplate,
  SelectedWorkTaskOptionTemplate,
} from "../../../components/ItemManager/workTaskOptionTemplate";
// Store Imports
import { useSettingsStore } from "../../../stores/useSettingsStore";
import { useTimerStore } from "../../../stores/useTimerStore";
import { useDataStore } from "../../../stores/useDataStore";
// Type Imports
import type { DropdownChangeEvent } from "primereact/dropdown";
// Utils Imports
import { sortWorkTasks } from "../../../utils/items";

// Component Definition
const TaskFocus = () => {
  const darkMode = useSettingsStore((state) => state.appSettings.darkMode);
  const activeWorkTask = useTimerStore((state) => state.activeWorkTask);
  const setActiveWorkTask = useTimerStore((state) => state.setActiveWorkTask);
  const workEntries = useDataStore((state) => state.workEntries);
  const workTasks = useDataStore((state) => state.workTasks);

  const sortedWorkTasks = sortWorkTasks(workEntries, workTasks);

  return (
    <div className="flex rounded-lg items-center justify-center">
      <Dropdown
        value={activeWorkTask}
        onChange={(e: DropdownChangeEvent) => setActiveWorkTask(e.value)}
        options={sortedWorkTasks.filter(
          (task) => task.last_action !== 3 && task.status === 2,
        )}
        optionLabel="name"
        placeholder="Select an active Work Task"
        valueTemplate={SelectedWorkTaskOptionTemplate}
        itemTemplate={WorkTaskOptionTemplate}
        className={`w-full ${darkMode ? "dark-dropdown" : "light-dropdown"}`}
        style={{
          backgroundColor: darkMode ? "#52525B" : "#ffffff",
          borderColor: darkMode ? "#6b7280" : "#d1d5db",
        }}
        panelClassName={
          darkMode ? "dark-dropdown-panel" : "light-dropdown-panel"
        }
        panelStyle={{
          backgroundColor: darkMode ? "#52525B" : "#ffffff",
        }}
      />
    </div>
  );
};

export default TaskFocus;
