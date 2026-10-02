import { observer } from "@legendapp/state/react";
import type { ObservableObject } from "@legendapp/state";
import { Button, Group, Text, Title } from "@mantine/core";
import type { EntryProps } from "@shared/types";
import { Wheel } from "../wheel/wheel";
import { SPIN_DURATION } from "../wheel/wheel-spin";
import type { WheelState } from "./wheel-state";
import styles from "./wheel-card.module.scss";

interface Props {
  id: string;
  title: string;
  state$: ObservableObject<WheelState>;
  entries: EntryProps[];
  resultSuffix?: string;
  onSpin: () => void;
  onToggleLock: () => void;
}

function resultText(wheel: WheelState, suffix: string): string {
  if (wheel.isRotating) return "Spinning…";
  if (!wheel.winningEntry) return "—";
  return `${wheel.winningEntry.text}${suffix}`;
}

export const WheelCard = observer(
  ({
    id,
    title,
    state$,
    entries,
    resultSuffix = "",
    onSpin,
    onToggleLock,
  }: Props) => {
    const wheel = state$.get();
    return (
      <section
        className={styles.panel}
        aria-labelledby={`${id}-title`}
        aria-busy={wheel.isRotating}
      >
        <Title id={`${id}-title`} order={2} size="h4">
          {title}
        </Title>
        <div className={styles.wheel}>
          <div className={styles.disc}>
            <Wheel
              wheelEntries={entries}
              rotation={wheel.rotation}
              compact
              spinDuration={wheel.isRotating ? SPIN_DURATION : 0}
            />
          </div>
          <span className={styles.pointer} aria-hidden="true" />
        </div>
        <Text className={styles.result} aria-live="polite" aria-atomic="true">
          {resultText(wheel, resultSuffix)}
        </Text>
        <Group justify="center" gap="sm">
          <Button
            variant="light"
            disabled={wheel.locked || wheel.isRotating}
            onClick={onSpin}
            aria-label={`Spin ${title.toLowerCase()}`}
          >
            Spin
          </Button>
          <Button
            variant={wheel.locked ? "filled" : "default"}
            disabled={!wheel.winningEntry || wheel.isRotating}
            aria-pressed={wheel.locked}
            aria-label={`${wheel.locked ? "Unlock" : "Lock"} ${title.toLowerCase()}`}
            onClick={onToggleLock}
          >
            {wheel.locked ? "Locked" : "Lock"}
          </Button>
        </Group>
      </section>
    );
  },
);
