// stores/useCloudStore.ts
import { create } from "zustand";
import type { SupabaseClient } from "@supabase/supabase-js";

interface CloudStore {
  cloudDatabase: SupabaseClient | null;
  hasSynced: boolean;
  setCloudDatabase: (db: SupabaseClient | null) => void;
  setHasSynced: (synced: boolean) => void;
}

export const useCloudStore = create<CloudStore>((set) => ({
  cloudDatabase: null,
  hasSynced: false,
  setCloudDatabase: (db) => set({ cloudDatabase: db }),
  setHasSynced: (synced) => set({ hasSynced: synced }),
}));
