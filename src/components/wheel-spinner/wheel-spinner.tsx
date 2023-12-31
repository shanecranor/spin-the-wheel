import { SliceData } from "../wheel/types";
import { Wheel } from "../wheel/wheel";
import { observer } from "@legendapp/state/react";
import { wheelState$ } from "./wheel-state";
import { WHEEL_COLORS, buildWheelOffsets } from "../wheel/wheel-svg-generator";
import styles from "./wheel-spinner.module.scss";
import { useDisclosure } from "@mantine/hooks";
import { Button, Modal, Text } from "@mantine/core";
import confetti from "canvas-confetti";
export const WheelSpinner = observer(
  ({
    slices,
    setWinner,
    removeWinner,
  }: {
    slices: SliceData[];
    setWinner: (id: number) => void;
    removeWinner: (id: number) => void;
  }) => {
    const [opened, { open, close }] = useDisclosure(false);
    return (
      <div className={styles["c-wheel-spinner"]}>
        <div className={styles["wheel-container"]}>
          <Wheel sliceData={slices} rotation={wheelState$.rotation.get()} />
          <div className={styles["wheel-indicator"]}>◄</div> {/* ◀ for smooth*/}
        </div>
        <button onClick={() => doSpin(slices, open, setWinner)}>Spin me</button>
        <Modal opened={opened} onClose={close} title="Winner!!" centered>
          <Text>
            {
              slices.find((item) => item.id == wheelState$.selectedItemId.get())
                ?.text
            }
          </Text>
          <Button
            onClick={() => {
              removeWinner(wheelState$.selectedItemId.peek());
              close();
            }}
          >
            Remove Winner
          </Button>
        </Modal>
      </div>
    );
  }
);

function doSpin(
  slices: SliceData[],
  open: () => void,
  setWinner: (id: number) => void
) {
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
  const newAngle =
    getRandomFloat(wheelOffsets[idx].start, wheelOffsets[idx].end) * 360;
  const spins = Math.ceil(Math.random() * 2 + 4);
  wheelState$.rotation.set(
    (old) => old + (360 - (old % 360)) + newAngle + spins * -360
  );
  setTimeout(() => {
    setWinner(winnerSlice.id);
    open();
    fireworks();
  }, 10200);
}

function getRandomFloat(min: number, max: number) {
  if (min > max) {
    [min, max] = [max, min]; // Swap if min is greater than max
  }
  return Math.random() * (max - min) + min;
}

function fireworks() {
  for (let i = 0; i < 7; i++) {
    setTimeout(
      () => shootFireworks((7 - i) * 10),
      i * 500 + Math.random() * 90
    );
  }
}

function shootFireworks(particleCount: number) {
  const defaults = {
    startVelocity: 20,
    spread: 360,
    ticks: 60,
    zIndex: 0,
    decay: 0.93,
    scalar: 1.2,
    colors: WHEEL_COLORS,
  };
  confetti({
    ...defaults,
    particleCount,
    origin: { x: getRandomFloat(0.1, 0.4), y: Math.random() - 0.2 },
  });
  setTimeout(
    () =>
      confetti({
        ...defaults,
        particleCount,
        origin: { x: getRandomFloat(0.6, 0.9), y: Math.random() - 0.2 },
      }),
    250
  );
}
