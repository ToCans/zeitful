// Component Imports
import { ColorPicker } from "primereact/colorpicker";
import { InputSwitch } from "primereact/inputswitch";
import SettingsTimeTile from "./settingsTimeTile";
// React Imports
import { useEffect, useState } from "react";
// Store Imports
import { useSettingsStore } from "../../../stores/useSettingsStore";
import { useTimerStore } from "../../../stores/useTimerStore";
// Type Imports
import type { PersistedAppSettings } from "../../../types/types";
// Utils Imports
import { formatTime } from "../../../utils/time";

// Component Definition
const Settings = () => {
  const appSettings = useSettingsStore((state) => state.appSettings);
  const setAppSettings = useSettingsStore((state) => state.setAppSettings);
  const cycleNumber = useTimerStore((state) => state.cycleNumber);

  const [isMounted, setIsMounted] = useState(false);

  // Trigger the slide-in animation on component mount
  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsMounted(true);
    }, 10);

    return () => {
      clearTimeout(timeout);
      setIsMounted(false);
    };
  }, []);

  // For Showing Timer in Tab Info
  useEffect(() => {
    if (appSettings.showTabTimer === true) {
      let timeRemaining: number;
      if (cycleNumber % 8 === 0) {
        timeRemaining = appSettings.longBreakTime;
      } else if (cycleNumber % 2 === 0) {
        timeRemaining = appSettings.shortBreakTime;
      } else {
        timeRemaining = appSettings.workingTime;
      }
      document.title = `${formatTime(timeRemaining)} - Zeitful`;
    } else {
      document.title = "Zeitful";
    }
  }, [
    appSettings.showTabTimer,
    cycleNumber,
    appSettings.workingTime,
    appSettings.shortBreakTime,
    appSettings.longBreakTime,
  ]);

  const updateSetting = <K extends keyof PersistedAppSettings>(
    key: K,
    value: PersistedAppSettings[K],
  ) => {
    setAppSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <div
      className={`${
        appSettings.darkMode ? "bg-zinc-700" : "bg-white"
      } flex flex-col p-4 short-laptop:h-75per md:max-h-[60vh] md:h-[60vh] max-h-[80vh] h-[80vh] xl:w-1/2 md:w-2/3 w-11/12 rounded-lg overflow-hidden shadow-[2px_2px_2px_rgba(0,0,0,0.3)] transform transition-transform duration-700 ease-out ${
        isMounted ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
      }`}
    >
      <h1 className="flex text-2xl select-none">User Settings</h1>
      <div className="flex flex-col items-center justify-center space-y-3 flex-1">
        {/* Timer Color */}
        <div className="flex flex-row space-x-2 xl:text-lg text-lg items-center justify-center w-full">
          <p className="select-none text-md">Timer Color</p>
          <ColorPicker
            className="outline-none focus:outline-none ring-0 focus:ring-0 focus:shadow-none"
            inputClassName="h-5 w-5"
            onChange={(e) => updateSetting("timerColor", e.value as string)}
            defaultColor={`#${appSettings.timerColor}`}
          />
        </div>

        {/* Dark Mode */}
        <div className="flex flex-row space-x-2 xl:text-lg text-lg items-center justify-center w-full">
          <p className="select-none text-md">Dark Mode</p>
          <InputSwitch
            checked={appSettings.darkMode}
            onChange={(e) => updateSetting("darkMode", e.value)}
          />
        </div>

        {/* Working Minutes */}
        <SettingsTimeTile
          label="Working Minutes"
          value={appSettings.workingTime}
          setter={(newValue) =>
            updateSetting("workingTime", newValue as number)
          }
        />

        {/* Short Break Minutes */}
        <SettingsTimeTile
          label="Short Break Minutes"
          value={appSettings.shortBreakTime}
          setter={(newValue) =>
            updateSetting("shortBreakTime", newValue as number)
          }
        />

        {/* Long Break Minutes */}
        <SettingsTimeTile
          label="Long Break Minutes"
          value={appSettings.longBreakTime}
          setter={(newValue) =>
            updateSetting("longBreakTime", newValue as number)
          }
        />

        {/* Show Timer in Tab */}
        <div className="flex flex-row space-x-2 xl:text-lg text-lg items-center justify-center w-full">
          <p className="select-none text-md">Show Timer in Tab</p>
          <InputSwitch
            checked={appSettings.showTabTimer}
            onChange={(e) => updateSetting("showTabTimer", e.value)}
          />
        </div>

        {/* Use Cloud Database */}
        <div className="flex flex-row space-x-2 xl:text-lg text-lg items-center justify-center w-full">
          <p className="select-none text-md">Use Cloud Database</p>
          <InputSwitch
            checked={appSettings.useCloudDatabase}
            onChange={(e) => updateSetting("useCloudDatabase", e.value)}
          />
        </div>
      </div>
    </div>
  );
};

export default Settings;
