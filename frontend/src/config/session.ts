export const INACTIVITY_TIMEOUT_MS = 20_000;
export const INACTIVITY_WARNING_MS = 5_000;
export const INACTIVITY_EVENT_THROTTLE_MS = 500;

export function formatSessionTime(seconds: number): string {
  const safeSeconds = Math.max(0, seconds);
  const minutes = Math.floor(safeSeconds / 60).toString().padStart(2, "0");
  const remainingSeconds = (safeSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${remainingSeconds}`;
}
