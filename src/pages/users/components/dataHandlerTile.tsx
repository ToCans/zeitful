// API Imports
import {
  getTopics,
  getWorkEntries,
  getTasks,
} from "../../../api/localDatabase";
import {
  importLocalDatabaseDataFromJson,
  downloadDataJson,
} from "../../../api/localDatabase";
// Icon Imports
import { PiUpload, PiDownloadSimple } from "react-icons/pi";
import { IconContext } from "react-icons";
// React Imports
import { useRef } from "react";
// Store Imports
import { useSettingsStore } from "../../../stores/useSettingsStore";
import { useDataStore } from "../../../stores/useDataStore";
import { useRefsStore } from "../../../stores/useRefsStore";
// Type Imports
import type { WorkEntry, WorkTask, WorkTopic } from "../../../types/types";

// Component Definition
const DataHandlerTile = () => {
  const darkMode = useSettingsStore((state) => state.appSettings.darkMode);
  const setWorkTopics = useDataStore((state) => state.setWorkTopics);
  const setWorkTasks = useDataStore((state) => state.setWorkTasks);
  const setWorkEntries = useDataStore((state) => state.setWorkEntries);
  const toast = useRefsStore((state) => state.toast);

  const dataFileInputRef = useRef<HTMLInputElement>(null);

  const handleDataImportClick = () => {
    dataFileInputRef.current?.click();
  };

  const handleDataImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const importResponse = await importLocalDatabaseDataFromJson(file);

      if (importResponse.status === "Failure") {
        toast?.show({
          severity: "error",
          summary: importResponse.status,
          detail: importResponse.message,
          life: 3000,
        });
      } else {
        // Refresh all data from database
        const [topics, tasks, entries] = await Promise.all([
          getTopics(),
          getTasks(),
          getWorkEntries(),
        ]);

        if (topics.item) setWorkTopics(topics.item as WorkTopic[]);
        if (tasks.item) setWorkTasks(tasks.item as WorkTask[]);
        if (entries.item) setWorkEntries(entries.item as WorkEntry[]);

        toast?.show({
          severity: "success",
          summary: "Success",
          detail: "Data imported successfully",
          life: 3000,
        });
      }
    } catch (err) {
      console.error(err);
      toast?.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to import data",
        life: 3000,
      });
    }
  };

  const handleDataDownloadClick = async () => {
    const downloadResponse = await downloadDataJson();

    if (downloadResponse.status === "Failure") {
      toast?.show({
        severity: "error",
        summary: downloadResponse.status,
        detail: downloadResponse.message,
        life: 3000,
      });
    } else {
      toast?.show({
        severity: "success",
        summary: "Success",
        detail: "Data downloaded successfully",
        life: 3000,
      });
    }
  };

  const iconClassName = `${
    darkMode
      ? "fill-gray-200 hover:fill-gray-400"
      : "fill-gray-600 hover:fill-gray-400"
  } size-5 custom-target-icon cursor-pointer`;

  return (
    <div className="flex gap-1">
      <input
        type="file"
        accept="application/json"
        ref={dataFileInputRef}
        onChange={handleDataImport}
        className="hidden"
      />

      <IconContext.Provider value={{ className: iconClassName }}>
        <PiUpload onClick={handleDataImportClick} />
      </IconContext.Provider>

      <IconContext.Provider value={{ className: iconClassName }}>
        <PiDownloadSimple onClick={handleDataDownloadClick} />
      </IconContext.Provider>
    </div>
  );
};

export default DataHandlerTile;
