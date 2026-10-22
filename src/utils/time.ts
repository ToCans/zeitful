// Utility function to convert minutes → "Xh Ym"
export const formatMinutes = (totalMinutes: number) => {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};

// Get Current Date
export const getCurrentDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0"); // Month is 0-indexed
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Time Formatting Function
export function formatTime(timeRemaining: number): string {
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;

  const timerMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;
  const timerSeconds = seconds < 10 ? `0${seconds}` : `${seconds}`;

  return `${timerMinutes}:${timerSeconds}`;
}

// Formats the time window hour
export const formatHourWindow = (hour: number): string => {
  const format = (h: number) => {
    const suffix = h >= 12 ? "PM" : "AM";
    let normalized = h % 12;
    if (normalized === 0) normalized = 12;
    return `${normalized} ${suffix}`;
  };

  const start = format(hour);
  const end = format((hour + 1) % 24);

  return `${start} – ${end}`;
};
