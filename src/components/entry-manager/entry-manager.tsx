import { SimpleGrid, Tabs, Text } from "@mantine/core";
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
  const submissions = entryState$
    .get()
    .filter((entry) => !entry.isOnWheel && !entry.isWinner)
    .map((entry) => createEntryCard(entry));
  const winners = entryState$
    .get()
    .filter((entry) => entry.isWinner)
    .map((entry) => createEntryCard(entry));
  const wheelItems = entryState$
    .get()
    .filter((entry) => entry.isOnWheel)
    .map((entry) => createEntryCard(entry));
  return (
    <div className={styles["c-entry-manager"]}>
      <Tabs defaultValue="submissions">
        <Tabs.List grow>
          <Tabs.Tab value="wheel-items">Wheel Items</Tabs.Tab>
          <Tabs.Tab value="submissions">Submissions</Tabs.Tab>
          <Tabs.Tab value="winners">Past Winners</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="wheel-items" className={styles["entry-tab"]}>
          <SimpleGrid cols={1} spacing="sm" pt="md" mx="sm">
            {wheelItems.length === 0 ? (
              <Text size="lg">no items on wheel</Text>
            ) : (
              wheelItems
            )}
          </SimpleGrid>
        </Tabs.Panel>

        <Tabs.Panel value="submissions" className={styles["entry-tab"]}>
          <SimpleGrid cols={1} spacing="sm" pt="md" mx="sm">
            {submissions.length === 0 ? (
              <Text size="lg">no new submissions </Text>
            ) : (
              submissions
            )}
          </SimpleGrid>
        </Tabs.Panel>

        <Tabs.Panel value="winners" className={styles["entry-tab"]}>
          <SimpleGrid cols={1} spacing="sm" pt="md" mx="sm">
            {winners.length === 0 ? (
              <Text size="lg">no winners yet!</Text>
            ) : (
              winners
            )}
          </SimpleGrid>
        </Tabs.Panel>
      </Tabs>
    </div>
  );
};
