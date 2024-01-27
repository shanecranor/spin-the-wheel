import "./App.scss";
import { EntryManager } from "../../components/entry-manager/entry-manager";
import { WheelSpinner } from "../../components/wheel-spinner/wheel-spinner";
import { getEntries } from "../../state/entry-state";
import { observer } from "@legendapp/state/react";
import { AppShell, Button, ActionIcon } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { localCommands } from "../../state/local-commands";
import { EntryProps } from "@shared/types";
import { webSocketCommands } from "../../state/websocket-commands";
import { CommandFunctions } from "../../state/commands";
import {
  isWebSocketOpen$,
  startWebSockets,
} from "../../state/websocket-manager";
import { IconSettings } from "@tabler/icons-react";
import { accessToken$ } from "../../truffle-sdk";
import { FullPageInfoMessage } from "../../components/full-page-info-message/full-page-info-message";
import { SettingsModal } from "../../components/settings-modal/settings-modal";
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
        <SettingsModal
          opened={settingsOpened}
          commands={commands}
          close={closeSettings}
        />
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
});

function getActiveSlices(entries: EntryProps[]) {
  return entries.filter((entry) => entry.isOnWheel);
}
export default App;
