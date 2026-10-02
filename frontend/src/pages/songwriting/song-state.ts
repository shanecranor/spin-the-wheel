import type { EntryProps } from "@shared/types";

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
export const SPIN_DURATION = 3000;

export interface Settings {
  scales: string[];
  notes: string[];
  instruments: string[];
  minTempo: number;
  maxTempo: number;
}
export interface WheelState {
  result: string | null;
  locked: boolean;
  rotation: number;
  spinning: boolean;
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

export function entriesFor(choices: string[]): EntryProps[] {
  return choices.map((text) => ({
    id: text,
    text,
    author: "",
    isSafe: true,
    isOnWheel: true,
    weight: 1,
  }));
}

export function initialWheels(): Wheels {
  return Object.fromEntries(
    WHEEL_IDS.map((id) => [
      id,
      { result: null, locked: false, rotation: 0, spinning: false },
    ]),
  ) as Wheels;
}

export function spinResult(
  choices: string[],
  rotation: number,
  random = Math.random,
): { result: string; rotation: number } {
  if (!choices.length) throw new Error("A wheel needs at least one choice.");
  const index = Math.floor(random() * choices.length);
  // Slices begin at the pointer on the right. Align the chosen slice's center.
  const angle = ((index + 0.5) / choices.length) * 360;
  return {
    result: choices[index],
    rotation: rotation + (360 - (rotation % 360)) + 4 * 360 + angle,
  };
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
      saved.version !== 1 ||
      !settings ||
      !validChoices(settings.scales, SCALES) ||
      !validChoices(settings.notes, NOTES) ||
      !validChoices(settings.instruments, INSTRUMENTS) ||
      settingsError(settings)
    )
      return fallback;
    const wheels = initialWheels();
    for (const id of WHEEL_IDS) {
      const result = saved.wheels?.[id]?.result;
      const choices = choicesFor(id, settings);
      const index = choices.indexOf(result);
      if (index >= 0)
        wheels[id] = {
          result,
          locked: saved.wheels[id].locked === true,
          spinning: false,
          rotation: ((index + 0.5) / choices.length) * 360,
        };
    }
    return { settings, wheels };
  } catch {
    return fallback;
  }
}

export function serializeState(state: SongState): string {
  return JSON.stringify({
    version: 1,
    settings: state.settings,
    wheels: Object.fromEntries(
      WHEEL_IDS.map((id) => [
        id,
        { result: state.wheels[id].result, locked: state.wheels[id].locked },
      ]),
    ),
  });
}

export function applySettings(state: SongState, settings: Settings): SongState {
  const wheels = initialWheels();
  for (const id of WHEEL_IDS) {
    const choices = choicesFor(id, settings);
    const index = choices.indexOf(state.wheels[id].result ?? "");
    if (index >= 0)
      wheels[id] = {
        ...state.wheels[id],
        rotation: ((index + 0.5) / choices.length) * 360,
      };
  }
  return { settings, wheels };
}

export function songPrompt(wheels: Wheels): string | null {
  if (!WHEEL_IDS.every((id) => wheels[id].result !== null)) return null;
  return `${wheels.note.result} ${wheels.scale.result} · ${wheels.instrument.result} · ${wheels.tempo.result} BPM`;
}
