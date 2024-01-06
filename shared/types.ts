export interface EntryProps {
  id: string;
  text: string;
  author: string;
  isSafe: boolean;
  isOnWheel: boolean;
  isWinner?: boolean;
}

export const isEntryProps = (input: any): input is EntryProps => {
  return (
    typeof input.id === "string" &&
    typeof input.text === "string" &&
    typeof input.author === "string" &&
    typeof input.isSafe === "boolean" &&
    typeof input.isOnWheel === "boolean" &&
    typeof input.isWinner === "boolean"
  );
};

export type Command =
  | "Create"
  | "Delete"
  | "setIsSafe"
  | "setIsOnWheel"
  | "setIsWinner"
  | "Get data";
