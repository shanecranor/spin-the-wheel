import { observer, useObservable } from "@legendapp/state/react";
import {
  Button,
  TextInput,
  Title,
  Text,
  Group,
  Blockquote,
  Stack,
  Tabs,
} from "@mantine/core";
import {
  isWebSocketOpen$,
  startWebSockets,
} from "../../state/websocket-manager";
// import { webSocketCommands } from "../../state/websocket-commands";
import { globalState$ } from "../../state/global-state";
import { embed, accessToken$ } from "../../truffle-sdk";
import { createViewerEntry } from "../../state/viewer-commands";
import { getErrorMessage } from "../../components/error-page/error-page";
// import { OrgMemberPayload, getMtClient } from "@trufflehq/sdk";
// import { useEffect, useMemo, useState } from "react";
const App = observer(() => {
  // const mtClient = useMemo(() => getMtClient(), []);
  // const [orgMember, setOrgMember] = useState<OrgMemberPayload>();
  // useEffect(() => {
  //   mtClient?.getOrgMember().then((orgMember) => setOrgMember(orgMember));
  //   // mtClient?.getRoles().then((roles) => setRoles(roles));
  // }, []);
  const activeTab = useObservable("Rules");
  const text = useObservable("");
  const hasAlerted = useObservable(false);
  const errorMessage = getErrorMessage(
    accessToken$.get(),
    isWebSocketOpen$.get(),
    globalState$.get()
  );
  startWebSockets();
  // alert the user once on page load
  if (!errorMessage && !hasAlerted.get()) {
    embed.showToast({
      title: "Spin The Wheel",
      body: "Entries are open for spin the wheel!",
      onClick: () => {
        embed.openWindow();
      },
    });
    hasAlerted.set(true);
  }

  return (
    <main>
      {errorMessage || (
        <Tabs value={activeTab.get()} onChange={(e) => activeTab.set(e)}>
          <Tabs.List>
            <Tabs.Tab value="Rules">Rules</Tabs.Tab>
            <Tabs.Tab value="Submit">Submit</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="Rules">
            <Stack p="lg">
              <Title>Rules for wheel entries</Title>
              <Blockquote p="sm">
                {globalState$.rules.get() ||
                  "creator hasn't submitted any rules yet"}
              </Blockquote>
              <Text>
                By submitting an entry to the wheel, you agree to the rules set
                by the creator. Entries that violate the rules may be removed.
              </Text>
              <Group justify="flex-end" pt="md">
                <Button m="md" onClick={() => activeTab.set("Submit")}>
                  lets do it
                </Button>
              </Group>
            </Stack>
          </Tabs.Panel>
          <Tabs.Panel value="Submit">
            {/* <Flex
        direction="column"
        align="center"
        justify="center"
        style={{ height: "100vh" }}
      > */}
            <Stack p="lg">
              <Title>Submit an item to the wheel</Title>
              <TextInput
                size="md"
                label="Enter an item to add to the wheel"
                placeholder="end stream"
                value={text.get()}
                onChange={(e) => text.set(e.currentTarget.value)}
              />
              {/* This is broken for some reason... will try to fix later */}
              {/* <Text>
                This entry will be attached to your Truffle username:{" "}
                {orgMember ? orgMember.name : "Anonymous"}
              </Text> */}
              <Button
                m="xs"
                onClick={async () => {
                  const isSuccess = await createViewerEntry(text.get());
                  if (isSuccess) {
                    text.set("");
                    alert("Entry Submitted!");
                  }
                }}
              >
                Submit to wheel
              </Button>
            </Stack>
          </Tabs.Panel>
        </Tabs>
      )}
    </main>
  );
});

export default App;
