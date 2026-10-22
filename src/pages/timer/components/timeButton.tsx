// API Imports
import {
  startTimer,
  pauseTimer,
  restartTimer,
  skipTimer,
} from "../api/timer-controls";
// Store Imports
import { useSettingsStore } from "../../../stores/useSettingsStore";
import { useTimerStore } from "../../../stores/useTimerStore";
import { useRefsStore } from "../../../stores/useRefsStore";
// Icon Imports
import { IconContext } from "react-icons";
import {
  PiPlayDuotone,
  PiPauseDuotone,
  PiSkipForwardDuotone,
  PiArrowCounterClockwise,
} from "react-icons/pi";

// Interface Definitions
interface TimeButtonProps {
  purpose: "Start" | "Pause" | "Restart" | "Skip";
  timeRemaining: number;
  setTimeRemaining: (time: number) => void;
  setTimerRunning: (isRunning: boolean) => void;
}

// Component Definition
const TimeButton = ({
  purpose,
  timeRemaining,
  setTimeRemaining,
  setTimerRunning,
}: TimeButtonProps) => {
  const appSettings = useSettingsStore((state) => state.appSettings);
  const cycleNumber = useTimerStore((state) => state.cycleNumber);
  const setCycleNumber = useTimerStore((state) => state.setCycleNumber);
  const timerWorker = useRefsStore((state) => state.timerWorker);
  const permission = useRefsStore((state) => state.permission);

  const iconClassName = "size-8 opacity-50 hover:opacity-70 cursor-pointer";

  const buttonConfig = {
    Start: {
      icon: PiPlayDuotone,
      id: "startButton",
      action: () =>
        startTimer({
          appSettings,
          cycleNumber,
          timerWorker,
          permission,
          timeRemaining,
          setTimerRunning,
        }),
    },
    Pause: {
      icon: PiPauseDuotone,
      id: "pauseButton",
      action: () =>
        pauseTimer({
          appSettings,
          cycleNumber,
          timerWorker,
          permission,
          timeRemaining,
          setTimerRunning,
        }),
    },
    Restart: {
      icon: PiArrowCounterClockwise,
      id: "restartButton",
      action: () =>
        restartTimer({
          appSettings,
          cycleNumber,
          timerWorker,
          permission,
          timeRemaining,
          setTimerRunning,
          setTimeRemaining,
        }),
    },
    Skip: {
      icon: PiSkipForwardDuotone,
      id: "skipButton",
      action: () =>
        skipTimer({
          appSettings,
          cycleNumber,
          timerWorker,
          permission,
          timeRemaining,
          setTimerRunning,
          setCycleNumber,
        }),
    },
  };

  const { icon: Icon, id, action } = buttonConfig[purpose];

  return (
    <IconContext.Provider value={{ className: iconClassName }}>
      <Icon id={id} onClick={action} />
    </IconContext.Provider>
  );
};

export default TimeButton;
