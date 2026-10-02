import assert from "node:assert/strict";
import { test } from "node:test";
import { entriesFor } from "../src/components/wheel/wheel-entries.ts";
import {
  applySettings,
  choicesFor,
  defaultSettings,
  initialWheels,
  restoreState,
  serializeState,
  settingsError,
  songPrompt,
} from "../src/pages/songwriting/song-state.ts";

function stateWithNote() {
  const state = { settings: defaultSettings(), wheels: initialWheels() };
  state.wheels.note = {
    winningEntry: entriesFor(["C"])[0],
    locked: true,
    rotation: -1434,
    isRotating: false,
  };
  return state;
}

test("tempo choices include both limits and support a single tempo", () => {
  assert.deepEqual(
    choicesFor("tempo", { ...defaultSettings(), minTempo: 100, maxTempo: 110 }),
    ["100", "105", "110"],
  );
  assert.deepEqual(
    choicesFor("tempo", { ...defaultSettings(), minTempo: 100, maxTempo: 100 }),
    ["100"],
  );
});

test("saved selections, locks, and exact landing positions survive reload", () => {
  const state = stateWithNote();
  const restored = restoreState(serializeState(state));
  assert.deepEqual(restored.wheels.note, state.wheels.note);
});

test("legacy saved results migrate without requiring a saved rotation", () => {
  const restored = restoreState(
    JSON.stringify({
      version: 1,
      settings: defaultSettings(),
      wheels: { note: { result: "C", locked: true } },
    }),
  );
  assert.equal(restored.wheels.note.winningEntry?.text, "C");
  assert.equal(restored.wheels.note.locked, true);
  assert.equal(restored.wheels.note.rotation, 15);
  assert.equal(restored.wheels.note.isRotating, false);
});

test("applying unchanged settings preserves exact wheel positions and locks", () => {
  const state = stateWithNote();
  assert.deepEqual(
    applySettings(state, defaultSettings()).wheels,
    state.wheels,
  );
});

test("changing another wheel's choices leaves the retained position untouched", () => {
  const state = stateWithNote();
  const changed = applySettings(state, {
    ...state.settings,
    minTempo: 100,
    maxTempo: 120,
  });
  assert.deepEqual(changed.wheels.note, state.wheels.note);
});

test("bad saved data falls back safely, and missing winners are cleared", () => {
  for (const raw of [
    "garbage",
    "null",
    '{"version":9}',
    '{"version":1,"settings":{"scales":[]}}',
  ]) {
    assert.deepEqual(restoreState(raw), {
      settings: defaultSettings(),
      wheels: initialWheels(),
    });
  }
  const saved = JSON.parse(serializeState(stateWithNote()));
  saved.wheels.note.result = "invalid";
  assert.deepEqual(
    restoreState(JSON.stringify(saved)).wheels.note,
    initialWheels().note,
  );
});

test("changing the entries clears excluded winners or positions retained winners in the new layout", () => {
  const state = stateWithNote();
  assert.deepEqual(
    applySettings(state, { ...state.settings, notes: ["D"] }).wheels.note,
    initialWheels().note,
  );
  const retained = applySettings(state, { ...state.settings, notes: ["C"] })
    .wheels.note;
  assert.equal(retained.winningEntry?.text, "C");
  assert.equal(retained.locked, true);
  assert.equal(retained.rotation, 180);
});

test("settings reject empty choices, invalid intervals, and reversed ranges", () => {
  assert.equal(settingsError(defaultSettings()), null);
  for (const changes of [
    { scales: [] },
    { minTempo: 61 },
    { minTempo: 200, maxTempo: 100 },
    { minTempo: NaN },
    { maxTempo: 300 },
  ])
    assert.ok(settingsError({ ...defaultSettings(), ...changes }));
});

test("song prompt combines the root note with its scale", () => {
  const wheels = initialWheels();
  assert.equal(songPrompt(wheels), null);
  wheels.note.winningEntry = entriesFor(["C"])[0];
  wheels.scale.winningEntry = entriesFor(["major"])[0];
  wheels.instrument.winningEntry = entriesFor(["Guitar"])[0];
  wheels.tempo.winningEntry = entriesFor(["105"])[0];
  assert.equal(songPrompt(wheels), "C major · Guitar · 105 BPM");
});
