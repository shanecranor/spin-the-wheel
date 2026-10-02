import { useEffect, useState } from "react";
import { observer } from "@legendapp/state/react";
import { useReducedMotion } from "@mantine/hooks";
import { Button, Group, Text, Title } from "@mantine/core";
import { WheelCard } from "../../components/wheel-spinner/wheel-card";
import { entriesFor } from "../../components/wheel/wheel-entries";
import { choicesFor, songPrompt, TITLES, WHEEL_IDS } from "./song-state";
import { SongSettingsModal } from "./song-settings-modal";
import { songStore as store } from "./song-store";
import styles from "./songwriting.module.scss";
import { PracticeTimers } from "./practice/practice-timers";

const App = observer(() => {
  const reducedMotion =
    useReducedMotion(undefined, { getInitialValueInEffect: false }) ?? false;

  useEffect(() => {
    store.setReducedMotion(reducedMotion);
  }, [reducedMotion]);

  useEffect(() => () => store.dispose(), []);
  const settings = store.state$.settings.get();
  const wheels = store.state$.wheels.get();
  const storageError = store.storageError$.get();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [copyStatus, setCopyStatus] = useState("");
  const spinning = WHEEL_IDS.some((id) => wheels[id].isRotating);
  const canSpinAll = WHEEL_IDS.some(
    (id) => !wheels[id].locked && !wheels[id].isRotating,
  );
  const prompt = spinning ? null : songPrompt(wheels);
  let summary = prompt ?? "Spin the wheels to get your song constraints.";
  if (spinning) summary = "Spinning…";

  useEffect(() => {
    setCopyStatus("");
  }, [prompt]);

  async function copyPrompt() {
    if (!prompt) return;
    try {
      await navigator.clipboard.writeText(prompt);
      setCopyStatus("Copied");
    } catch {
      setCopyStatus("Couldn't copy. Select the result to copy it.");
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
            onClick={() => setSettingsOpen(true)}
          >
            Settings
          </Button>
          <Button
            onClick={() => store.spin(WHEEL_IDS)}
            disabled={spinning || !canSpinAll}
          >
            Spin all
          </Button>
        </Group>
      </header>
      <div className={styles.grid}>
        {WHEEL_IDS.map((id) => (
          <WheelCard
            key={id}
            id={id}
            title={TITLES[id]}
            state$={store.state$.wheels[id]}
            entries={entriesFor(choicesFor(id, settings))}
            resultSuffix={id === "tempo" ? " BPM" : ""}
            onSpin={() => store.spin([id])}
            onToggleLock={() => store.toggleLock(id)}
          />
        ))}
      </div>
      <div className={styles.summary}>
        <Text size="xl" fw={500} aria-live="polite" aria-atomic="true">
          {summary}
        </Text>
        {prompt && (
          <Button variant="default" onClick={copyPrompt}>
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
      <PracticeTimers getSong={() => store.state$.peek()} />
      {settingsOpen && (
        <SongSettingsModal
          settings={settings}
          onApply={store.saveSettings}
          onClose={() => setSettingsOpen(false)}
        />
      )}
    </main>
  );
});

export default App;
