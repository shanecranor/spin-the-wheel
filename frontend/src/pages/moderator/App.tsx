import { observer } from "@legendapp/state/react";
import { webSocketCommands } from "../../state/websocket-commands";
import { Stack, Title } from "@mantine/core";
import { getEntries } from "../../state/entry-state";
import { EntryCard } from "../../components/entry-card/entry-card";
import { startWebSockets } from "../../state/websocket-manager";
const App = observer(() => {
  //start websockets
  startWebSockets();
  const unapproved = getEntries().filter((entry) => !entry.isSafe);
  return (
    <main>
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
