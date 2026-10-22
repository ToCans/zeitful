// Store Imports
import { useSettingsStore } from "../../../stores/useSettingsStore";
// Type Imports
import type { Item } from "../../../types/types";

// Interface Definition
interface ItemNavigationBarProps {
  itemManagement: string;
}

// Component Definition
const ItemNavigationBar = ({ itemManagement }: ItemNavigationBarProps) => {
  const setTabSettings = useSettingsStore((state) => state.setTabSettings);

  const updateUserPageTab = (tab: Item) => {
    setTabSettings((prev) => ({
      ...prev,
      lastUsedUserPageTab: tab,
    }));
  };

  const getButtonClassName = (tab: string) =>
    `${
      itemManagement === tab ? "opacity-85" : "opacity-50 hover:opacity-75"
    } cursor-pointer`;

  const tabs: Array<{ value: Item; label: string }> = [
    { value: "Task", label: "Task" },
    { value: "Topic", label: "Topic" },
    { value: "Entries", label: "Entries" },
  ];

  return (
    <div className="flex flex-row gap-2">
      {tabs.map(({ value, label }) => (
        <button
          key={value}
          className={getButtonClassName(value)}
          onClick={() => updateUserPageTab(value)}
        >
          {label}
        </button>
      ))}
    </div>
  );
};

export default ItemNavigationBar;
