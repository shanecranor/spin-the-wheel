import { entriesFor } from "../../components/wheel/wheel-entries.ts";
import {
  resetWheelForEntries,
  restoreWheelState,
} from "../../components/wheel/wheel-position.ts";
import { createWheelState } from "../../components/wheel-spinner/wheel-state.ts";
import type { WheelState } from "../../components/wheel-spinner/wheel-state.ts";

export const WHEEL_IDS = ["scale", "note", "instrument", "tempo"] as const;
export type WheelId = (typeof WHEEL_IDS)[number];
export const SCALES = [
  "major",
  "natural minor",
  "harmonic minor",
  "major pentatonic",
  "minor pentatonic",
  "blues",
];
export const NOTES = [
  "C",
  "C♯",
  "D",
  "E♭",
  "E",
  "F",
  "F♯",
  "G",
  "A♭",
  "A",
  "B♭",
  "B",
];
export const INSTRUMENTS = ["Bass", "Guitar", "Keys"];
export const TITLES: Record<WheelId, string> = {
  scale: "Scale",
  note: "Root note",
  instrument: "Instrument",
  tempo: "Tempo",
};
export const STORAGE_KEY = "song-wheels-v1";

export interface Settings {
  scales: string[];
  notes: string[];
  instruments: string[];
  minTempo: number;
  maxTempo: number;
}
export type Wheels = Record<WheelId, WheelState>;
export interface SongState {
  settings: Settings;
  wheels: Wheels;
}

export function defaultSettings(): Settings {
  return {
    scales: [...SCALES],
    notes: [...NOTES],
    instruments: [...INSTRUMENTS],
    minTempo: 60,
    maxTempo: 180,
  };
}

export function choicesFor(id: WheelId, settings: Settings): string[] {
  switch (id) {
    case "scale":
      return settings.scales;
    case "note":
      return settings.notes;
    case "instrument":
      return settings.instruments;
    case "tempo":
      return Array.from(
        { length: (settings.maxTempo - settings.minTempo) / 5 + 1 },
        (_, index) => String(settings.minTempo + index * 5),
      );
  }
}

export function initialWheels(): Wheels {
  return Object.fromEntries(
    WHEEL_IDS.map((id) => [id, createWheelState()]),
  ) as Wheels;
}

export function settingsError(settings: Settings): string | null {
  if (
    !settings.scales.length ||
    !settings.notes.length ||
    !settings.instruments.length
  )
    return "Keep at least one choice for each wheel.";
  if (
    ![settings.minTempo, settings.maxTempo].every(
      (value) =>
        Number.isInteger(value) &&
        value >= 40 &&
        value <= 240 &&
        value % 5 === 0,
    )
  )
    return "Choose tempos from 40 to 240 BPM, in steps of 5.";
  if (settings.minTempo > settings.maxTempo)
    return "Minimum tempo must be no greater than maximum tempo.";
  return null;
}

function validChoices(value: unknown, allowed: string[]): value is string[] {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    value.every((item) => typeof item === "string" && allowed.includes(item)) &&
    new Set(value).size === value.length
  );
}

export function restoreState(raw: string | null): SongState {
  const fallback = { settings: defaultSettings(), wheels: initialWheels() };
  if (!raw) return fallback;
  try {
    const saved = JSON.parse(raw);
    const settings = saved.settings;
    if (
      (saved.version !== 1 && saved.version !== 2) ||
      !settings ||
      !validChoices(settings.scales, SCALES) ||
      !validChoices(settings.notes, NOTES) ||
      !validChoices(settings.instruments, INSTRUMENTS) ||
      settingsError(settings)
    )
      return fallback;
    const wheels = initialWheels();
    for (const id of WHEEL_IDS) {
      wheels[id] = restoreWheelState(
        saved.wheels?.[id],
        entriesFor(choicesFor(id, settings)),
      );
    }
    return { settings, wheels };
  } catch {
    return fallback;
  }
}

export function snapshotState(state: SongState) {
  return {
    version: 2,
    settings: structuredClone(state.settings),
    wheels: Object.fromEntries(
      WHEEL_IDS.map((id) => [
        id,
        {
          result: state.wheels[id].winningEntry?.id ?? null,
          locked: state.wheels[id].locked,
          rotation: state.wheels[id].rotation,
        },
      ]),
    ),
  };
}

export function serializeState(state: SongState): string {
  return JSON.stringify(snapshotState(state));
}

export function applySettings(state: SongState, settings: Settings): SongState {
  const wheels = initialWheels();
  for (const id of WHEEL_IDS) {
    const previousChoices = choicesFor(id, state.settings);
    const nextChoices = choicesFor(id, settings);
    const unchanged =
      previousChoices.length === nextChoices.length &&
      previousChoices.every((choice, index) => choice === nextChoices[index]);
    wheels[id] = unchanged
      ? state.wheels[id]
      : resetWheelForEntries(state.wheels[id], entriesFor(nextChoices));
  }
  return { settings, wheels };
}

export function songPrompt(wheels: Wheels): string | null {
  if (!WHEEL_IDS.every((id) => wheels[id].winningEntry !== null)) return null;
  return `${wheels.note.winningEntry?.text} ${wheels.scale.winningEntry?.text} · ${wheels.instrument.winningEntry?.text} · ${wheels.tempo.winningEntry?.text} BPM`;
}
