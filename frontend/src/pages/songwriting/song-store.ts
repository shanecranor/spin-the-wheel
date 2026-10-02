import { batch, observable } from "@legendapp/state";
import type { Change } from "@legendapp/state";
import { persistObservable } from "@legendapp/state/persist";
import { ObservablePersistLocalStorage } from "@legendapp/state/persist-plugins/local-storage";
import { entriesFor } from "../../components/wheel/wheel-entries.ts";
import { createWheelController } from "../../components/wheel-spinner/wheel-controller.ts";
import {
  applySettings,
  choicesFor,
  restoreState,
  settingsError,
  snapshotState,
  STORAGE_KEY,
  WHEEL_IDS,
} from "./song-state.ts";
import type { Settings, SongState, WheelId } from "./song-state.ts";

function browserStoragePlugin() {
  try {
    if (typeof window === "undefined") return null;
    return typeof localStorage === "undefined"
      ? null
      : ObservablePersistLocalStorage;
  } catch {
    return null;
  }
}

export function createSongStore(
  initialState: SongState = restoreState(null),
  StoragePlugin = browserStoragePlugin(),
) {
  const storageError$ = observable(!StoragePlugin);
  const saved$ = observable(snapshotState(initialState));

  if (StoragePlugin) {
    // v2's local-storage plugin lets write errors escape its async save queue.
    class SongStorage extends StoragePlugin {
      set(table: string, changes: Change[]) {
        try {
          super.set(table, changes);
          storageError$.set(false);
        } catch {
          storageError$.set(true);
        }
      }
    }

    persistObservable(saved$, {
      pluginLocal: SongStorage,
      local: {
        name: STORAGE_KEY,
        transform: {
          in: (saved) => snapshotState(restoreState(JSON.stringify(saved))),
        },
      },
    });
  }

  const state$ = observable(restoreState(JSON.stringify(saved$.peek())));
  let reducedMotion = false;
  const controllers = Object.fromEntries(
    WHEEL_IDS.map((id) => [
      id,
      createWheelController(state$.wheels[id], () =>
        entriesFor(choicesFor(id, state$.settings.peek())),
      ),
    ]),
  ) as Record<WheelId, ReturnType<typeof createWheelController>>;

  state$.onChange(({ value }) => {
    const snapshot = snapshotState(value);
    for (const id of WHEEL_IDS) {
      // Reloading mid-spin must keep the previous completed result.
      if (value.wheels[id].isRotating)
        snapshot.wheels[id] = saved$.wheels[id].peek();
    }
    saved$.set(snapshot);
  });

  function spin(ids: readonly WheelId[]) {
    batch(() => ids.forEach((id) => controllers[id].spin(reducedMotion)));
  }

  function setReducedMotion(value: boolean) {
    reducedMotion = value;
    if (value)
      batch(() => WHEEL_IDS.forEach((id) => controllers[id].finishSpin()));
  }

  function saveSettings(settings: Settings) {
    if (
      settingsError(settings) ||
      WHEEL_IDS.some((id) => state$.wheels[id].isRotating.peek())
    )
      return;
    state$.set(applySettings(state$.peek(), settings));
  }

  function dispose() {
    WHEEL_IDS.forEach((id) => controllers[id].dispose());
  }

  return {
    state$,
    storageError$,
    spin,
    setReducedMotion,
    saveSettings,
    dispose,
    toggleLock: (id: WheelId) => controllers[id].toggleLock(),
  };
}

export const songStore = createSongStore();
