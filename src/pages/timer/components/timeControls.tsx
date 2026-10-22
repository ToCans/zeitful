// Component Imports
import TimeButton from "./timeButton";
// Store Imports
import { useTimerStore } from "../../../stores/useTimerStore";

// Interface Definitions
interface TimerControlsProps {
  timeRemaining: number;
  setTimeRemaining: (time: number) => void;
}

// Component Definition
const TimerControls = ({
  timeRemaining,
  setTimeRemaining,
}: TimerControlsProps) => {
  const timerRunning = useTimerStore((state) => state.timerRunning);
  const setTimerRunning = useTimerStore((state) => state.setTimerRunning);

  return (
    <div className="row flex flex-row justify-center items-center w-full space-x-1">
      {timerRunning ? (
        <TimeButton
          purpose="Pause"
          timeRemaining={timeRemaining}
          setTimeRemaining={setTimeRemaining}
          setTimerRunning={setTimerRunning}
        />
      ) : (
        <TimeButton
          purpose="Start"
          timeRemaining={timeRemaining}
          setTimeRemaining={setTimeRemaining}
          setTimerRunning={setTimerRunning}
        />
      )}
      <TimeButton
        purpose="Restart"
        timeRemaining={timeRemaining}
        setTimeRemaining={setTimeRemaining}
        setTimerRunning={setTimerRunning}
      />
      <TimeButton
        purpose="Skip"
        timeRemaining={timeRemaining}
        setTimeRemaining={setTimeRemaining}
        setTimerRunning={setTimerRunning}
      />
    </div>
  );
};

export default TimerControls;
