import styles from "./entry-card.module.scss"
export interface EntryCardProps {
  text: string;
  author: string;
  // isSafe: boolean; //mod approved
  isOnWheel: boolean;
  onAccept: () => void;
  onRemove: () => void;
  onDelete: () => void;
}
export const EntryCard = ({ text, author, isOnWheel, onAccept, onRemove, onDelete }: EntryCardProps) => {
  return (
    <div className={styles["c-entry-card"]}>
      <div className={styles["text-container"]}>
        <div className={styles["entry-text"]}>{text}</div>
        <div className={styles["entry-author"]}>{author}</div>
      </div>
      <div className={styles["entry-controls"]}>
        {/* lets make a checkbox here for accept and remove */}
        <input className={styles["on-wheel"]} type="checkbox" checked={isOnWheel} onChange={(e) => {
          if (e.target.value) {
            onAccept()
          } else {
            onRemove()
          }
        }} />
        <button className={styles["delete-button"]} onClick={() => onDelete()}>
          Delete Entry
        </button>
      </div>
    </div>
  )
}