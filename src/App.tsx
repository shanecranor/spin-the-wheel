// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
import "./App.scss";
import { EntryManager } from "./components/entry-manager/entry-manager";
import { WheelSpinner } from "./components/wheel-spinner/wheel-spinner";
import {
  EntryProps,
  entryState$,
} from "./components/entry-manager/entry-state";
import { observer } from "@legendapp/state/react";
import { SliceData } from "./components/wheel/types";
import { ActionIcon, AppShell, Button } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconSettings } from "@tabler/icons-react";
const App = observer(() => {
  // const [mobileOpened, { toggle: toggleMobile }] = useDisclosure();
  const [isSidebarOpen, { toggle: toggleDesktop }] = useDisclosure();
  return (
    <AppShell
      // withBorder={false}
      padding="md"
      // header={{ height: 60 }}
      aside={{
        width: 400,
        breakpoint: "sm",
        collapsed: { mobile: !isSidebarOpen, desktop: !isSidebarOpen },
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
        <EntryManager />
      </AppShell.Aside>
      <AppShell.Main>
        <div className="wheel">
          <h1>Spin the Wheel</h1>
          <div className="wheel-container">
            <WheelSpinner
              slices={getActiveSlices(entryState$.get())}
              setWinner={(id: number) =>
                entryState$.set((old) =>
                  old.map((entry) =>
                    entry.id === id ? { ...entry, isWinner: true } : entry
                  )
                )
              }
              removeWinner={(id: number) =>
                entryState$.set((old) =>
                  old.map((entry) =>
                    entry.id === id ? { ...entry, isOnWheel: false } : entry
                  )
                )
              }
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
        {!isSidebarOpen && (
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
  const activeEntries = entries.filter((entry) => entry.isOnWheel);
  return activeEntries.map(
    (entry: EntryProps): SliceData => ({
      id: entry.id,
      text: entry.text,
      weight: 1,
    })
  );
}
export default App;
