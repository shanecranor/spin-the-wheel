import { Title } from "@mantine/core";
import { EntryCard } from "../entry-card/entry-card";
import styles from "./entry-manager.module.scss";
import { EntryProps, entryState$ } from "./entry-state";

function createEntryCard(entry: EntryProps) {
  // create the functions required for each card here
  const toggleOnWheel = () => {
    entryState$.set((old) =>
      old.map((oldEntry) => {
        if (oldEntry.id === entry.id) {
          return {
            ...oldEntry,
            isOnWheel: !oldEntry.isOnWheel,
          };
        }
        return oldEntry;
      })
    );
  };
  return (
    <EntryCard key={entry.id} entry={entry} toggleOnWheel={toggleOnWheel} />
  );
}

export const EntryManager = () => {
  return (
    <div className={styles["c-entry-manager"]}>
      <div className={styles["approved-entries"]}>
        <Title component="p" size="h2">
          Wheel items
        </Title>
        {entryState$
          .get()
          .filter((entry) => entry.isOnWheel)
          .map((entry) => createEntryCard(entry))}
      </div>
      <div className={styles["approved-entries"]}>
        <Title component="p" size="h2">
          Wheel Submissions
        </Title>
        {entryState$
          .get()
          .filter((entry) => !entry.isOnWheel)
          .map((entry) => createEntryCard(entry))}
      </div>
      {/* Add item form */}
      {/* Moderator approved items */}
      {/* Unapproved items */}
    </div>
  );
};
