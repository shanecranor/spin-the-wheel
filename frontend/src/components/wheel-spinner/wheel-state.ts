import { observable } from "@legendapp/state";

export interface WheelState {
  rotation: number;
  selectedItemId: number | null;
  isRotating: boolean;
}
export const wheelState$ = observable<WheelState>({
  rotation: 0,
  selectedItemId: null,
  isRotating: false,
});
