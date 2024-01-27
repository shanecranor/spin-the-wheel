import { observer } from "@legendapp/state/react";
import {
  Modal,
  Stack,
  Title,
  Textarea,
  Group,
  Switch,
  Button,
  Text,
} from "@mantine/core";
import { globalState$ } from "../../state/global-state";
import { CommandFunctions } from "../../state/commands";

export const SettingsModal = observer(
  ({
    opened,
    commands,
    close,
  }: {
    opened: boolean;
    commands: CommandFunctions;
    close: () => void;
  }) => {
    const closeSettingsAndSave = () => {
      commands.setRules(globalState$.rules.get());
      close();
    };
    return (
      <Modal
        opened={opened}
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
    );
  }
);
