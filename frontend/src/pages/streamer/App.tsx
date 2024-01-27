import "./App.scss";
import { EntryManager } from "../../components/entry-manager/entry-manager";
import { WheelSpinner } from "../../components/wheel-spinner/wheel-spinner";
import { getEntries } from "../../state/entry-state";
import { observer } from "@legendapp/state/react";
import {
  AppShell,
  Button,
  Modal,
  Textarea,
  Text,
  Title,
  Stack,
  Switch,
  Group,
  ActionIcon,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { localCommands } from "../../state/local-commands";
import { EntryProps } from "@shared/types";
import { webSocketCommands } from "../../state/websocket-commands";
import { CommandFunctions } from "../../state/commands";
import {
  isWebSocketOpen$,
  startWebSockets,
} from "../../state/websocket-manager";
import { globalState$ } from "../../state/global-state";
import { IconSettings } from "@tabler/icons-react";
import { accessToken$ } from "../../truffle-sdk";
import { FullPageInfoMessage } from "../../components/full-page-info-message/full-page-info-message";
// import { IconSettings } from "@tabler/icons-react";
const App = observer(() => {
  const params = new URLSearchParams(window.location.search);
  const mode = params.get("mode") || "websockets";
  if (mode === "websockets") {
    startWebSockets();
  }
  const [isSidebarOpen, { toggle: toggleDesktop }] = useDisclosure();
  const [settingsOpened, { open: openSettings, close: closeSettings }] =
    useDisclosure(true);
  const closeSettingsAndSave = () => {
    commands.setRules(globalState$.rules.get());
    closeSettings();
  };

  const commands: CommandFunctions =
    mode === "offline" ? localCommands : webSocketCommands;

  // don't show the interface until we have an access token or websocket
  const accessToken = accessToken$.get();
  if (typeof accessToken !== "string") {
    return (
      <FullPageInfoMessage message="waiting for admin access token"></FullPageInfoMessage>
    );
  }
  if (isWebSocketOpen$.get() === false) {
    return (
      <FullPageInfoMessage message="admin panel disconnected from websocket">
        <Button onClick={() => startWebSockets()}>try to reconnect</Button>
      </FullPageInfoMessage>
    );
  }

  return (
    <AppShell
      // withBorder={false}
      padding="md"
      // header={{ height: 60 }}
      aside={{
        width: 500,
        breakpoint: "sm",
        collapsed: { mobile: isSidebarOpen, desktop: isSidebarOpen },
      }}
    >
      {/* <AppShell.Header>Header</AppShell.Header> */}
      <AppShell.Aside>
        <Button
          variant="outline"
          color="pink.3"
          mx="sm"
          mt="sm"
          onClick={toggleDesktop}
        >
          hide wheel manager
        </Button>
        <EntryManager stateFunctions={commands} />
      </AppShell.Aside>
      <AppShell.Main>
        <Modal
          opened={settingsOpened}
          onClose={closeSettingsAndSave}
          size="lg"
          withCloseButton={false}
          centered
        >
          <Stack p="lg">
            <Title>Game Settings</Title>
            <Textarea
              size="md"
              label="Rules/Criteria"
              description="What can viewers submit? (and what shouldn't they submit)"
              placeholder="No rules yet"
              minRows={2}
              autosize
              value={globalState$.rules.get()}
              onChange={(event) => {
                globalState$.rules.set(event.currentTarget.value);
              }}
            />
            <Title order={2}>Game Status</Title>
            <div>
              <Group>
                <Switch
                  label={
                    <Text>
                      Viewer entry submissions are currently{" "}
                      <Text c="pink" span>
                        {globalState$.isAcceptingEntries.get()
                          ? "enabled"
                          : "disabled"}
                      </Text>
                    </Text>
                  }
                  checked={globalState$.isAcceptingEntries.get()}
                  onChange={(event) => {
                    commands.setIsAcceptingEntries(event.currentTarget.checked);
                  }}
                />
              </Group>
              <Switch
                label={
                  <Text>
                    The game is currently{" "}
                    <Text c="pink" span>
                      {globalState$.isGameStarted.get()
                        ? "started"
                        : "not started"}
                    </Text>
                  </Text>
                }
                checked={globalState$.isGameStarted.get()}
                onChange={(event) => {
                  commands.setIsGameStarted(event.currentTarget.checked);
                }}
              />
            </div>
            <Group justify="end" mt="lg">
              <Button variant="default" onClick={closeSettingsAndSave}>
                Close
              </Button>
              <Button
                onClick={() => {
                  closeSettingsAndSave();
                  commands.setIsAcceptingEntries(true);
                  commands.setIsGameStarted(true);
                }}
              >
                Start game and enable submissions
              </Button>
            </Group>
          </Stack>
        </Modal>
        <div className="wheel">
          <div className="wheel-container">
            <WheelSpinner
              wheelEntries={getActiveSlices(getEntries())}
              setIsWinner={commands.setIsWinner}
              setIsOnWheel={commands.setIsOnWheel}
            >
              <ActionIcon size="48px" onClick={() => openSettings()}>
                <IconSettings
                  style={{ width: "70%", height: "70%" }}
                  stroke={1}
                />
              </ActionIcon>
            </WheelSpinner>
          </div>
        </div>
        {isSidebarOpen && (
          <Button className="sidebar-button" m="sm" onClick={toggleDesktop}>
            open wheel manager
          </Button>
        )}
      </AppShell.Main>
    </AppShell>
  );
  // return (
  //   <main>
  //     <div className="wheel">
  //       <h1>Spin the Wheel</h1>
  //       <WheelSpinner slices={getActiveSlices(entryState$.get())} />
  //       <div className="wheel-controls">
  //         <button>Open Submissions</button>
  //         <button>Close Submissions</button>
  //         <button>Settings</button>
  //         <div className="settings">
  //           {/* <button>import</button>
  //           <button>export</button>
  //           <button>restore removed entries</button>
  //           <button>clear all submissions</button>
  //           <label>
  //             remove slice after spin?
  //             <input type="checkbox" />
  //           </label> */}
  //         </div>
  //       </div>
  //     </div>

  //     <aside className="wheel-items">
  //       {/* open close menu button (autohide once playing?) */}
  //       <EntryManager />
  //     </aside>
  //   </main>
  // );
});

function getActiveSlices(entries: EntryProps[]) {
  return entries.filter((entry) => entry.isOnWheel);
}
export default App;
