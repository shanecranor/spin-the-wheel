import { observer, useObservable } from "@legendapp/state/react";
import {
  Button,
  Flex,
  Modal,
  TextInput,
  Title,
  Text,
  Group,
  Blockquote,
  Stack,
} from "@mantine/core";
import { startWebSockets } from "../../state/websocket-manager";
import { webSocketCommands } from "../../state/websocket-commands";
import { useDisclosure } from "@mantine/hooks";
import { globalState$ } from "../../state/global-state";
const App = observer(() => {
  startWebSockets();
  const [opened, { close }] = useDisclosure(true);

  const text = useObservable("");
  return (
    <main>
      <Flex
        direction="column"
        align="center"
        justify="center"
        style={{ height: "100vh" }}
      >
        <Title>Submit an item to the wheel</Title>
        <TextInput
          m="sm"
          size="md"
          label="Enter an item to add to the wheel"
          placeholder="end stream"
          value={text.get()}
          onChange={(e) => text.set(e.currentTarget.value)}
        />
        <Button
          m="xs"
          onClick={() => {
            webSocketCommands.createEntry({
              id: crypto.randomUUID(),
              text: text.peek(),
              author: "anonymous",
              isSafe: false,
              isOnWheel: false,
            });
          }}
        >
          Add to wheel (100 sparks)
        </Button>
      </Flex>
      <Modal opened={opened} onClose={close} withCloseButton={false} centered>
        <Stack p="md">
          <Title>Rules for wheel entries</Title>
          <Blockquote p="sm">
            {globalState$.rules.get() ||
              "creator hasn't submitted any rules yet"}
          </Blockquote>
          <Text>
            By submitting an entry to the wheel, you agree to the rules set by
            the creator. Entries that violate the rules may be removed.
          </Text>
          <Group justify="flex-end" pt="md">
            <Button m="md" onClick={close}>
              lets do it
            </Button>
          </Group>
        </Stack>
      </Modal>
    </main>
  );
});

export default App;
