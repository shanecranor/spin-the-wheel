export interface EntryProps {
  id: string;
  text: string;
  author: string;
  isSafe: boolean;
  isOnWheel: boolean;
  isWinner?: boolean;
}

export type Command =
  | "Create"
  | "Delete"
  | "setIsSafe"
  | "setIsOnWheel"
  | "setIsWinner"
  | "Get data";
