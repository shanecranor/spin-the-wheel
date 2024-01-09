import { Paper, Text, ActionIcon } from "@mantine/core";
import { IconX, IconCheck, IconPlus, IconTrash } from "@tabler/icons-react";
import styles from "./entry-card.module.scss";
import { EntryProps } from "@shared/types";
import { EntryIdBoolFunction, EntryIdFunction } from "../../state/commands";
export interface EntryCardProps {
  entry: EntryProps;
  entryActions: {
    setIsOnWheel: EntryIdBoolFunction;
    deleteEntry: EntryIdFunction;
    setIsSafe: EntryIdBoolFunction;
  };
}
// TODO: remove placehold functions
export const EntryCard = ({
  entry,
  entryActions: { setIsOnWheel, deleteEntry, setIsSafe },
}: EntryCardProps) => {
  // const CheckboxIcon: CheckboxProps["icon"] = (others) => (
  //   <IconCheck {...others} />
  // );
  const { text, author, isOnWheel, isSafe, isWinner } = entry;
  const RemoveFromWheelButton = () => (
    <ActionIcon
      variant="subtle"
      color="gray"
      size="lg"
      aria-label="remove from wheel"
      onClick={() => setIsOnWheel(entry.id, false)}
    >
      <IconX />
    </ActionIcon>
  );
  const AddToWheelButton = () => (
    <ActionIcon
      variant="subtle"
      color="gray"
      size="lg"
      aria-label="add to wheel"
      onClick={() => setIsOnWheel(entry.id, true)}
    >
      <IconPlus />
    </ActionIcon>
  );
  const DeleteButton = () => (
    <ActionIcon
      variant="subtle"
      color="red.4"
      size="lg"
      aria-label="delete entry"
    >
      <IconTrash onClick={() => deleteEntry(entry.id)} />
    </ActionIcon>
  );
  const SetSafeButton = () => (
    <ActionIcon
      variant="subtle"
      color="green.4"
      size="lg"
      aria-label="set safe"
      onClick={() => setIsSafe(entry.id, true)}
    >
      <IconCheck />
    </ActionIcon>
  );

  const EntryControls = () => {
    if (isOnWheel) {
      return <RemoveFromWheelButton />;
    } else if (!isSafe) {
      return (
        <>
          <SetSafeButton />
          <DeleteButton />
        </>
      );
    } else {
      return (
        <>
          <AddToWheelButton />
          <DeleteButton />
        </>
      );
    }
  };
  return (
    <Paper
      withBorder
      className={`${styles["c-entry-card"]} ${isOnWheel && "on-wheel"} ${
        isWinner && "winner"
      }`}
    >
      <div className={styles["party-icon"]}>{isWinner && "🎉 "}</div>
      <div className={styles["entry-text"]}>
        <Text size="lg">{text}</Text>
        <Text size="xs">{author}</Text>
      </div>
      <div className={styles["entry-controls"]}>
        <EntryControls />
      </div>
    </Paper>
  );
};
