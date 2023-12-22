import { observable } from "@legendapp/state";
import { SliceData } from "../wheel/types";

export interface WheelState {
  rotation: number;
  selectedItemId: number | null;
  isRotating: boolean;
  sliceData: SliceData[];
}
export const wheelState$ = observable<WheelState>({
  rotation: 0,
  selectedItemId: null,
  isRotating: false,
  sliceData: [],
})