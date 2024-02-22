import {
  Accordion,
  Paper,
  SimpleGrid,
  Tabs,
  Text,
} from "@mantine/core";
import { EntryCard } from "../entry-card/entry-card";
import styles from "./entry-manager.module.scss";
import { getEntries } from "../../state/entry-state";

import EntryCreator from "../entry-creator/entry-creator";
import { EntryProps } from "@shared/types";
import { CommandFunctions } from "../../state/commands";

interface EntryManagerProps {
  stateFunctions: CommandFunctions;
}
export const EntryManager = ({ stateFunctions }: EntryManagerProps) => {
  const { createEntry, deleteEntry, setIsOnWheel, setIsSafe } = stateFunctions;
  function createEntryCard(entry: EntryProps) {
    return (
      <EntryCard
        key={entry.id}
        entry={entry}
        entryActions={{
          deleteEntry,
          setIsOnWheel,
          setIsSafe,
        }}
      />
    );
  }
  const entries = getEntries();
  const safeEntries = entries.filter((entry) => entry.isSafe);
  const submissions = safeEntries
    .filter((entry) => !entry.isOnWheel && !entry.isWinner)
    .map((entry) => createEntryCard(entry));
  const winners = safeEntries
    .filter((entry) => entry.isWinner)
    .map((entry) => createEntryCard(entry));
  const wheelItems = safeEntries
    .filter((entry) => entry.isOnWheel)
    .map((entry) => createEntryCard(entry));
  const unsafe = entries
    .filter((entry) => !entry.isSafe)
    .map((entry) => createEntryCard(entry));
  return (
    <div className={styles["c-entry-manager"]}>
      <Tabs defaultValue="submissions">
        <Tabs.List grow>
          <Tabs.Tab value="wheel-items">
            On Wheel ({wheelItems.length})
          </Tabs.Tab>
          <Tabs.Tab value="submissions">
            Submissions ({submissions.length + unsafe.length})
          </Tabs.Tab>
          <Tabs.Tab value="winners">Past Winners ({winners.length})</Tabs.Tab>
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
          <Accordion defaultValue={["mod-approved", "dangerous"]} multiple>
            <Accordion.Item value="mod-approved">
              <Accordion.Control>
                Approved ({submissions.length})
              </Accordion.Control>
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
