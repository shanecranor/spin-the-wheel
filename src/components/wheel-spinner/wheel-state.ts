import { observable } from "@legendapp/state";
import { SliceData } from "../wheel/types";
import { entryState$ } from "../entry-manager/entry-state";
// export const tempSliceData = [
//   { id: 0, text: 'end stream', weight: 1 },
//   { id: 1, text: 'play valorant', weight: 1 },
//   { id: 2, text: 'cry ', weight: 1 },
//   { id: 3, text: 'eat spicy chip', weight: 1 },
//   { id: 4, text: 'jumping jacks', weight: 2 },
//   { id: 5, text: '100 pushups', weight: 0.1 },
// ]


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
  sliceData: entryState$.get().filter(
    (entry) => entry.isSentToWheel
  ).map((entry) => ({
    id: entry.id,
    text: entry.text,
    weight: 1,
  }))
})