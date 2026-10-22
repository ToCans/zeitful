// API Imports
import { sendPushNotification } from "../api/push-notification";
import { addWorkEntry, getWorkEntries } from "../../../api/localDatabase";
import { addWorkEntrySupabaseDatabase } from "../../../api/cloudDatabase";
// Component Imports
import TimeDisplay from "./timeDisplay";
import TimerControls from "./timeControls";
import WavesAnimation from "./wavesAnimation";
import TaskFocus from "./taskFocus";
import CloudSyncStatusTile from "./cloudSyncStatus";
// React Imports
import { useState, useEffect, useRef, useCallback } from "react";
// Store Imports
import { useSettingsStore } from "../../../stores/useSettingsStore";
import { useTimerStore } from "../../../stores/useTimerStore";
import { useDataStore } from "../../../stores/useDataStore";
import { useCloudStore } from "../../../stores/useCloudStore";
import { useRefsStore } from "../../../stores/useRefsStore";
// Type Imports
import type { WorkEntry } from "../../../types/types";
// Utils Imports
import { playAudio } from "../utils/audio";
import { formatTime } from "../../../utils/time";
import { v4 as uuidv4 } from "uuid";

// Component Definition
const Timer = () => {
  // Zustand stores
  const appSettings = useSettingsStore((state) => state.appSettings);
  const {
    cycleNumber,
    activeWorkTask,
    setCycleNumber,
    setTimerRunning,
    incrementWorkingTime,
    incrementWorkingCycles,
  } = useTimerStore();
  const { workTopics, setWorkEntries } = useDataStore();
  const { cloudDatabase } = useCloudStore();
  const { timerWorker, breakFinishAudio, workFinishAudio, subscription } =
    useRefsStore();

  // Component States
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [timeRemaining, setTimeRemaining] = useState<number>(
    appSettings.workingTime,
  );
  const [progressBarValue, setProgressBarValue] = useState<number>(0);

  // References
  const progressBarTotalRef = useRef<number>(appSettings.workingTime);
  const timeRemainingRef = useRef<number>(timeRemaining);

  // Helper Functions
  const handleAddWorkEntry = useCallback(
    async (
      uuid: string,
      workEntry: Omit<
        WorkEntry,
        "id" | "duration" | "topic_name" | "completion_time"
      >,
    ) => {
      const matchedTopic = workTopics.find(
        (workTopic) => workTopic.id === workEntry.topic_id,
      );
      const response = await addWorkEntry({
        id: uuid,
        task_id: workEntry.task_id,
        topic_id: workEntry.topic_id,
        task_name: workEntry.task_name,
        topic_name: matchedTopic?.name ?? null,
        duration: appSettings.workingTime / 60,
        completion_time: new Date().toISOString(),
      });

      console.log(response.status, response.message);

      // Refresh work entries
      const updatedEntries = await getWorkEntries();
      if (updatedEntries.item) {
        setWorkEntries(updatedEntries.item as WorkEntry[]);
      }
    },
    [workTopics, appSettings.workingTime, setWorkEntries],
  );

  const handleAddWorkEntryToCloudDatabase = useCallback(
    async (
      uuid: string,
      workEntry: Omit<
        WorkEntry,
        "id" | "duration" | "topic_name" | "completion_time"
      >,
    ) => {
      if (cloudDatabase) {
        const matchedTopic = workTopics.find(
          (workTopic) => workTopic.id === workEntry.topic_id,
        );
        const response = await addWorkEntrySupabaseDatabase(cloudDatabase, {
          id: uuid,
          task_id: workEntry.task_id,
          topic_id: workEntry.topic_id,
          task_name: workEntry.task_name,
          topic_name: matchedTopic?.name ?? null,
          duration: appSettings.workingTime / 60,
          completion_time: new Date().toISOString(),
        });
        console.log(response.status, response.message);
      }
    },
    [cloudDatabase, workTopics, appSettings.workingTime],
  );

  // Trigger the slide-in animation on component mount
  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsMounted(true);
    }, 10);

    return () => {
      clearTimeout(timeout);
      setIsMounted(false);
    };
  }, []);

  // End of Timer handling
  useEffect(() => {
    if (!timerWorker) {
      return;
    }

    timerWorker.onmessage = async (e) => {
      timeRemainingRef.current = e.data.timeRemaining;
      setTimeRemaining(timeRemainingRef.current);

      if (e.data.timeRemaining === 0) {
        setTimerRunning(false);

        // Break Cycle Handling
        if (cycleNumber % 2 === 0) {
          playAudio(breakFinishAudio);
        }
        // Work Cycle Handling
        else {
          playAudio(workFinishAudio);

          // Update working stats in store
          incrementWorkingTime(Math.floor(appSettings.workingTime / 60));
          incrementWorkingCycles();

          // Defining Shared UUID between local and cloud entries
          const id = uuidv4();

          const workEntryData = {
            task_id: activeWorkTask?.id ?? null,
            topic_id: activeWorkTask?.topic_id ?? null,
            task_name: activeWorkTask?.name ?? null,
          };

          // Storing Work Entry Data locally
          try {
            await handleAddWorkEntry(id, workEntryData);
          } catch (err) {
            console.error("Local save failed", err);
          }

          // Storing Work Entry to Cloud Database
          if (cloudDatabase) {
            try {
              await handleAddWorkEntryToCloudDatabase(id, workEntryData);
            } catch (err) {
              console.error("Cloud save failed", err);
            }
          }
        }

        // Sending Push Notification
        try {
          await sendPushNotification({ cycleNumber, subscription });
        } catch (err) {
          console.error("Push notification failed", err);
        }

        // Incrementing Cycle
        setCycleNumber(cycleNumber + 1);
      }
    };
  }, [
    timerWorker,
    cycleNumber,
    activeWorkTask,
    appSettings.workingTime,
    cloudDatabase,
    breakFinishAudio,
    workFinishAudio,
    subscription,
    setTimerRunning,
    setCycleNumber,
    incrementWorkingTime,
    incrementWorkingCycles,
    handleAddWorkEntry,
    handleAddWorkEntryToCloudDatabase,
  ]);

  // Showing Tab Timer
  useEffect(() => {
    if (appSettings.showTabTimer === true) {
      document.title = `${formatTime(timeRemaining)} - Zeitful`;
    } else {
      document.title = "Zeitful";
    }
  }, [timeRemaining, appSettings.showTabTimer]);

  // Timer Progress Handling
  useEffect(() => {
    const calculatedProgressBarValue =
      (1 - timeRemaining / progressBarTotalRef.current) * 100;
    setProgressBarValue(calculatedProgressBarValue);
  }, [timeRemaining]);

  // Time Remaining Handling
  useEffect(() => {
    if (cycleNumber % 8 === 0) {
      setTimeRemaining(appSettings.longBreakTime);
      progressBarTotalRef.current = appSettings.longBreakTime;
    } else if (cycleNumber % 2 === 0) {
      setTimeRemaining(appSettings.shortBreakTime);
      progressBarTotalRef.current = appSettings.shortBreakTime;
    } else {
      setTimeRemaining(appSettings.workingTime);
      progressBarTotalRef.current = appSettings.workingTime;
    }
  }, [
    cycleNumber,
    appSettings.longBreakTime,
    appSettings.shortBreakTime,
    appSettings.workingTime,
  ]);

  return (
    <div
      className={`relative p-4 short-laptop:h-75per md:max-h-[60vh] md:h-[60vh] max-h-[80vh] h-[80vh] xl:w-1/2 md:w-2/3 w-11/12 rounded-lg overflow-hidden shadow-[2px_2px_2px_rgba(0,0,0,0.3)] transform transition-transform duration-700 ease-out ${
        isMounted ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
      }`}
    >
      {/* Fill Layer (grows from bottom to top) */}
      <WavesAnimation
        progress={progressBarValue}
        timerColor={appSettings.timerColor}
      />

      {/* Content Layer */}
      <div className="relative z-20 w-full h-full flex flex-col rounded-lg p-5 justify-center items-center space-y-2">
        <TimeDisplay timeRemaining={timeRemaining} />
        <div className="relative flex rounded-lg items-center justify-center opacity-70">
          <TaskFocus />
          {appSettings.useCloudDatabase ? (
            <div className="absolute right-full mr-2">
              <CloudSyncStatusTile />
            </div>
          ) : null}
        </div>
        <TimerControls
          timeRemaining={timeRemaining}
          setTimeRemaining={setTimeRemaining}
        />
        <p className="sm:text-xl text-center select-none">
          Current Cycle: {Math.ceil(cycleNumber / 2)}
        </p>
      </div>

      <div
        className={`absolute inset-0 ${
          appSettings.darkMode ? "bg-zinc-700" : "bg-white"
        } rounded-lg z-0`}
      ></div>
    </div>
  );
};

export default Timer;
