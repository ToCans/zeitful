// Utility function to convert dates to a readable format
export function formatDate(dateInput: string): { date: string; time: string } {
  const date = new Date(dateInput);

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0"); // months are 0-indexed
  const year = date.getFullYear();

  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return { date: `${day}/${month}/${year}`, time: `${hours}:${minutes}` };
}
