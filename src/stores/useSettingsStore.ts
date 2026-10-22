// stores/useSettingsStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  PersistedAppSettings,
  PersistedTabSettings,
} from "../types/types";

interface SettingsStore {
  appSettings: PersistedAppSettings;
  tabSettings: PersistedTabSettings;
  setAppSettings: (
    settings:
      | PersistedAppSettings
      | ((prev: PersistedAppSettings) => PersistedAppSettings),
  ) => void;
  setTabSettings: (
    settings:
      | PersistedTabSettings
      | ((prev: PersistedTabSettings) => PersistedTabSettings),
  ) => void;
}

const defaultAppSettings: PersistedAppSettings = {
  showTabTimer: true,
  workingTime: 25 * 60,
  shortBreakTime: 5 * 60,
  longBreakTime: 15 * 60,
  timerColor: "bfdbfe",
  darkMode: false,
  useCloudDatabase: false,
  lastCloudDatabaseSync: "None",
};

const defaultTabSettings: PersistedTabSettings = {
  lastUsedPeriodTab: "M",
  lastUsedStatisticsTab: "Task",
  lastUsedUserPageTab: "Task",
  lastUsedVisualization: "Pie",
};

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      appSettings: defaultAppSettings,
      tabSettings: defaultTabSettings,
      setAppSettings: (settings) =>
        set((state) => ({
          appSettings:
            typeof settings === "function"
              ? settings(state.appSettings)
              : settings,
        })),
      setTabSettings: (settings) =>
        set((state) => ({
          tabSettings:
            typeof settings === "function"
              ? settings(state.tabSettings)
              : settings,
        })),
    }),
    {
      name: "app-settings-storage",
      partialize: (state) => ({
        appSettings: state.appSettings,
        tabSettings: state.tabSettings,
      }),
    },
  ),
);
