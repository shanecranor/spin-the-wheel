import { observer } from "@legendapp/state/react";
import { webSocketCommands } from "../../state/websocket-commands";
import { Modal, Stack, Title, Text, Button, Group } from "@mantine/core";
import { getEntries } from "../../state/entry-state";
import { EntryCard } from "../../components/entry-card/entry-card";
import { startWebSockets } from "../../state/websocket-manager";
import { useDisclosure } from "@mantine/hooks";
const App = observer(() => {
  const [opened, { close }] = useDisclosure(true); //start websockets
  startWebSockets();
  const unapproved = getEntries().filter((entry) => !entry.isSafe);
  return (
    <main>
      <Modal
        opened={opened}
        onClose={close}
        withCloseButton={false}
        centered
        overlayProps={{ blur: 7 }}
        shadow="md"
      >
        <Text m="sm">
          This page contains unreviewed submissions. Ensure this window isn't on
          stream before closing this message to unblur the page.
        </Text>
        <Group justify="flex-end">
          <Button m="md" onClick={close}>
            Show
          </Button>
        </Group>
      </Modal>

      <Title m="md">Moderation Queue</Title>
      <Stack gap="md" m="md">
        {unapproved.map((entry) => (
          <EntryCard
            key={entry.id}
            entry={entry}
            entryActions={webSocketCommands}
          />
        ))}
      </Stack>
    </main>
  );
});

export default App;
