// stores/useRefsStore.ts
import { create } from "zustand";
import breakFinishAudioClip from "../assets/sounds/complete.mp3";
import workFinishAudioClip from "../assets/sounds/lowHighChime.mp3";
import timerWorkerScript from "../scripts/timerWorker";
import { getCurrentDate } from "../utils/time";

interface RefsStore {
  // Actual refs/objects that need to persist
  timerWorker: Worker | null;
  breakFinishAudio: HTMLAudioElement | null;
  workFinishAudio: HTMLAudioElement | null;
  todayDate: string | null;
  toast: any;

  // Regular state (no longer refs)
  permission: PermissionState | null;
  subscription: PushSubscription | null;

  // Actions
  setPermission: (permission: PermissionState | null) => void;
  setSubscription: (subscription: PushSubscription | null) => void;
  setToast: (toast: any) => void;
  initializeRefs: () => void;
  cleanup: () => void;
}

export const useRefsStore = create<RefsStore>((set, get) => ({
  timerWorker: null,
  breakFinishAudio: null,
  workFinishAudio: null,
  todayDate: null,
  toast: null,
  permission: null,
  subscription: null,

  setPermission: (permission) => set({ permission }),
  setSubscription: (subscription) => set({ subscription }),
  setToast: (toast) => set({ toast }),

  initializeRefs: () => {
    const todayDate = getCurrentDate();
    const timerWorker = new Worker(timerWorkerScript);
    const breakFinishAudio = new Audio(breakFinishAudioClip);
    const workFinishAudio = new Audio(workFinishAudioClip);

    set({
      todayDate,
      timerWorker,
      breakFinishAudio,
      workFinishAudio,
    });
  },

  cleanup: () => {
    const { timerWorker } = get();
    if (timerWorker) {
      timerWorker.terminate();
    }
  },
}));
