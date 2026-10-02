import { batch } from "@legendapp/state";
import type { ObservableObject } from "@legendapp/state";
import type { EntryProps } from "@shared/types";
import {
  calculateWheelSpin,
  SPIN_COMPLETION_DELAY,
} from "../wheel/wheel-spin.ts";
import type { WheelState } from "./wheel-state.ts";

export function createWheelController(
  state$: ObservableObject<WheelState>,
  getEntries: () => EntryProps[],
) {
  let timer: ReturnType<typeof setTimeout> | undefined;

  function clearTimer() {
    if (timer !== undefined) clearTimeout(timer);
    timer = undefined;
  }

  function finishSpin() {
    clearTimer();
    if (state$.isRotating.peek()) state$.isRotating.set(false);
  }

  function spin(reducedMotion: boolean) {
    if (state$.locked.peek() || state$.isRotating.peek()) return;
    const entries = getEntries();
    if (!entries.length) return;
    const { winningEntry, rotation } = calculateWheelSpin(
      entries,
      state$.rotation.peek(),
    );
    batch(() => {
      state$.winningEntry.set(winningEntry);
      state$.rotation.set(rotation);
      state$.isRotating.set(!reducedMotion);
    });
    if (!reducedMotion) timer = setTimeout(finishSpin, SPIN_COMPLETION_DELAY);
  }

  function toggleLock() {
    if (state$.winningEntry.peek() && !state$.isRotating.peek())
      state$.locked.toggle();
  }

  return { spin, finishSpin, toggleLock, dispose: finishSpin };
}
