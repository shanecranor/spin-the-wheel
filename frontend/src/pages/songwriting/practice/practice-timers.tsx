import { useEffect, useRef, useState } from "react";
import { observer } from "@legendapp/state/react";
import { Button, Group, Progress, Slider, Text, Title } from "@mantine/core";
import type { SongState } from "../song-state";
import { alarmMusic } from "./chiptune-score";
import { ChiptunePlayer } from "./chiptune-player";
import { formatTime, PRACTICE_TIMERS } from "./timer-state";
import { createPracticeTimer } from "./practice-timer-store";
import styles from "./practice-timers.module.scss";

interface TimerProps {
  config: (typeof PRACTICE_TIMERS)[number];
  unlockSound: () => Promise<void>;
  onFinish: (title: string) => void;
}

const PracticeTimer = observer(
  ({ config, unlockSound, onFinish }: TimerProps) => {
    const [store] = useState(() =>
      createPracticeTimer(config, () => onFinish(config.title)),
    );
    const { minutes, timer } = store.state$.get();
    const mounted = useRef(false);
    const [unlocking, setUnlocking] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
      mounted.current = true;
      const tick = () => store.tick();
      const interval = window.setInterval(tick, 250);
      document.addEventListener("visibilitychange", tick);
      return () => {
        mounted.current = false;
        window.clearInterval(interval);
        document.removeEventListener("visibilitychange", tick);
      };
    }, [store]);

    async function start() {
      setUnlocking(true);
      setError("");
      try {
        // Starting the timer is the user gesture that enables later alarm playback.
        await unlockSound();
        if (!mounted.current) return;
        store.start();
      } catch {
        if (mounted.current)
          setError(
            "Sound couldn’t start. Try again, or check your browser’s sound settings.",
          );
      } finally {
        if (mounted.current) setUnlocking(false);
      }
    }

    const editing = timer.status === "ready" || timer.status === "finished";
    const progress = Math.min(
      100,
      Math.max(0, (1 - timer.remainingMs / (minutes * 60_000)) * 100),
    );
    return (
      <section
        className={styles.card}
        aria-labelledby={`${config.id}-timer-title`}
      >
        <Title order={3} size="h4" id={`${config.id}-timer-title`}>
          {config.title}
        </Title>
        <Text size="sm" c="dimmed">
          {config.min}–{config.max} minutes
        </Text>
        <Text
          className={styles.countdown}
          role="timer"
          aria-live="off"
          aria-label={`${config.title}: ${formatTime(timer.remainingMs)} remaining`}
        >
          {formatTime(timer.remainingMs)}
        </Text>
        <Progress
          value={progress}
          aria-label={`${config.title} progress`}
          className={styles.progress}
        />
        <Group justify="space-between" className={styles.duration}>
          <Text component="label" htmlFor={`${config.id}-duration`}>
            Duration
          </Text>
          <Text fw={500}>{minutes} min</Text>
        </Group>
        <Slider
          id={`${config.id}-duration`}
          min={config.min}
          max={config.max}
          step={1}
          value={minutes}
          disabled={!editing || unlocking}
          thumbLabel={`${config.title} duration in minutes`}
          label={(value) => `${value} min`}
          onChange={(value) => {
            store.setMinutes(value);
          }}
        />
        <Group justify="center" gap="sm" className={styles.controls}>
          {timer.status === "running" ? (
            <Button
              onClick={() => store.pause()}
              aria-label={`Pause ${config.title.toLowerCase()} timer`}
            >
              Pause
            </Button>
          ) : (
            <Button
              onClick={() => void start()}
              loading={unlocking}
              aria-label={`${timer.status === "paused" ? "Resume" : "Start"} ${config.title.toLowerCase()} timer`}
            >
              {timer.status === "paused"
                ? "Resume"
                : timer.status === "finished"
                  ? "Start again"
                  : "Start"}
            </Button>
          )}
          <Button
            variant="default"
            disabled={unlocking || timer.status === "ready"}
            onClick={() => {
              store.reset();
              setError("");
            }}
            aria-label={`Reset ${config.title.toLowerCase()} timer`}
          >
            Reset
          </Button>
        </Group>
        <Text
          size="sm"
          className={styles.timerStatus}
          role="status"
          c={error ? "red" : "dimmed"}
        >
          {error ||
            (timer.status === "finished"
              ? "Time’s up!"
              : timer.status === "paused"
                ? "Paused"
                : timer.status === "running"
                  ? "Running"
                  : "Ready")}
        </Text>
      </section>
    );
  },
);

export function PracticeTimers({ getSong }: { getSong: () => SongState }) {
  const player = useRef<ChiptunePlayer>(undefined);
  if (!player.current) player.current = new ChiptunePlayer();
  const [playing, setPlaying] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [status, setStatus] = useState("");
  const endTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const mounted = useRef(false);
  const generation = useRef(0);

  useEffect(() => {
    generation.current++;
    mounted.current = true;
    return () => {
      mounted.current = false;
      clearTimeout(endTimer.current);
      player.current?.dispose();
    };
  }, []);

  async function playAlarm(title?: string) {
    const current = generation.current;
    try {
      const music = alarmMusic(getSong());
      const duration = await player.current!.play(music);
      if (!mounted.current || current !== generation.current) return;
      setPlaying(true);
      setStatus(
        `${title ? `${title}: time’s up! ` : "Test alarm: "}${music.root} ${music.scale} · ${music.bpm} BPM`,
      );
      clearTimeout(endTimer.current);
      endTimer.current = setTimeout(() => {
        if (mounted.current) setPlaying(false);
      }, duration);
    } catch {
      if (mounted.current)
        setStatus(
          `${title ? `${title}: time’s up! ` : ""}Sound is unavailable. Use Test alarm to try again.`,
        );
    }
  }

  function stopAlarm() {
    generation.current++;
    player.current!.stop();
    clearTimeout(endTimer.current);
    setPlaying(false);
  }

  return (
    <section className={styles.section} aria-labelledby="practice-title">
      <div className={styles.header}>
        <div>
          <Title order={2} size="h3" id="practice-title">
            Practice timers
          </Title>
          <Text c="dimmed" size="sm">
            Each finish plays a new 10-second chiptune using your wheel results.
          </Text>
        </div>
        <Group gap="sm">
          <Button
            variant="light"
            disabled={playing}
            loading={previewing}
            onClick={async () => {
              setPreviewing(true);
              await playAlarm();
              if (mounted.current) setPreviewing(false);
            }}
          >
            Test alarm
          </Button>
          {playing && (
            <Button variant="default" onClick={stopAlarm}>
              Stop sound
            </Button>
          )}
        </Group>
      </div>
      <div className={styles.grid}>
        {PRACTICE_TIMERS.map((config) => (
          <PracticeTimer
            key={config.id}
            config={config}
            unlockSound={() => player.current!.unlock()}
            onFinish={(title) => void playAlarm(title)}
          />
        ))}
      </div>
      <Text c="dimmed" size="sm" className={styles.note}>
        Unset wheel choices are randomized. Keep this page open for alarms;
        paused timers keep their remaining time.
      </Text>
      <Text size="sm" role="status" className={styles.alarmStatus}>
        {status}
      </Text>
    </section>
  );
}
