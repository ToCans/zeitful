// Store Imports
import { useSettingsStore } from "../../stores/useSettingsStore";

// Component Definition
const ActiveNavBarUnderline = ({ active }: { active: boolean }) => {
  const darkMode = useSettingsStore((state) => state.appSettings.darkMode);

  return (
    <span
      className={`absolute bottom-1 h-1 ${
        darkMode ? "bg-gray-200" : "bg-black"
      } rounded transition-all duration-300 transform origin-left ${
        active
          ? "w-7 opacity-50 scale-x-100 ease-in"
          : "w-0 opacity-0 scale-x-0"
      }`}
    ></span>
  );
};

export default ActiveNavBarUnderline;
