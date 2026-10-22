// API Imports
import { subscribeToPush } from "../api/push-notification";
// Type Imports
import type { PersistedAppSettings } from "../../../types/types";

// Interface Definition for Timer Worker Message
export interface TimerWorkerMessageProps {
  timerWorker: Worker | null;
  runningBoolean: boolean;
  timeRemaining: number | null;
}

// Sending Timer Worker Message
export const sendTimerWorkerMessage = ({
  timerWorker,
  runningBoolean,
  timeRemaining,
}: TimerWorkerMessageProps) => {
  // Post message to the timer service worker if it exists
  if (timerWorker) {
    timerWorker.postMessage({
      timerRunning: runningBoolean,
      timeRemaining: timeRemaining,
    });
  }
};

// Interface Definition for Timer Controls
interface TimerControlsProps {
  appSettings: PersistedAppSettings;
  cycleNumber: number;
  timerWorker: Worker | null;
  permission?: PermissionState | null;
  timeRemaining: number;
  setTimerRunning: (timerRunning: boolean) => void;
  setTimeRemaining?: (timeRemaining: number) => void;
  setCycleNumber?: (cycleNumber: number) => void;
}

// Start Timer Functionality
export const startTimer = async ({
  timerWorker,
  permission,
  timeRemaining,
  setTimerRunning,
}: TimerControlsProps) => {
  if (permission === "prompt") {
    await subscribeToPush();
  }

  sendTimerWorkerMessage({
    timerWorker,
    runningBoolean: true,
    timeRemaining,
  });

  setTimerRunning(true);
};

// Pause Timer Functionality
export const pauseTimer = async ({
  timerWorker,
  permission,
  timeRemaining,
  setTimerRunning,
}: TimerControlsProps) => {
  if (permission === "prompt") {
    await subscribeToPush();
  }

  sendTimerWorkerMessage({
    timerWorker,
    runningBoolean: false,
    timeRemaining,
  });

  setTimerRunning(false);
};

// Restart Timer Functionality
export const restartTimer = async ({
  appSettings,
  cycleNumber,
  timerWorker,
  permission,
  setTimerRunning,
  setTimeRemaining,
}: TimerControlsProps) => {
  if (permission === "prompt") {
    await subscribeToPush();
  }

  sendTimerWorkerMessage({
    timerWorker,
    runningBoolean: false,
    timeRemaining: null,
  });

  setTimerRunning(false);

  if (setTimeRemaining) {
    let newTime: number;
    if (cycleNumber % 8 === 0) {
      newTime = appSettings.longBreakTime;
    } else if (cycleNumber % 2 === 0) {
      newTime = appSettings.shortBreakTime;
    } else {
      newTime = appSettings.workingTime;
    }
    setTimeRemaining(newTime);
  }
};

// Skip Timer Functionality
export const skipTimer = async ({
  cycleNumber,
  timerWorker,
  permission,
  setTimerRunning,
  setCycleNumber,
}: TimerControlsProps) => {
  if (permission === "prompt") {
    await subscribeToPush();
  }

  sendTimerWorkerMessage({
    timerWorker,
    runningBoolean: false,
    timeRemaining: null,
  });

  setTimerRunning(false);

  if (setCycleNumber) {
    setCycleNumber(cycleNumber + 1);
  }
};
