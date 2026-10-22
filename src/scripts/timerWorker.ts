const workercode = () => {
  let active = false;
  let interval: ReturnType<typeof setInterval>;
  let endTime: number;

  // React App Message Handler
  const updateTime = () => {
    const now = Date.now();
    const timeLeft = Math.max(endTime - now, 0); // Ensure timeLeft doesn't go below 0
    const timeRemaining = Math.round(timeLeft / 1000);

    if (timeRemaining <= 0) {
      active = false;
      clearInterval(interval);
      postMessage({
        timeRemaining: 0,
      });
    } else {
      postMessage({
        timeRemaining: timeRemaining,
      });
    }
  };

  // Timer Control Handling
  onmessage = function (e) {
    if (e.data.timerRunning && !active) {
      active = true;

      const timeRemaining = e.data.timeRemaining;

      const now = Date.now();
      endTime = now + timeRemaining * 1000;

      updateTime(); // Execute immediately to avoid the first skipped second

      interval = setInterval(updateTime, 1000);
    } else if (!e.data.timerRunning && active) {
      active = false;
      clearInterval(interval);
    }
  };
};

// Using Blob object for making worker
let code = workercode.toString();
code = code.substring(code.indexOf("{") + 1, code.lastIndexOf("}"));
const blob = new Blob([code], { type: "application/javascript" });
const worker_script = URL.createObjectURL(blob);

export default worker_script;
