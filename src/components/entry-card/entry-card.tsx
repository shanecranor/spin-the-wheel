import {
  Checkbox,
  CheckboxProps,
  CloseButton,
  Paper,
  Text,
} from "@mantine/core";
import { IconCheck } from "@tabler/icons-react";
import styles from "./entry-card.module.scss";
export interface EntryCardProps {
  text: string;
  author: string;
  // isSafe: boolean; //mod approved
  isOnWheel?: boolean;
  toggleOnWheel: () => void;
  onDelete?: () => void;
}
// TODO: remove placehold functions
export const EntryCard = ({
  text,
  author,
  toggleOnWheel,
  isOnWheel,
  onDelete = () => 0,
}: EntryCardProps) => {
  const CheckboxIcon: CheckboxProps["icon"] = (others) => (
    <IconCheck {...others} />
  );
  return (
    <Paper withBorder className={styles["c-entry-card"]}>
      <div className={styles["entry-text"]}>
        <Text size="lg" truncate="end">
          {text}
        </Text>
        <Text size="xs" truncate="end">
          {author}
        </Text>
      </div>
      <div className={styles["entry-controls"]}>
        {/* lets make a checkbox here for accept and remove */}
        <Checkbox
          icon={CheckboxIcon}
          color="green.5"
          size="lg"
          defaultChecked={isOnWheel}
          onChange={() => {
            toggleOnWheel();
          }}
        />
        <CloseButton
          size="lg"
          aria-label="delete this entry"
          onClick={onDelete}
        />
      </div>
    </Paper>
  );
};
