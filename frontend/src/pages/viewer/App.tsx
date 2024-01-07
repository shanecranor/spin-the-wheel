import { observer, useObservable } from "@legendapp/state/react";
import { Button, Flex, TextInput, Title } from "@mantine/core";
import { startWebSockets } from "../../state/websocket-manager";
import { webSocketCommands } from "../../state/websocket-commands";
const App = observer(() => {
  startWebSockets();
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
    </main>
  );
});

export default App;
