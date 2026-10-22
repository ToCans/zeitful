// stores/useDataStore.ts
import { create } from "zustand";
import type { WorkTask, WorkTopic, WorkEntry } from "../types/types";
import { getTasks, getTopics, getWorkEntries } from "../api/localDatabase";

interface DataStore {
  workTasks: WorkTask[];
  workTopics: WorkTopic[];
  workEntries: WorkEntry[];
  isLoading: boolean;
  setWorkTasks: (tasks: WorkTask[]) => void;
  setWorkTopics: (topics: WorkTopic[]) => void;
  setWorkEntries: (entries: WorkEntry[]) => void;
  loadData: (showToast?: (msg: any) => void) => Promise<void>;
}

export const useDataStore = create<DataStore>((set) => ({
  workTasks: [],
  workTopics: [],
  workEntries: [],
  isLoading: false,
  setWorkTasks: (tasks) => set({ workTasks: tasks }),
  setWorkTopics: (topics) => set({ workTopics: topics }),
  setWorkEntries: (entries) => set({ workEntries: entries }),
  loadData: async (showToast) => {
    set({ isLoading: true });
    try {
      const [topicResponse, taskResponse, workEntryResponse] =
        await Promise.all([getTopics(), getTasks(), getWorkEntries()]);

      // Setting Topics
      if (topicResponse.status === "Failure") {
        showToast?.({
          severity: "error",
          summary: topicResponse.status,
          detail: topicResponse.message,
          life: 3000,
        });
      } else {
        set({ workTopics: topicResponse.item as WorkTopic[] });
      }

      // Setting Tasks
      if (taskResponse.status === "Failure") {
        showToast?.({
          severity: "error",
          summary: taskResponse.status,
          detail: taskResponse.message,
          life: 3000,
        });
      } else {
        set({ workTasks: taskResponse.item as WorkTask[] });
      }

      // Setting Work Entries
      if (workEntryResponse.status === "Failure") {
        showToast?.({
          severity: "error",
          summary: workEntryResponse.status,
          detail: workEntryResponse.message,
          life: 3000,
        });
      } else {
        set({ workEntries: workEntryResponse.item as WorkEntry[] });
      }
    } finally {
      set({ isLoading: false });
    }
  },
}));
