import { observer } from "@legendapp/state/react";
import { webSocketCommands } from "../../state/websocket-commands";
import { Modal, Stack, Title, Text, Button, Group } from "@mantine/core";
import { getEntries } from "../../state/entry-state";
import { EntryCard } from "../../components/entry-card/entry-card";
import {
  isWebSocketOpen$,
  startWebSockets,
} from "../../state/websocket-manager";
import { useDisclosure } from "@mantine/hooks";
import { getErrorMessage } from "../../components/error-page/error-page";
import { globalState$ } from "../../state/global-state";
import { accessToken$ } from "../../truffle-sdk";
const App = observer(() => {
  const [opened, { close }] = useDisclosure(true); //start websockets
  startWebSockets();
  const unapproved = getEntries().filter((entry) => !entry.isSafe);
  const errorMessage = getErrorMessage(
    accessToken$.get(),
    isWebSocketOpen$.get(),
    globalState$.get()
  );
  return (
    errorMessage || (
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
            This page contains unreviewed submissions. Ensure this window isn't
            on stream before closing this message to unblur the page.
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
    )
  );
});

export default App;
