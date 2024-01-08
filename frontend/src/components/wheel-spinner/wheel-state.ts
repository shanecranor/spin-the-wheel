import { observable } from "@legendapp/state";
import { EntryProps } from "@shared/types";

export interface WheelState {
  rotation: number;
  winningEntry: EntryProps | null;
  isRotating: boolean;
}
export const wheelState$ = observable<WheelState>({
  rotation: 0,
  winningEntry: null,
  isRotating: false,
});
