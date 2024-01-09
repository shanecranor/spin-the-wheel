// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
import "./App.scss";
import { EntryManager } from "../../components/entry-manager/entry-manager";
import { WheelSpinner } from "../../components/wheel-spinner/wheel-spinner";
import { getEntries } from "../../state/entry-state";
import { observer } from "@legendapp/state/react";
import { AppShell, Button } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { localCommands } from "../../state/local-commands";
import { EntryProps } from "@shared/types";
import { webSocketCommands } from "../../state/websocket-commands";
import { CommandFunctions } from "../../state/commands";
import { startWebSockets } from "../../state/websocket-manager";
// import { IconSettings } from "@tabler/icons-react";
const App = observer(() => {
  // const [mobileOpened, { toggle: toggleMobile }] = useDisclosure();
  const [isSidebarOpen, { toggle: toggleDesktop }] = useDisclosure();
  const params = new URLSearchParams(window.location.search);
  const mode = params.get("mode") || "websockets";
  if (mode === "websockets") {
    startWebSockets();
  }
  const commands: CommandFunctions =
    mode === "offline" ? localCommands : webSocketCommands;
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
        <div className="wheel">
          <div className="wheel-container">
            <WheelSpinner
              wheelEntries={getActiveSlices(getEntries())}
              setIsWinner={commands.setIsWinner}
              setIsOnWheel={commands.setIsOnWheel}
            />
          </div>
          <div className="wheel-controls">
            {/* <Button>Enable Submissions</Button>
            <ActionIcon>
              <IconSettings />
            </ActionIcon> */}
            <div className="settings">
              {/* <button>import</button>
            <button>export</button>
            <button>restore removed entries</button>
            <button>clear all submissions</button>
            <label>
              remove slice after spin?
              <input type="checkbox" />
            </label> */}
            </div>
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
