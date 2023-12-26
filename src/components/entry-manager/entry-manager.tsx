import { EntryCard } from "../entry-card/entry-card"
import styles from "./entry-manager.module.scss"
import { entryState$ } from "./entry-state"

export const EntryManager = () => {
  return (
    <div className={styles["c-entry-manager"]}>
      <div className={styles["approved-entries"]}>
        {entryState$.get().map((entry) => {
          // create the functions required for each card here :pog:

          return (<EntryCard text={entry.text} author={entry.author} />)
        })}
      </div>

      {/* Add item form */}
      {/* Moderator approved items */}
      {/* Unapproved items */}
    </div>
  )
}