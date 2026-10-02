import type { EntryProps } from "@shared/types";
import { buildWheelOffsets } from "./wheel-svg-generator.ts";
import { createWheelState } from "../wheel-spinner/wheel-state.ts";
import type { WheelState } from "../wheel-spinner/wheel-state.ts";

export function restoreWheelState(
  saved: unknown,
  entries: EntryProps[],
): WheelState {
  if (!saved || typeof saved !== "object") return createWheelState();
  const { result, rotation, locked } = saved as Record<string, unknown>;
  const index = entries.findIndex((entry) => entry.id === result);
  if (index < 0) return createWheelState();

  const slice = buildWheelOffsets(entries)[index];
  let position = slice.mid * 360;
  if (typeof rotation === "number" && Number.isFinite(rotation)) {
    let angle = ((rotation % 360) + 360) % 360;
    if (angle === 0 && slice.end === 1) angle = 360;
    const tolerance = 1e-9;
    if (
      angle >= slice.start * 360 - tolerance &&
      angle <= slice.end * 360 + tolerance
    )
      position = rotation;
  }
  return {
    winningEntry: entries[index],
    rotation: position,
    locked: locked === true,
    isRotating: false,
  };
}

// The entries changed: keep an available winner and place it in the new layout.
export function resetWheelForEntries(
  state: WheelState,
  entries: EntryProps[],
): WheelState {
  return restoreWheelState(
    { result: state.winningEntry?.id, locked: state.locked },
    entries,
  );
}
