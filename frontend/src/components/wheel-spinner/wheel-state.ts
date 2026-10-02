import { observable } from "@legendapp/state";
import type { EntryProps } from "@shared/types";

export interface WheelState {
  rotation: number;
  winningEntry: EntryProps | null;
  isRotating: boolean;
  locked: boolean;
}

export function createWheelState(): WheelState {
  return { rotation: 0, winningEntry: null, isRotating: false, locked: false };
}

export const wheelState$ = observable<WheelState>(createWheelState());
