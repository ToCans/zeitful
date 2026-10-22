// API Imports
import { addTopic, getTopics } from "../../api/localDatabase";
import { addWorkTopicSupabaseDatabase } from "../../api/cloudDatabase";
// Component Imports
import { IconContext } from "react-icons";
import { PiPlus } from "react-icons/pi";
import { ColorPicker } from "primereact/colorpicker";
import { InputText } from "primereact/inputtext";
// React Imports
import { useState, useCallback } from "react";
// Store Imports
import { useSettingsStore } from "../../stores/useSettingsStore";
import { useDataStore } from "../../stores/useDataStore";
import { useCloudStore } from "../../stores/useCloudStore";
import { useRefsStore } from "../../stores/useRefsStore";
// Library Imports
import { v4 as uuidv4 } from "uuid";
// Type Imports
import type { WorkTopic } from "../../types/types";
// Utils Imports
import { colorToInt, getRandomHexColor } from "../../utils/colors";

// Topic Adder Interface
interface TopicAdderProps {
  setItemAddedSuccess: React.Dispatch<React.SetStateAction<boolean>>;
}

// Component Definition
const TopicAdder = ({ setItemAddedSuccess }: TopicAdderProps) => {
  const darkMode = useSettingsStore((state) => state.appSettings.darkMode);
  const setWorkTopics = useDataStore((state) => state.setWorkTopics);
  const cloudDatabase = useCloudStore((state) => state.cloudDatabase);
  const toast = useRefsStore((state) => state.toast);

  const [newTopicName, setNewTopicName] = useState<string>("");
  const [newTopicColor, setNewTopicColor] =
    useState<string>(getRandomHexColor());

  const handleAddTopic = useCallback(
    async (workTopic: WorkTopic) => {
      if (workTopic.name !== "") {
        const topicResponse = await addTopic(workTopic);
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
      } else {
        toast?.show({
          severity: "error",
          summary: "Error",
          detail: "Please enter a topic name.",
          life: 3000,
        });
      }
    },
    [toast, setWorkTopics],
  );

  const handleAddTopicToCloudDatabase = useCallback(
    async (workTopic: WorkTopic) => {
      if (workTopic.name !== "" && cloudDatabase) {
        const response = await addWorkTopicSupabaseDatabase(
          cloudDatabase,
          workTopic,
        );
        console.log(response.status, response.message);
        const updatedTopics = await getTopics();
        if (updatedTopics.item) {
          setWorkTopics(updatedTopics.item as WorkTopic[]);
        }
      }
    },
    [cloudDatabase, setWorkTopics],
  );

  const handleAddTopicClick = async () => {
    const id = uuidv4();
    const topicData: WorkTopic = {
      id,
      name: newTopicName,
      color: colorToInt(newTopicColor),
      last_action: 1,
      last_action_date: new Date().toISOString(),
    };

    try {
      await handleAddTopic(topicData);
    } catch (err) {
      console.error("Local add topic failed", err);
    }

    if (cloudDatabase) {
      try {
        await handleAddTopicToCloudDatabase(topicData);
      } catch (err) {
        console.error("Cloud add topic failed", err);
      }
    }

    // Trigger Success Notification
    setItemAddedSuccess(true);

    // Clear inputs after successful add
    setNewTopicName("");
    setNewTopicColor(getRandomHexColor());

    // Hide it after 3 seconds
    setTimeout(() => setItemAddedSuccess(false), 3000);
  };

  const inputStyle = {
    backgroundColor: darkMode ? "#52525B" : "#ffffff",
    color: darkMode ? "#F4F4F5" : "#000000",
    borderColor: darkMode ? "#6b7280" : "#d1d5db",
  };

  return (
    <div className="flex flex-row items-center gap-2 w-full">
      <button
        className="m-2 cursor-pointer group"
        onClick={handleAddTopicClick}
      >
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
        id="newTopic"
        placeholder="Add a new topic"
        value={newTopicName}
        onChange={(e) => setNewTopicName(e.target.value)}
        style={inputStyle}
      />

      <ColorPicker
        value={newTopicColor}
        onChange={(e) => setNewTopicColor(`#${e.value}`)}
      />
    </div>
  );
};

export default TopicAdder;
