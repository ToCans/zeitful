// stores/useNavigationStore.ts
import { create } from "zustand";
import type { Page } from "../types/types";

interface NavigationStore {
  activePage: Page;
  setActivePage: (page: Page) => void;
}

export const useNavigationStore = create<NavigationStore>((set) => ({
  activePage: "Timer",
  setActivePage: (page) => set({ activePage: page }),
}));
