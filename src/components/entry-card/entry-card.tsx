import { Checkbox, CloseButton, Paper, Text } from "@mantine/core";
import styles from "./entry-card.module.scss"
export interface EntryCardProps {
  text: string;
  author: string;
  // isSafe: boolean; //mod approved
  isOnWheel?: boolean;
  onAccept?: () => void;
  onRemove?: () => void;
  onDelete?: () => void;
}
// TODO: remove placehold functions
export const EntryCard = ({ text, author, isOnWheel = true, onAccept = () => (0), onRemove = () => (0), onDelete = () => (0) }: EntryCardProps) => {
  return (
    <Paper withBorder className={styles["c-entry-card"]}>
      <div className={styles["entry-text"]}>
        <Text size="lg" truncate="end">{text}</Text>
        <Text size="xs" truncate="end">{author}</Text>
      </div>
      <div className={styles["entry-controls"]}>
        {/* lets make a checkbox here for accept and remove */}
        <Checkbox color="green.5" size="lg" checked={isOnWheel} onChange={(e) => {
          if (e.target.value) {
            onAccept()
          } else {
            onRemove()
          }
        }} />
        <CloseButton size="lg" aria-label="delete this entry" onClick={onDelete} />
      </div>
    </Paper>
  )
}