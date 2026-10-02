import { Wheel } from "../wheel/wheel";
import { observer } from "@legendapp/state/react";
import { wheelState$ } from "./wheel-state";
import { WHEEL_COLORS } from "../wheel/wheel-svg-generator";
import { calculateWheelSpin, SPIN_COMPLETION_DELAY } from "../wheel/wheel-spin";
import styles from "./wheel-spinner.module.scss";
import { useDisclosure } from "@mantine/hooks";
import { Button, Group, Modal, Stack, Text, Title } from "@mantine/core";
import confetti from "canvas-confetti";
import { EntryIdBoolFunction } from "../../state/commands";
import { EntryProps } from "@shared/types";
export const WheelSpinner = observer(
  ({
    wheelEntries,
    setIsWinner,
    setIsOnWheel,
    children,
  }: {
    wheelEntries: EntryProps[];
    setIsWinner: EntryIdBoolFunction;
    setIsOnWheel: EntryIdBoolFunction;
    children?: React.ReactNode;
  }) => {
    const [opened, { open, close }] = useDisclosure(false);
    return (
      <div className={styles["c-wheel-spinner"]}>
        <div className={styles["wheel-container"]}>
          <Wheel
            wheelEntries={wheelEntries}
            rotation={wheelState$.rotation.get()}
            emptyState={
              <Text size="xl">
                Add some items to the wheel! <br></br> Enable or disable
                submissions by clicking on the settings cog
              </Text>
            }
          />
          <div className={styles["wheel-indicator"]}>◄</div>{" "}
          {/* ◀ for for rounding*/}
        </div>
        <Group justify="center">
          <Button
            m="md"
            size="lg"
            onClick={() => doSpin(wheelEntries, open, setIsWinner)}
            disabled={wheelEntries.length === 0 || wheelState$.isRotating.get()}
          >
            Spin me
          </Button>
          {children}
        </Group>

        <Modal
          opened={opened}
          onClose={close}
          centered
          withCloseButton={false}
          shadow="lg"
        >
          <Group>
            <Title mx="sm" component="div">
              🎉
            </Title>
            <Stack pr="sm" pt="xs">
              <Title size="h2" component="p">
                {wheelState$.winningEntry.text.get()}
              </Title>
              <Text>Submitted by {wheelState$.winningEntry.author.get()}</Text>
              {/* TODO: maybe show the users badges and chat name color? */}
            </Stack>
          </Group>
          <Group mt="xl" justify="flex-end">
            <Button onClick={close} color="gray.7">
              Close
            </Button>
            <Button
              onClick={() => {
                setIsOnWheel(wheelState$.winningEntry.id.peek(), false);
                close();
              }}
            >
              Remove Entry
            </Button>
          </Group>
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
  const { winningEntry, rotation } = calculateWheelSpin(
    wheelEntries,
    wheelState$.rotation.peek(),
  );
  wheelState$.winningEntry.set(winningEntry);
  wheelState$.rotation.set(rotation);
  wheelState$.isRotating.set(true);
  setTimeout(() => {
    setIsWinner(winningEntry.id, true);
    open();
    fireworks();
    wheelState$.isRotating.set(false);
  }, SPIN_COMPLETION_DELAY);
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
