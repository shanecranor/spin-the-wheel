import { CurrencyInfo, EntryProps } from "@shared/types";

export type EntryFunction = (entry: EntryProps) => void;
export type EntryIdFunction = (id: string) => void;
export type EntryIdBoolFunction = (id: string, param: boolean) => void;

export interface CommandFunctions {
  createEntry: EntryFunction;
  deleteEntry: EntryIdFunction;
  setIsOnWheel: EntryIdBoolFunction;
  setIsSafe: EntryIdBoolFunction;
  setIsWinner: EntryIdBoolFunction;
  setRules: (rules: string) => void;
  setCurrencyInfo: (currencyInfo: CurrencyInfo[]) => void;
  setIsAcceptingEntries: (isAcceptingEntries: boolean) => void;
  setIsGameStarted: (isGameStarted: boolean) => void;
}
