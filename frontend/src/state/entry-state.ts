import { observable } from "@legendapp/state";
import { EntryProps } from "@shared/types";
import { tempEntryData } from "./placeholder-data";

export const mapFromEntries = (entries: EntryProps[]) => {
  const map = new Map<string, EntryProps>();
  entries.forEach((entry) => map.set(entry.id, entry));
  return map;
};

export const entryState$ = observable<Map<string, EntryProps>>(
  mapFromEntries(tempEntryData)
);

export const getEntries = () => {
  return Array.from(entryState$.get().values());
};
