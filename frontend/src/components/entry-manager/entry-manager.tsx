import { Accordion, Paper, SimpleGrid, Tabs, Text } from "@mantine/core";
import { EntryCard } from "../entry-card/entry-card";
import styles from "./entry-manager.module.scss";
import { entryState$ } from "./entry-state";

import EntryCreator from "../entry-creator/entry-creator";
import { EntryProps } from "@shared/types";

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
  const safeEntries = entryState$.get().filter((entry) => entry.isSafe);
  const submissions = safeEntries
    .filter((entry) => !entry.isOnWheel && !entry.isWinner)
    .map((entry) => createEntryCard(entry));
  const winners = safeEntries
    .filter((entry) => entry.isWinner)
    .map((entry) => createEntryCard(entry));
  const wheelItems = safeEntries
    .filter((entry) => entry.isOnWheel)
    .map((entry) => createEntryCard(entry));
  const unsafe = entryState$
    .get()
    .filter((entry) => !entry.isSafe)
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
          <Paper m="md" p="md" withBorder>
            <EntryCreator createEntry={createEntry} />
          </Paper>
          <Accordion defaultValue={["mod-approved"]} multiple>
            <Accordion.Item value="mod-approved">
              <Accordion.Control>Approved</Accordion.Control>
              <Accordion.Panel>
                <SimpleGrid cols={1} spacing="sm">
                  {submissions.length === 0 ? (
                    <Text size="lg">no new reviewed submissions </Text>
                  ) : (
                    submissions
                  )}
                </SimpleGrid>
              </Accordion.Panel>
            </Accordion.Item>
            <Accordion.Item value="dangerous">
              <Accordion.Control>Potentially Unsafe</Accordion.Control>
              <Accordion.Panel>
                <SimpleGrid cols={1} spacing="sm">
                  {unsafe.length === 0 ? (
                    <Text size="lg">no new unreviewed submissions </Text>
                  ) : (
                    submissions
                  )}
                </SimpleGrid>
              </Accordion.Panel>
            </Accordion.Item>
          </Accordion>
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

function getRandomInt() {
  const buffer = new Uint32Array(1);
  window.crypto.getRandomValues(buffer);
  return buffer[0];
}

const createEntry = (entryText: string) =>
  entryState$.set((old) => [
    ...old,
    {
      id: getRandomInt(),
      text: entryText,
      author: "you",
      isSafe: true,
      isOnWheel: true,
    },
  ]);
