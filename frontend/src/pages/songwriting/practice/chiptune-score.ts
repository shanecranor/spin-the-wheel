import type { SongState } from "../song-state.ts";

export const ALARM_SECONDS = 10;
export const SCALE_INTERVALS: Record<string, readonly number[]> = {
  major: [0, 2, 4, 5, 7, 9, 11],
  "natural minor": [0, 2, 3, 5, 7, 8, 10],
  "harmonic minor": [0, 2, 3, 5, 7, 8, 11],
  "major pentatonic": [0, 2, 4, 7, 9],
  "minor pentatonic": [0, 3, 5, 7, 10],
  blues: [0, 3, 5, 6, 7, 10],
};
const ROOTS: Record<string, number> = {
  C: 0,
  "C♯": 1,
  D: 2,
  "E♭": 3,
  E: 4,
  F: 5,
  "F♯": 6,
  G: 7,
  "A♭": 8,
  A: 9,
  "B♭": 10,
  B: 11,
};
export interface AlarmMusic {
  root: string;
  scale: string;
  bpm: number;
}
export interface ScoreNote {
  midi: number;
  at: number;
  duration: number;
  voice: "lead" | "bass";
}

export function seededRandom(seed: number): () => number {
  let value = seed >>> 0;
  return () => {
    value += 0x6d2b79f5;
    let next = Math.imul(value ^ (value >>> 15), value | 1);
    next ^= next + Math.imul(next ^ (next >>> 7), next | 61);
    return ((next ^ (next >>> 14)) >>> 0) / 4294967296;
  };
}

function choose<T>(items: readonly T[], random: () => number): T {
  return items[Math.floor(random() * items.length)];
}

// Keep each available settled wheel choice; randomize only the missing pieces.
export function alarmMusic(song: SongState, random = Math.random): AlarmMusic {
  const settled = (id: "note" | "scale" | "tempo") =>
    song.wheels[id].isRotating ? undefined : song.wheels[id].winningEntry?.text;
  const root = settled("note");
  const scale = settled("scale");
  const bpm = Number(settled("tempo"));
  const randomTempo =
    song.settings.minTempo +
    Math.floor(
      random() * ((song.settings.maxTempo - song.settings.minTempo) / 5 + 1),
    ) *
      5;
  return {
    root: root && root in ROOTS ? root : choose(song.settings.notes, random),
    scale:
      scale && scale in SCALE_INTERVALS
        ? scale
        : choose(song.settings.scales, random),
    bpm: Number.isFinite(bpm) && bpm >= 40 && bpm <= 240 ? bpm : randomTempo,
  };
}

export function makeChiptune(music: AlarmMusic, seed: number): ScoreNote[] {
  const random = seededRandom(seed);
  const intervals = SCALE_INTERVALS[music.scale];
  const root = ROOTS[music.root];
  const beat = 60 / music.bpm;
  const subdivisions = music.bpm < 100 ? 8 : 4;
  const step = beat / subdivisions;
  const notes: ScoreNote[] = [];
  const midiFor = (degree: number, octave: number) =>
    octave +
    root +
    intervals[degree % intervals.length] +
    Math.floor(degree / intervals.length) * 12;
  let chord = 0;
  let descending = false;
  const sequence = [0, 2, 4, 2];
  // Leave a brief tonic cadence at the end of the ten-second phrase.
  const phraseEnd = ALARM_SECONDS - 0.35;
  for (let index = 0; index * step < phraseEnd; index++) {
    if (index % (subdivisions * 4) === 0) {
      chord = index === 0 ? 0 : choose([0, 2, 3, 4], random);
      descending = random() > 0.5;
    }
    const position = index % sequence.length;
    const degree = chord + sequence[descending ? 3 - position : position];
    const at = index * step;
    notes.push({
      midi: midiFor(degree, random() > 0.82 ? 84 : 72),
      at,
      duration: Math.min(step * 0.8, phraseEnd - at),
      voice: "lead",
    });
    if (index % subdivisions === 0)
      notes.push({
        midi: midiFor(chord + (index % (subdivisions * 2) ? 4 : 0), 36),
        at,
        duration: Math.min(beat * 0.7, phraseEnd - at),
        voice: "bass",
      });
  }
  notes.push({ midi: 72 + root, at: phraseEnd, duration: 0.35, voice: "lead" });
  notes.push({ midi: 36 + root, at: phraseEnd, duration: 0.35, voice: "bass" });
  return notes;
}
