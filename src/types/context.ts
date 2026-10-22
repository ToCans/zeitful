// Type Imports
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Dispatch, RefObject } from "react";
import type {
  Page,
  WorkTask,
  WorkTopic,
  WorkEntry,
  PersistedAppSettings,
  PersistedTabSettings,
} from "./types";
import type { Toast } from "primereact/toast";

// Interface Defintion
export interface SettingsContextType {
  cycleNumber: number;
  timerWorker: RefObject<Worker | null>;
  breakFinishAudio: RefObject<HTMLAudioElement | null>;
  workFinishAudio: RefObject<HTMLAudioElement | null>;
  workingTimeCompleted: RefObject<number>;
  workingCyclesCompleted: RefObject<number>;
  todayDate: RefObject<string | null>;
  timerRunning: boolean;
  permission: RefObject<PermissionState | null>;
  subscription: RefObject<PushSubscription | null>;
  workTopics: WorkTopic[];
  workTasks: WorkTask[];
  workEntries: WorkEntry[];
  activeWorkTask: WorkTask | null;
  cloudDatabase: SupabaseClient | null;
  hasSyncedRef: RefObject<boolean>;
  toast: Toast | null;
  appSettings: PersistedAppSettings;
  tabSettings: PersistedTabSettings;
  setActivePage: Dispatch<React.SetStateAction<Page>>;
  setCycleNumber: Dispatch<React.SetStateAction<number>>;
  setTimerRunning: Dispatch<React.SetStateAction<boolean>>;
  setWorkTasks: Dispatch<React.SetStateAction<WorkTask[]>>;
  setWorkTopics: Dispatch<React.SetStateAction<WorkTopic[]>>;
  setWorkEntries: Dispatch<React.SetStateAction<WorkEntry[]>>;
  setActiveWorkTask: Dispatch<React.SetStateAction<WorkTask | null>>;
  setCloudDatabase: Dispatch<React.SetStateAction<SupabaseClient | null>>;
  setAppSettings: Dispatch<React.SetStateAction<PersistedAppSettings>>;
  setTabSettings: Dispatch<React.SetStateAction<PersistedTabSettings>>;
}
