import { observable } from "@legendapp/state";
import {
  pauseTimer,
  resetTimer,
  startTimer,
  tickTimer,
} from "./timer-state.ts";
import type { PRACTICE_TIMERS, TimerState } from "./timer-state.ts";

type Config = (typeof PRACTICE_TIMERS)[number];

export function createPracticeTimer(config: Config, onFinish: () => void) {
  const state$ = observable({
    minutes: config.initial as number,
    timer: resetTimer(config.initial),
  });

  function update(timer: TimerState) {
    const completed =
      state$.timer.status.peek() === "running" && timer.status === "finished";
    state$.timer.set(timer);
    if (completed) onFinish();
  }

  function start(now = Date.now()) {
    const state = state$.peek();
    update(
      startTimer(
        state.timer.status === "finished"
          ? resetTimer(state.minutes)
          : state.timer,
        now,
      ),
    );
  }

  function tick(now = Date.now()) {
    if (state$.timer.status.peek() === "running")
      update(tickTimer(state$.timer.peek(), now));
  }

  function pause(now = Date.now()) {
    update(pauseTimer(state$.timer.peek(), now));
  }
  function reset() {
    update(resetTimer(state$.minutes.peek()));
  }
  function setMinutes(minutes: number) {
    const status = state$.timer.status.peek();
    if (
      (status !== "ready" && status !== "finished") ||
      !Number.isInteger(minutes) ||
      minutes < config.min ||
      minutes > config.max
    )
      return;
    state$.set({ minutes, timer: resetTimer(minutes) });
  }

  return { state$, start, tick, pause, reset, setMinutes };
}
