import assert from "node:assert/strict";
import { test } from "node:test";
import { entriesFor } from "../src/components/wheel/wheel-entries.ts";
import { calculateWheelSpin } from "../src/components/wheel/wheel-spin.ts";
import { createWheelState } from "../src/components/wheel-spinner/wheel-state.ts";
import {
  resetWheelForEntries,
  restoreWheelState,
} from "../src/components/wheel/wheel-position.ts";

function randomSequence(...values: number[]): () => number {
  let index = 0;
  return () => {
    assert.ok(index < values.length, "Unexpected extra random draw");
    return values[index++];
  };
}

function normalizedAngle(rotation: number): number {
  return ((rotation % 360) + 360) % 360;
}

test("landing varies within the selected slice's actual weighted bounds", () => {
  const entries = entriesFor(["small", "large"]);
  entries[1].weight = 3;
  // The large slice occupies 90–360 degrees; its center is 225 degrees.
  const nearStart = calculateWheelSpin(
    entries,
    0,
    randomSequence(0.8, 0.2, 0.25),
  );
  const nearEnd = calculateWheelSpin(
    entries,
    0,
    randomSequence(0.8, 0.8, 0.25),
  );
  assert.equal(nearStart.winningEntry, entries[1]);
  assert.equal(nearEnd.winningEntry, entries[1]);
  assert.ok(Math.abs(normalizedAngle(nearStart.rotation) - 144) < 1e-9);
  assert.ok(Math.abs(normalizedAngle(nearEnd.rotation) - 306) < 1e-9);
  assert.notEqual(normalizedAngle(nearStart.rotation), 225);
  assert.notEqual(normalizedAngle(nearEnd.rotation), 225);
});

test("entry selection stays uniform while weights determine slice geometry", () => {
  const entries = entriesFor(["small", "large"]);
  entries[1].weight = 3;
  const chosen = calculateWheelSpin(entries, 0, randomSequence(0.4, 0.8, 0.25));
  assert.equal(chosen.winningEntry, entries[0]);
  assert.equal(normalizedAngle(chosen.rotation), 72);
});

test("full turns vary in the original direction without changing the landing", () => {
  const entries = entriesFor(["first", "second"]);
  const previousRotation = 197.4;
  const fewerTurns = calculateWheelSpin(
    entries,
    previousRotation,
    randomSequence(0.2, 0.25, 0.25),
  );
  const moreTurns = calculateWheelSpin(
    entries,
    previousRotation,
    randomSequence(0.2, 0.25, 0.75),
  );
  assert.ok(fewerTurns.rotation < previousRotation);
  assert.ok(moreTurns.rotation < fewerTurns.rotation);
  assert.equal(fewerTurns.rotation - moreTurns.rotation, 360);
  assert.equal(normalizedAngle(fewerTurns.rotation), 45);
  assert.equal(normalizedAngle(moreTurns.rotation), 45);
});

test("successive spins land correctly from positive and negative accumulated rotations", () => {
  const entries = entriesFor(["first", "second"]);
  for (const start of [0, 197.4, -1395, -1755, 720]) {
    let rotation = start;
    for (let spin = 0; spin < 3; spin++) {
      const chosen = calculateWheelSpin(
        entries,
        rotation,
        randomSequence(0.8, 0.4, 0.75),
      );
      assert.equal(chosen.winningEntry, entries[1]);
      assert.equal(normalizedAngle(chosen.rotation), 252);
      assert.ok(chosen.rotation < rotation);
      rotation = chosen.rotation;
    }
  }
});

test("single-entry wheels still use a random landing, and empty wheels cannot spin", () => {
  const entries = entriesFor(["only"]);
  const chosen = calculateWheelSpin(entries, 0, randomSequence(0, 0.25, 0.25));
  assert.equal(chosen.winningEntry, entries[0]);
  assert.equal(normalizedAngle(chosen.rotation), 90);
  assert.throws(() => calculateWheelSpin([], 0), /at least one entry/);
});

test("changed entries position retained winners using weighted geometry and clear missing winners", () => {
  const entries = entriesFor(["small", "large"]);
  entries[1].weight = 3;
  const wheel = {
    ...createWheelState(),
    winningEntry: entries[1],
    locked: true,
  };
  assert.deepEqual(resetWheelForEntries(wheel, entries), {
    ...wheel,
    rotation: 225,
  });
  assert.deepEqual(
    resetWheelForEntries(wheel, entriesFor(["small"])),
    createWheelState(),
  );
});

test("restoring saved positions retains valid non-center landings and rejects mismatched positions", () => {
  const entries = entriesFor(["small", "large"]);
  entries[1].weight = 3;
  const valid = restoreWheelState(
    { result: "large", locked: true, rotation: -1296 },
    entries,
  );
  assert.equal(valid.rotation, -1296);
  assert.equal(valid.winningEntry?.id, "large");
  assert.equal(valid.locked, true);
  assert.equal(
    restoreWheelState({ result: "large", rotation: 40 }, entries).rotation,
    225,
  );
  assert.equal(
    restoreWheelState({ result: "large", rotation: "bad" }, entries).rotation,
    225,
  );
});
