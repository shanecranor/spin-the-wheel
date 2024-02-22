import "./App.scss";
import { EntryManager } from "../../components/entry-manager/entry-manager";
import { WheelSpinner } from "../../components/wheel-spinner/wheel-spinner";
import { getEntries } from "../../state/entry-state";
import { observer } from "@legendapp/state/react";
import { AppShell, Button } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { localCommands } from "../../state/local-commands";
import { EntryProps } from "@shared/types";
import { CommandFunctions } from "../../state/commands";

// import { IconSettings } from "@tabler/icons-react";
// import { SettingsModal } from "../../components/settings-modal/settings-modal";
// import { IconSettings } from "@tabler/icons-react";
const App = observer(() => {
  const [isSidebarOpen, { toggle: toggleSidebar }] = useDisclosure(false);

  const commands: CommandFunctions = localCommands
  return (
    <AppShell
      // withBorder={false}
      padding="md"
      // header={{ height: 60 }}
      aside={{
        width: 500,
        breakpoint: "sm",
        collapsed: { mobile: !isSidebarOpen, desktop: !isSidebarOpen },
      }}
    >
      <AppShell.Aside>
        <Button
          variant="outline"
          color="pink.3"
          mx="sm"
          mt="sm"
          onClick={toggleSidebar}
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
            >
            </WheelSpinner>
          </div>
        </div>
        {!isSidebarOpen && (
          <Button className="sidebar-button" m="sm" onClick={toggleSidebar}>
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
