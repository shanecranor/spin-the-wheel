import assert from "node:assert/strict";
import { test } from "node:test";
import {
  applySettings,
  choicesFor,
  defaultSettings,
  initialWheels,
  restoreState,
  serializeState,
  settingsError,
  songPrompt,
  spinResult,
  WHEEL_IDS,
} from "../src/pages/songwriting/song-state.ts";

test("every chosen slice lands at the pointer, including after repeated spins", () => {
  const settings = defaultSettings();
  for (const id of WHEEL_IDS) {
    const choices = choicesFor(id, settings);
    let rotation = 197.4;
    choices.forEach((choice, index) => {
      const chosen = spinResult(
        choices,
        rotation,
        () => (index + 0.5) / choices.length,
      );
      assert.equal(chosen.result, choice);
      assert.ok(chosen.rotation > rotation + 4 * 360);
      const center = ((index + 0.5) / choices.length) * 360;
      assert.ok(Math.abs((chosen.rotation % 360) - center) < 1e-9);
      rotation = chosen.rotation;
    });
  }
});

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

test("saved selections and locks restore without restoring an active spin", () => {
  const state = { settings: defaultSettings(), wheels: initialWheels() };
  state.wheels.note = {
    result: "C",
    locked: true,
    rotation: 2000,
    spinning: true,
  };
  const restored = restoreState(serializeState(state));
  assert.equal(restored.wheels.note.result, "C");
  assert.equal(restored.wheels.note.locked, true);
  assert.equal(restored.wheels.note.spinning, false);
  assert.equal(restored.wheels.note.rotation, 15);
});

test("bad or outdated saved data falls back safely", () => {
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
  const state = { settings: defaultSettings(), wheels: initialWheels() };
  state.wheels.note.result = "invalid";
  assert.equal(restoreState(serializeState(state)).wheels.note.result, null);
});

test("changing choices clears excluded winners and locks", () => {
  const state = { settings: defaultSettings(), wheels: initialWheels() };
  state.wheels.note = {
    result: "C",
    locked: true,
    rotation: 15,
    spinning: false,
  };
  assert.deepEqual(
    applySettings(state, { ...state.settings, notes: ["D"] }).wheels.note,
    initialWheels().note,
  );
  const retained = applySettings(state, { ...state.settings, notes: ["C"] })
    .wheels.note;
  assert.equal(retained.result, "C");
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
  ]) {
    assert.ok(settingsError({ ...defaultSettings(), ...changes }));
  }
});

test("song prompt combines the root note with its scale", () => {
  const wheels = initialWheels();
  assert.equal(songPrompt(wheels), null);
  wheels.note.result = "C";
  wheels.scale.result = "major";
  wheels.instrument.result = "Guitar";
  wheels.tempo.result = "105";
  assert.equal(songPrompt(wheels), "C major · Guitar · 105 BPM");
});
