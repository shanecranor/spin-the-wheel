export const PRACTICE_TIMERS = [
  { id: "scale", title: "Learn the scale", min: 5, max: 20, initial: 10 },
  { id: "riffs", title: "Write riffs", min: 20, max: 60, initial: 30 },
  { id: "video", title: "Record a video", min: 10, max: 60, initial: 20 },
] as const;

export interface TimerState {
  status: "ready" | "running" | "paused" | "finished";
  remainingMs: number;
  deadline: number | null;
}

export function resetTimer(minutes: number): TimerState {
  return { status: "ready", remainingMs: minutes * 60_000, deadline: null };
}

export function startTimer(state: TimerState, now: number): TimerState {
  if (state.status === "running" || state.remainingMs <= 0) return state;
  return { ...state, status: "running", deadline: now + state.remainingMs };
}

export function tickTimer(state: TimerState, now: number): TimerState {
  if (state.status !== "running" || state.deadline === null) return state;
  const remainingMs = Math.max(0, state.deadline - now);
  return remainingMs === 0
    ? { status: "finished", remainingMs: 0, deadline: null }
    : { ...state, remainingMs };
}

export function pauseTimer(state: TimerState, now: number): TimerState {
  const updated = tickTimer(state, now);
  return updated.status === "running"
    ? { ...updated, status: "paused", deadline: null }
    : updated;
}

export function formatTime(ms: number): string {
  const seconds = Math.ceil(ms / 1000);
  return `${Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0")}:${(seconds % 60).toString().padStart(2, "0")}`;
}
