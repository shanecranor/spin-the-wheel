import { SliceData } from "../wheel/types";
import { Wheel } from "../wheel/wheel";
import { observer } from "@legendapp/state/react";
import { wheelState$ } from "./wheel-state";
import { buildWheelOffsets } from "../wheel/wheel-svg-generator";
import styles from "./wheel-spinner.module.scss";
export const WheelSpinner = observer(({ slices }: { slices: SliceData[] }) => {
  // TODO: PASS A FUNCTION FOR REMOVING SLICES FROM STATE TO CALL
  // if (slices.length === 0) {
  // }
  return (
    <div className={styles["c-wheel-spinner"]}>
      <Wheel sliceData={slices} rotation={wheelState$.rotation.get()} />
      <button onClick={() => doSpin(slices)}>Spin me</button>
    </div>
  );
});

function doSpin(slices: SliceData[]) {
  //fetch slice data
  const sliceData = slices;
  //choose a random slice to win
  const winnerIdx = Math.floor(Math.random() * sliceData.length);
  const winnerSlice = sliceData[winnerIdx];
  //set the winner slice
  wheelState$.selectedItemId.set(winnerSlice.id);
  //build the wheel offsets so we can choose a random angle
  const wheelOffsets = buildWheelOffsets(sliceData);
  const idx = sliceData.findIndex((slice) => slice.id === winnerSlice.id);
  //set the rotation to the random angle
  const newAngle = wheelOffsets[idx].mid * 360; //getRandomFloat(wheelOffsets[idx].start, wheelOffsets[idx].end) * 360
  wheelState$.rotation.set(
    (old) =>
      old +
      (360 - (old % 360)) +
      newAngle +
      Math.ceil(Math.random() * 3 + 2) * -360
  );
  // setTimeout(() => {
  //   wheelState$.sliceData.set((old) => old.filter((item) => item.id != winnerSlice.id))
  // }, 5000)
}

// function getRandomFloat(min: number, max: number) {
//   if (min > max) {
//     [min, max] = [max, min]; // Swap if min is greater than max
//   }
//   return Math.random() * (max - min) + min;
// }
