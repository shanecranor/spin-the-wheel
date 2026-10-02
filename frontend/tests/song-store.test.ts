import assert from "node:assert/strict";
import { test } from "node:test";
import { ObservablePersistLocalStorage } from "@legendapp/state/persist-plugins/local-storage";
import { entriesFor } from "../src/components/wheel/wheel-entries.ts";
import {
  defaultSettings,
  initialWheels,
  restoreState,
  serializeState,
  STORAGE_KEY,
} from "../src/pages/songwriting/song-state.ts";
import { createSongStore } from "../src/pages/songwriting/song-store.ts";

const flush = () => new Promise<void>((resolve) => setImmediate(resolve));

function storagePlugin(
  storage: Pick<Storage, "getItem" | "setItem" | "removeItem">,
) {
  return class TestStorage extends ObservablePersistLocalStorage {
    constructor() {
      const previous = Object.getOwnPropertyDescriptor(
        globalThis,
        "localStorage",
      );
      Object.defineProperty(globalThis, "localStorage", {
        configurable: true,
        value: storage,
      });
      super();
      if (previous) Object.defineProperty(globalThis, "localStorage", previous);
      else Reflect.deleteProperty(globalThis, "localStorage");
    }
  };
}

async function setup() {
  const initial = { settings: defaultSettings(), wheels: initialWheels() };
  initial.wheels.note = {
    winningEntry: entriesFor(["C"])[0],
    rotation: -1434,
    locked: false,
    isRotating: false,
  };
  initial.wheels.instrument = {
    winningEntry: entriesFor(["Guitar"])[0],
    rotation: -1296,
    locked: false,
    isRotating: false,
  };
  const saved = new Map<string, string>([
    [STORAGE_KEY, serializeState(initial)],
  ]);
  const storage = {
    removeItem: (key: string) => {
      saved.delete(key);
    },
    getItem: (key: string) => saved.get(key) ?? null,
    setItem: (key: string, value: string) => {
      saved.set(key, value);
    },
  };
  const store = createSongStore(undefined, storagePlugin(storage));
  await flush();
  return {
    store,
    savedState: () => restoreState(storage.getItem(STORAGE_KEY)),
    cleanup: store.dispose,
  };
}

test("storage retains settled positions during a spin and saves the new landing at 10.2 seconds", async (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  t.mock.method(Math, "random", () => 0.6);
  const { store, savedState, cleanup } = await setup();
  try {
    const previous = savedState().wheels.note;
    store.spin(["note"]);
    await flush();
    assert.equal(store.state$.wheels.note.isRotating.peek(), true);
    assert.equal(store.state$.wheels.note.winningEntry.peek()?.text, "G");
    assert.deepEqual(savedState().wheels.note, previous);
    t.mock.timers.tick(10000);
    await flush();
    assert.equal(store.state$.wheels.note.isRotating.peek(), true);
    t.mock.timers.tick(200);
    await flush();
    assert.equal(store.state$.wheels.note.isRotating.peek(), false);
    assert.deepEqual(savedState().wheels.note, store.state$.wheels.note.peek());
    assert.notEqual(savedState().wheels.note.rotation, previous.rotation);
  } finally {
    cleanup();
  }
});

test("staggered spins preserve independent settled results and lock changes", async (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  t.mock.method(Math, "random", () => 0.6);
  const { store, savedState, cleanup } = await setup();
  try {
    const previousInstrument = savedState().wheels.instrument;
    store.spin(["note"]);
    await flush();
    store.toggleLock("note");
    await flush();
    assert.equal(store.state$.wheels.note.locked.peek(), false);
    t.mock.timers.tick(1000);
    await flush();
    store.spin(["instrument"]);
    await flush();
    t.mock.timers.tick(9200);
    await flush();
    assert.equal(store.state$.wheels.note.isRotating.peek(), false);
    assert.equal(store.state$.wheels.instrument.isRotating.peek(), true);
    store.toggleLock("note");
    await flush();
    assert.equal(savedState().wheels.note.locked, true);
    assert.deepEqual(savedState().wheels.instrument, previousInstrument);
    t.mock.timers.tick(1000);
    await flush();
    assert.deepEqual(
      savedState().wheels.instrument,
      store.state$.wheels.instrument.peek(),
    );
    const note = savedState().wheels.note;
    store.spin(["note"]);
    await flush();
    assert.deepEqual(savedState().wheels.note, note);
    assert.equal(store.state$.wheels.note.isRotating.peek(), false);
  } finally {
    cleanup();
  }
});

test("live reduced motion finishes pending spins and makes new spins instant", async (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  const { store, savedState, cleanup } = await setup();
  try {
    store.spin(["note", "instrument"]);
    await flush();
    assert.equal(store.state$.wheels.note.isRotating.peek(), true);
    store.setReducedMotion(true);
    await flush();
    assert.equal(store.state$.wheels.note.isRotating.peek(), false);
    assert.equal(store.state$.wheels.instrument.isRotating.peek(), false);
    assert.deepEqual(savedState().wheels.note, store.state$.wheels.note.peek());
    store.spin(["note"]);
    await flush();
    assert.equal(store.state$.wheels.note.isRotating.peek(), false);
    store.setReducedMotion(false);
    await flush();
    store.spin(["note"]);
    await flush();
    assert.equal(store.state$.wheels.note.isRotating.peek(), true);
  } finally {
    cleanup();
  }
});

test("settings cannot change entries mid-spin, and unchanged settings preserve a settled position", async (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  const { store, savedState, cleanup } = await setup();
  try {
    const before = savedState();
    store.saveSettings(defaultSettings());
    await flush();
    assert.deepEqual(savedState(), before);
    store.spin(["note"]);
    await flush();
    store.saveSettings({ ...defaultSettings(), notes: ["D"] });
    await flush();
    assert.deepEqual(
      store.state$.settings.notes.peek(),
      defaultSettings().notes,
    );
  } finally {
    cleanup();
  }
});

test("storage failures are reported without preventing wheel updates", async () => {
  const store = createSongStore(
    {
      settings: defaultSettings(),
      wheels: initialWheels(),
    },
    null,
  );
  try {
    assert.equal(store.storageError$.peek(), true);
    store.setReducedMotion(true);
    await flush();
    store.spin(["note"]);
    await flush();
    assert.ok(store.state$.wheels.note.winningEntry.peek());
    assert.equal(store.state$.wheels.note.isRotating.peek(), false);
  } finally {
    store.dispose();
  }
});

test("Legend storage write failures are contained and recover on the next change", async () => {
  let failed = true;
  const saved = new Map<string, string>();
  const store = createSongStore(
    undefined,
    storagePlugin({
      getItem: (key) => saved.get(key) ?? null,
      removeItem: (key) => {
        saved.delete(key);
      },
      setItem: (key, value) => {
        if (failed) throw new Error("Storage quota exceeded");
        saved.set(key, value);
      },
    }),
  );
  try {
    store.setReducedMotion(true);
    store.spin(["note"]);
    await flush();
    assert.equal(store.storageError$.peek(), true);
    assert.ok(store.state$.wheels.note.winningEntry.peek());
    failed = false;
    store.toggleLock("note");
    await flush();
    assert.equal(store.storageError$.peek(), false);
    assert.equal(
      restoreState(saved.get(STORAGE_KEY) ?? null).wheels.note.locked,
      true,
    );
  } finally {
    store.dispose();
    await flush();
  }
});
