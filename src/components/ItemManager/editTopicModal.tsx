// API Imports
import { editTopic, getTopics } from "../../api/localDatabase";
import { editWorkTopicSupabaseDatabase } from "../../api/cloudDatabase";
// Component Imports
import { ColorPicker } from "primereact/colorpicker";
import { InputText } from "primereact/inputtext";
// Icon Imports
import { PiXBold, PiCheckBold } from "react-icons/pi";
import { IconContext } from "react-icons";
// React Imports
import { useState, useCallback } from "react";
// Store Imports
import { useCloudStore } from "../../stores/useCloudStore";
import { useSettingsStore } from "../../stores/useSettingsStore";
import { useDataStore } from "../../stores/useDataStore";
import { useRefsStore } from "../../stores/useRefsStore";
// Type Imports
import type { Dispatch } from "react";
import type { EditedWorkTopic, WorkTopic } from "../../types/types";
// Utils Imports
import { colorToInt, intToColor } from "../../utils/colors";

// Interface Definition
interface EditTopicModalProps {
  setEditMode: Dispatch<React.SetStateAction<boolean>>;
  workTopic: WorkTopic;
}

// Component Definition
const EditTopicModal = ({ setEditMode, workTopic }: EditTopicModalProps) => {
  const darkMode = useSettingsStore((state) => state.appSettings.darkMode);
  const setWorkTopics = useDataStore((state) => state.setWorkTopics);
  const toast = useRefsStore((state) => state.toast);
  const { cloudDatabase } = useCloudStore();

  const [editValues, setEditValues] = useState({
    name: workTopic.name,
    color: workTopic.color,
    last_action: workTopic.last_action,
    last_action_date: new Date().toISOString(),
  });

  const handleConfirmEdit = useCallback(
    async (topicId: string, editedWorkTopic: EditedWorkTopic) => {
      try {
        const localTopicResponse = await editTopic(topicId, editedWorkTopic);

        if (localTopicResponse.status === "Failure") {
          toast?.show({
            severity: "error",
            summary: localTopicResponse.status,
            detail: localTopicResponse.message,
            life: 3000,
          });
        } else {
          const updatedTopics = await getTopics();
          if (updatedTopics.item) {
            setWorkTopics(updatedTopics.item as WorkTopic[]);
          }
        }
      } catch (err) {
        console.error("Local edit topic failed", err);
      }

      if (cloudDatabase) {
        try {
          const cloudTopicResponse = await editWorkTopicSupabaseDatabase(
            cloudDatabase,
            topicId,
            editedWorkTopic,
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

      setEditMode(false);
    },
    [toast, setWorkTopics, setEditMode],
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

  const inputClassName = `${
    darkMode ? "dark-dropdown text-zinc-100" : "light-dropdown text-black"
  }`;

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
              onClick={() => handleConfirmEdit(workTopic.id, editValues)}
            />
          </IconContext.Provider>
        </div>

        <div className="flex flex-1 items-center justify-center">
          <div className="flex flex-col items-center w-full">
            <div className="flex flex-col w-full space-y-2">
              {/* Topic Color */}
              <p className="font-semibold">Topic Color</p>
              <ColorPicker
                value={intToColor(editValues.color)}
                onChange={(e) =>
                  setEditValues({
                    ...editValues,
                    color: colorToInt("#" + e.value),
                  })
                }
              />

              {/* Topic Name */}
              <p className="font-semibold">Topic Name</p>
              <InputText
                className={inputClassName}
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditTopicModal;
