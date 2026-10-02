import type { EntryProps } from "@shared/types";

export function entriesFor(choices: string[]): EntryProps[] {
  return choices.map((text) => ({
    id: text,
    text,
    author: "",
    isSafe: true,
    isOnWheel: true,
    weight: 1,
  }));
}
