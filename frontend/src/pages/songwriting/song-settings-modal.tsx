import { useState } from "react";
import {
  Button,
  Checkbox,
  Group,
  Modal,
  NumberInput,
  Stack,
  Text,
} from "@mantine/core";
import {
  defaultSettings,
  INSTRUMENTS,
  NOTES,
  SCALES,
  settingsError,
} from "./song-state";
import type { Settings } from "./song-state";
import styles from "./song-settings-modal.module.scss";

interface Props {
  settings: Settings;
  onApply: (settings: Settings) => void;
  onClose: () => void;
}

export function SongSettingsModal({ settings, onApply, onClose }: Props) {
  const [draft, setDraft] = useState(settings);
  const [draftError, setDraftError] = useState<string | null>(null);

  function toggleChoice(
    key: "scales" | "notes" | "instruments",
    value: string,
    allowed: string[],
  ) {
    setDraft((old) => ({
      ...old,
      [key]: allowed.filter((item) =>
        item === value ? !old[key].includes(item) : old[key].includes(item),
      ),
    }));
    setDraftError(null);
  }

  return (
    <Modal opened onClose={onClose} title="Settings" centered size="md">
      <Stack gap="lg">
        {(
          [
            ["scales", "Scales", SCALES],
            ["notes", "Root notes", NOTES],
            ["instruments", "Instruments", INSTRUMENTS],
          ] as const
        ).map(([key, title, allowed]) => (
          <fieldset className={styles.choices} key={key}>
            <legend>{title}</legend>
            <div className={key === "notes" ? styles.notes : styles.options}>
              {allowed.map((value) => (
                <Checkbox
                  key={value}
                  label={value}
                  checked={draft[key].includes(value)}
                  onChange={() => toggleChoice(key, value, [...allowed])}
                />
              ))}
            </div>
          </fieldset>
        ))}
        <fieldset className={styles.choices}>
          <legend>Tempo</legend>
          <Group grow align="flex-start">
            <NumberInput
              label="Minimum BPM"
              min={40}
              max={240}
              step={5}
              allowDecimal={false}
              value={Number.isFinite(draft.minTempo) ? draft.minTempo : ""}
              onChange={(value) => {
                setDraft({
                  ...draft,
                  minTempo: value === "" ? NaN : Number(value),
                });
                setDraftError(null);
              }}
            />
            <NumberInput
              label="Maximum BPM"
              min={40}
              max={240}
              step={5}
              allowDecimal={false}
              value={Number.isFinite(draft.maxTempo) ? draft.maxTempo : ""}
              onChange={(value) => {
                setDraft({
                  ...draft,
                  maxTempo: value === "" ? NaN : Number(value),
                });
                setDraftError(null);
              }}
            />
          </Group>
          <Text size="sm" c="dimmed" mt="xs">
            40-240 BPM, in steps of 5.
          </Text>
        </fieldset>
        {draftError && (
          <Text c="red" size="sm" role="alert">
            {draftError}
          </Text>
        )}
        <Group justify="space-between">
          <Button
            variant="subtle"
            onClick={() => {
              setDraft(defaultSettings());
              setDraftError(null);
            }}
          >
            Reset defaults
          </Button>
          <Group gap="sm">
            <Button variant="default" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                const error = settingsError(draft);
                if (error) {
                  setDraftError(error);
                  return;
                }
                onApply(draft);
                onClose();
              }}
            >
              Apply
            </Button>
          </Group>
        </Group>
      </Stack>
    </Modal>
  );
}
