import { Wheel } from "../wheel/wheel";
import { observer } from "@legendapp/state/react";
import { wheelState$ } from "./wheel-state";
import { WHEEL_COLORS, buildWheelOffsets } from "../wheel/wheel-svg-generator";
import styles from "./wheel-spinner.module.scss";
import { useDisclosure } from "@mantine/hooks";
import { Button, Modal, Text } from "@mantine/core";
import confetti from "canvas-confetti";
import { EntryIdBoolFunction } from "../../state/commands";
import { EntryProps } from "@shared/types";
export const WheelSpinner = observer(
  ({
    wheelEntries,
    setIsWinner,
    setIsOnWheel,
  }: {
    wheelEntries: EntryProps[];
    setIsWinner: EntryIdBoolFunction;
    setIsOnWheel: EntryIdBoolFunction;
  }) => {
    const [opened, { open, close }] = useDisclosure(false);
    return (
      <div className={styles["c-wheel-spinner"]}>
        <div className={styles["wheel-container"]}>
          <Wheel
            wheelEntries={wheelEntries}
            rotation={wheelState$.rotation.get()}
          />
          <div className={styles["wheel-indicator"]}>◄</div>{" "}
          {/* ◀ for for rounding*/}
        </div>
        <Button
          m="md"
          size="lg"
          onClick={() => doSpin(wheelEntries, open, setIsWinner)}
          disabled={wheelEntries.length === 0 || wheelState$.isRotating.get()}
        >
          Spin me
        </Button>
        <Modal opened={opened} onClose={close} title="Winner!!" centered>
          <Text>
            The wheel chooses{" "}
            {
              wheelEntries.find(
                (item) => item.id == wheelState$.winningEntry.id.get()
              )?.text
            }
          </Text>
          <Text></Text>
          <Button
            onClick={() => {
              setIsOnWheel(wheelState$.winningEntry.id.peek(), false);
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
  wheelEntries: EntryProps[],
  open: () => void,
  setIsWinner: EntryIdBoolFunction
) {
  //fetch slice data

  const sliceData = wheelEntries;
  //choose a random slice to win
  const winnerIdx = Math.floor(Math.random() * sliceData.length);
  const winningEntry = sliceData[winnerIdx];
  //set the winner entry
  wheelState$.winningEntry.set(winningEntry);
  //build the wheel offsets so we can choose a random angle
  const wheelOffsets = buildWheelOffsets(sliceData);
  const idx = sliceData.findIndex((slice) => slice.id === winningEntry.id);
  //set the rotation to the random angle
  const newAngle =
    getRandomFloat(wheelOffsets[idx].start, wheelOffsets[idx].end) * 360;
  const spins = Math.ceil(Math.random() * 2 + 4);
  wheelState$.rotation.set(
    (old) => old + (360 - (old % 360)) + newAngle + spins * -360
  );
  wheelState$.isRotating.set(true);
  setTimeout(() => {
    console.log("SET IS WINNER");
    setIsWinner(winningEntry.id, true);
    open();
    fireworks();
    wheelState$.isRotating.set(false);
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
