import { useEffect, useRef, useState } from "react";
import {
  Button,
  Checkbox,
  Group,
  Modal,
  NumberInput,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { Wheel } from "../../components/wheel/wheel";
import {
  applySettings,
  choicesFor,
  defaultSettings,
  entriesFor,
  INSTRUMENTS,
  NOTES,
  restoreState,
  SCALES,
  serializeState,
  settingsError,
  songPrompt,
  SPIN_DURATION,
  spinResult,
  STORAGE_KEY,
  TITLES,
  WHEEL_IDS,
} from "./song-state";
import type { Settings, SongState, WheelId } from "./song-state";
import styles from "./songwriting.module.scss";

function loadState(): SongState {
  try {
    return restoreState(localStorage.getItem(STORAGE_KEY));
  } catch {
    return restoreState(null);
  }
}

export default function App() {
  const [state, setState] = useState(loadState);
  const stateRef = useRef(state);
  const timers = useRef<
    Partial<Record<WheelId, ReturnType<typeof setTimeout>>>
  >({});
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [draft, setDraft] = useState<Settings>(state.settings);
  const [draftError, setDraftError] = useState<string | null>(null);
  const [copyStatus, setCopyStatus] = useState("");
  const [storageError, setStorageError] = useState(false);
  const reducedMotion = useRef(
    window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const spinning = WHEEL_IDS.some((id) => state.wheels[id].spinning);
  const prompt = songPrompt(state.wheels);
  const canSpinAll = WHEEL_IDS.some(
    (id) => !state.wheels[id].locked && !state.wheels[id].spinning,
  );

  function update(next: SongState) {
    stateRef.current = next;
    setState(next);
    setCopyStatus("");
  }

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, serializeState(state));
      setStorageError(false);
    } catch {
      setStorageError(true);
    }
  }, [state]);

  useEffect(
    () => () => {
      Object.values(timers.current).forEach(clearTimeout);
    },
    [],
  );

  function spin(ids: readonly WheelId[]) {
    const current = stateRef.current;
    const next = { ...current, wheels: { ...current.wheels } };
    const duration = reducedMotion.current ? 0 : SPIN_DURATION;
    for (const id of ids) {
      const wheel = current.wheels[id];
      if (wheel.locked || wheel.spinning) continue;
      const chosen = spinResult(
        choicesFor(id, current.settings),
        wheel.rotation,
      );
      next.wheels[id] = {
        ...wheel,
        rotation: chosen.rotation,
        spinning: duration > 0,
        result: duration ? wheel.result : chosen.result,
      };
      if (duration)
        timers.current[id] = setTimeout(() => {
          const latest = stateRef.current;
          update({
            ...latest,
            wheels: {
              ...latest.wheels,
              [id]: {
                ...latest.wheels[id],
                spinning: false,
                result: chosen.result,
              },
            },
          });
          delete timers.current[id];
        }, duration);
    }
    update(next);
  }

  function toggleLock(id: WheelId) {
    const current = stateRef.current;
    update({
      ...current,
      wheels: {
        ...current.wheels,
        [id]: { ...current.wheels[id], locked: !current.wheels[id].locked },
      },
    });
  }

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

  async function copyPrompt() {
    if (!prompt) return;
    try {
      await navigator.clipboard.writeText(prompt);
      setCopyStatus("Copied");
    } catch {
      setCopyStatus("Couldn’t copy. Select the result to copy it.");
    }
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Title order={1} size="h2">
          Song wheels
        </Title>
        <Group gap="sm">
          <Button
            variant="default"
            disabled={spinning}
            onClick={() => {
              setDraft(state.settings);
              setDraftError(null);
              setSettingsOpen(true);
            }}
          >
            Settings
          </Button>
          <Button
            onClick={() => spin(WHEEL_IDS)}
            disabled={spinning || !canSpinAll}
          >
            Spin all
          </Button>
        </Group>
      </header>

      <div className={styles.grid}>
        {WHEEL_IDS.map((id) => {
          const wheel = state.wheels[id];
          const choices = choicesFor(id, state.settings);
          return (
            <section
              key={id}
              className={styles.panel}
              aria-labelledby={`${id}-title`}
              aria-busy={wheel.spinning}
            >
              <Title id={`${id}-title`} order={2} size="h4">
                {TITLES[id]}
              </Title>
              <div className={styles.wheel}>
                <div className={styles.disc}>
                  <Wheel
                    wheelEntries={entriesFor(choices)}
                    rotation={wheel.rotation}
                    compact
                    spinDuration={wheel.spinning ? SPIN_DURATION : 0}
                  />
                </div>
                <span className={styles.pointer} aria-hidden="true" />
              </div>
              <Text
                className={styles.result}
                aria-live="polite"
                aria-atomic="true"
              >
                {wheel.spinning
                  ? "Spinning…"
                  : wheel.result
                    ? `${wheel.result}${id === "tempo" ? " BPM" : ""}`
                    : "—"}
              </Text>
              <Group justify="center" gap="sm">
                <Button
                  variant="light"
                  disabled={wheel.locked || wheel.spinning}
                  onClick={() => spin([id])}
                  aria-label={`Spin ${TITLES[id].toLowerCase()}`}
                >
                  Spin
                </Button>
                <Button
                  variant={wheel.locked ? "filled" : "default"}
                  disabled={!wheel.result || wheel.spinning}
                  aria-pressed={wheel.locked}
                  aria-label={`${wheel.locked ? "Unlock" : "Lock"} ${TITLES[id].toLowerCase()}`}
                  onClick={() => toggleLock(id)}
                >
                  {wheel.locked ? "Locked" : "Lock"}
                </Button>
              </Group>
            </section>
          );
        })}
      </div>

      <div className={styles.summary}>
        <Text size="xl" fw={500} aria-live="polite" aria-atomic="true">
          {prompt || "Spin the wheels to get your song constraints."}
        </Text>
        {prompt && (
          <Button variant="default" disabled={spinning} onClick={copyPrompt}>
            Copy result
          </Button>
        )}
      </div>
      <Text className={styles.status} size="sm" role="status">
        {copyStatus ||
          (storageError
            ? "Browser storage is unavailable. Settings won’t survive a reload."
            : "")}
      </Text>

      <Modal
        opened={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        title="Settings"
        centered
        size="md"
      >
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
              40–240 BPM, in steps of 5.
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
              <Button variant="default" onClick={() => setSettingsOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  const error = settingsError(draft);
                  if (error) {
                    setDraftError(error);
                    return;
                  }
                  update(applySettings(stateRef.current, draft));
                  setSettingsOpen(false);
                }}
              >
                Apply
              </Button>
            </Group>
          </Group>
        </Stack>
      </Modal>
    </main>
  );
}
