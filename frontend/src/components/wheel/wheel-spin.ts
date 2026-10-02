import type { EntryProps } from "@shared/types";
import { buildWheelOffsets } from "./wheel-svg-generator.ts";

export const SPIN_DURATION = 10000;
export const SPIN_COMPLETION_DELAY = 10200;

export function calculateWheelSpin(
  wheelEntries: EntryProps[],
  rotation: number,
  random = Math.random,
): { winningEntry: EntryProps; rotation: number } {
  if (!wheelEntries.length)
    throw new Error("A wheel needs at least one entry.");

  const winnerIdx = Math.floor(random() * wheelEntries.length);
  const winningEntry = wheelEntries[winnerIdx];
  const wheelOffsets = buildWheelOffsets(wheelEntries);
  const idx = wheelEntries.findIndex((slice) => slice.id === winningEntry.id);
  const newAngle =
    getRandomFloat(wheelOffsets[idx].start, wheelOffsets[idx].end, random) *
    360;
  const spins = Math.ceil(random() * 2 + 4);

  return {
    winningEntry,
    rotation: rotation + (360 - (rotation % 360)) + newAngle + spins * -360,
  };
}

function getRandomFloat(min: number, max: number, random: () => number) {
  if (min > max) {
    [min, max] = [max, min];
  }
  return random() * (max - min) + min;
}
