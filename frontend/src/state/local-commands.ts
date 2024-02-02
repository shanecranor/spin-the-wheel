import { CurrencyInfo, EntryProps } from "@shared/types";
// import { getRandomInt } from "../util";
import { entryState$ } from "./entry-state";
import { CommandFunctions } from "./commands";
import { globalState$ } from "./global-state";

export const localCommands: CommandFunctions = {
  setRules(rules: string) {
    globalState$.set((oldState) => ({ ...oldState, rules }));
  },

  setCurrencyInfo(currencyInfo: CurrencyInfo[]) {
    globalState$.set((oldState) => ({ ...oldState, currencyInfo }));
  },

  setIsAcceptingEntries(isAcceptingEntries: boolean) {
    console.log("setting isAcceptingEntries to", isAcceptingEntries);
    globalState$.set((oldState) => ({ ...oldState, isAcceptingEntries }));
  },

  setIsGameStarted(isGameStarted: boolean) {
    console.log("setting isGameStarted to", isGameStarted);
    globalState$.set((oldState) => ({ ...oldState, isGameStarted }));
  },

  createEntry(entry: EntryProps) {
    entryState$.set((oldMap) => {
      const newMap = new Map(oldMap);
      newMap.set(entry.id, entry);
      return newMap;
    });
  },
  setIsOnWheel(entryId: string, isOnWheel: boolean) {
    entryState$.set((oldMap) =>
      updateMapItem(oldMap, entryId, "isOnWheel", isOnWheel)
    );
  },
  setIsSafe(entryId: string, isSafe: boolean) {
    entryState$.set((oldMap) =>
      updateMapItem(oldMap, entryId, "isSafe", isSafe)
    );
  },
  setIsWinner(entryId: string) {
    entryState$.set((oldMap) =>
      updateMapItem(oldMap, entryId, "isWinner", true)
    );
  },
  deleteEntry(entryId: string) {
    entryState$.set((oldMap) => {
      const newMap = new Map(oldMap);
      newMap.delete(entryId);
      return newMap;
    });
  },
};

const updateMapItem = (
  map: Map<string, EntryProps>,
  entryId: string,
  propertyName: keyof EntryProps,
  value: boolean
) => {
  const newMap = new Map(map);
  const oldEntry = newMap.get(entryId);
  if (oldEntry) {
    newMap.set(entryId, {
      ...oldEntry,
      [propertyName]: value,
    });
  }
  return newMap;
};
