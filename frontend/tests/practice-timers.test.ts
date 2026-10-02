import { createPracticeTimer } from "../src/pages/songwriting/practice/practice-timer-store.ts";
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  alarmMusic,
  makeChiptune,
  SCALE_INTERVALS,
} from "../src/pages/songwriting/practice/chiptune-score.ts";
import {
  formatTime,
  pauseTimer,
  PRACTICE_TIMERS,
  resetTimer,
  startTimer,
  tickTimer,
} from "../src/pages/songwriting/practice/timer-state.ts";
import type { SongState } from "../src/pages/songwriting/song-state.ts";

function song(): SongState {
  const wheel = {
    rotation: 0,
    winningEntry: null,
    isRotating: false,
    locked: false,
  };
  return {
    settings: {
      notes: ["C", "D"],
      scales: ["major", "blues"],
      instruments: ["Guitar"],
      minTempo: 60,
      maxTempo: 180,
    },
    wheels: {
      note: { ...wheel },
      scale: { ...wheel },
      tempo: { ...wheel },
      instrument: { ...wheel },
    },
  };
}

function chosen(text: string) {
  return {
    id: text,
    text,
    author: "",
    isSafe: true,
    isOnWheel: true,
    weight: 1,
  };
}

test("three practice duration ranges match the requested limits", () => {
  assert.deepEqual(
    PRACTICE_TIMERS.map(({ min, max }) => [min, max]),
    [
      [5, 20],
      [20, 60],
      [10, 60],
    ],
  );
});

test("pause, resume, reset, and late background ticks use elapsed time", () => {
  const running = startTimer(resetTimer(5), 1_000);
  const paused = pauseTimer(running, 61_000);
  assert.equal(paused.remainingMs, 240_000);
  assert.equal(tickTimer(paused, 999_000), paused);
  const resumed = startTimer(paused, 1_000_000);
  assert.equal(tickTimer(resumed, 1_030_000).remainingMs, 210_000);
  const finished = tickTimer(resumed, 1_900_000);
  assert.deepEqual(finished, {
    status: "finished",
    remainingMs: 0,
    deadline: null,
  });
  assert.equal(tickTimer(finished, 2_000_000), finished);
  assert.equal(startTimer(finished, 2_000_000), finished);
  assert.deepEqual(resetTimer(10), {
    status: "ready",
    remainingMs: 600_000,
    deadline: null,
  });
  assert.equal(pauseTimer(running, 301_000).status, "finished");
  assert.equal(formatTime(1), "00:01");
  assert.equal(formatTime(3_600_000), "60:00");
});

test("available wheel results are preserved and only missing results randomize", () => {
  const state = song();
  state.wheels.note.winningEntry = chosen("F♯");
  state.wheels.scale.winningEntry = chosen("harmonic minor");
  state.wheels.tempo.winningEntry = chosen("135");
  assert.deepEqual(
    alarmMusic(state, () => 0),
    { root: "F♯", scale: "harmonic minor", bpm: 135 },
  );
  state.wheels.tempo.winningEntry = null;
  assert.deepEqual(
    alarmMusic(state, () => 0.5),
    { root: "F♯", scale: "harmonic minor", bpm: 120 },
  );
  state.wheels.note.isRotating = true;
  assert.equal(alarmMusic(state, () => 0.5).root, "D");
  assert.deepEqual(
    alarmMusic(song(), () => 0),
    { root: "C", scale: "major", bpm: 60 },
  );
});

test("every supported scale stays in key across BPM limits and ends at ten seconds", () => {
  for (const [scale, intervals] of Object.entries(SCALE_INTERVALS)) {
    for (const bpm of [40, 95, 100, 135, 240]) {
      const music = { root: "F♯", scale, bpm };
      const score = makeChiptune(music, 314);
      assert.deepEqual(makeChiptune(music, 314), score);
      assert.notDeepEqual(makeChiptune(music, 315), score);
      for (const note of score) {
        assert.ok(intervals.includes((((note.midi - 6) % 12) + 12) % 12));
        assert.ok(note.at >= 0 && note.duration > 0);
        assert.ok(note.at + note.duration <= 10.000001);
      }
      assert.equal(
        Math.max(...score.map((note) => note.at + note.duration)),
        10,
      );
      assert.equal(score.at(-1)?.midi, 42);
      assert.equal(score[1].at, 0);
      const lead = score.filter((note) => note.voice === "lead");
      assert.ok(Math.abs(lead[1].at - 60 / bpm / (bpm < 100 ? 8 : 4)) < 1e-9);
    }
  }
});

test("independent timer stores notify once, clamp edits, and restart cleanly", () => {
  let completions = 0;
  const first = createPracticeTimer(PRACTICE_TIMERS[0], () => completions++);
  const second = createPracticeTimer(PRACTICE_TIMERS[1], () => completions++);
  first.setMinutes(5);
  first.setMinutes(4);
  assert.equal(first.state$.minutes.peek(), 5);
  first.start(1_000);
  second.start(20_000);
  first.setMinutes(15);
  assert.equal(first.state$.minutes.peek(), 5);
  first.pause(61_000);
  first.tick(400_000);
  assert.equal(completions, 0);
  first.start(400_000);
  first.tick(640_000);
  first.tick(700_000);
  assert.equal(completions, 1);
  assert.equal(second.state$.timer.status.peek(), "running");
  first.start(800_000);
  assert.equal(first.state$.timer.deadline.peek(), 1_100_000);
  first.reset();
  first.tick(2_000_000);
  assert.equal(completions, 1);
  assert.equal(first.state$.timer.status.peek(), "ready");
});
