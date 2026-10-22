// stores/useTimerStore.ts
import { create } from "zustand";
import type { WorkTask } from "../types/types";

interface TimerStore {
  cycleNumber: number;
  timerRunning: boolean;
  activeWorkTask: WorkTask | null;
  workingTimeCompleted: number;
  workingCyclesCompleted: number;

  setCycleNumber: (num: number) => void;
  setTimerRunning: (running: boolean) => void;
  setActiveWorkTask: (task: WorkTask | null) => void;
  incrementWorkingTime: (time: number) => void;
  incrementWorkingCycles: () => void;
  resetWorkingStats: () => void;
}

export const useTimerStore = create<TimerStore>((set) => ({
  cycleNumber: 1,
  timerRunning: false,
  activeWorkTask: null,
  workingTimeCompleted: 0,
  workingCyclesCompleted: 0,

  setCycleNumber: (num) => set({ cycleNumber: num }),
  setTimerRunning: (running) => set({ timerRunning: running }),
  setActiveWorkTask: (task) => set({ activeWorkTask: task }),
  incrementWorkingTime: (time) =>
    set((state) => ({
      workingTimeCompleted: state.workingTimeCompleted + time,
    })),
  incrementWorkingCycles: () =>
    set((state) => ({
      workingCyclesCompleted: state.workingCyclesCompleted + 1,
    })),
  resetWorkingStats: () =>
    set({ workingTimeCompleted: 0, workingCyclesCompleted: 0 }),
}));
