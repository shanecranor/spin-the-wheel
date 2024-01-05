import {
  // Checkbox,
  // CheckboxProps,
  Paper,
  Text,
  ActionIcon,
} from "@mantine/core";
import {
  // IconAdjustments,
  IconX,
  IconCheck,
  IconTrash,
} from "@tabler/icons-react";
import styles from "./entry-card.module.scss";
import { EntryProps } from "@shared/types";
import { EntryIdBoolFunction, EntryIdFunction } from "../../state/commands";
export interface EntryCardProps {
  entry: EntryProps;
  setIsOnWheel: EntryIdBoolFunction;
  deleteEntry: EntryIdFunction;
}
// TODO: remove placehold functions
export const EntryCard = ({
  entry,
  setIsOnWheel,
  deleteEntry,
}: EntryCardProps) => {
  // const CheckboxIcon: CheckboxProps["icon"] = (others) => (
  //   <IconCheck {...others} />
  // );
  const { text, author, isOnWheel, isWinner } = entry;
  return (
    <Paper
      withBorder
      className={`${styles["c-entry-card"]} ${isOnWheel && "on-wheel"} ${
        isWinner && "winner"
      }`}
    >
      <div className={styles["entry-text"]}>
        <Text size="lg">{text}</Text>
        <Text size="xs">{author}</Text>
      </div>
      <div className={styles["entry-controls"]}>
        {/* lets make a checkbox here for accept and remove */}
        {/* <Checkbox
          icon={CheckboxIcon}
          color="green.5"
          size="lg"
          checked={isOnWheel}
          onChange={() => {
            setIsOnWheel();
          }}
        /> */}
        {isOnWheel ? (
          <ActionIcon
            variant="subtle"
            color="gray"
            size="lg"
            aria-label="remove from wheel"
            onClick={() => setIsOnWheel(entry.id, false)}
          >
            <IconX />
          </ActionIcon>
        ) : (
          <>
            <ActionIcon
              variant="subtle"
              color="green.4"
              size="lg"
              aria-label="add to wheel"
              onClick={() => setIsOnWheel(entry.id, true)}
            >
              <IconCheck />
            </ActionIcon>
            <ActionIcon
              variant="subtle"
              color="red.4"
              size="lg"
              aria-label="delete entry"
            >
              <IconTrash onClick={() => deleteEntry(entry.id)} />
            </ActionIcon>
          </>
        )}
      </div>
    </Paper>
  );
};
