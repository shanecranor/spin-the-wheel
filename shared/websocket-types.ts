import { Command, EntryProps } from "@shared/types";

type ValidatedCommand<T extends Command> = T;
export interface CreateMessage {
  command: ValidatedCommand<"Create">;
  entry: EntryProps;
}
export interface SetterMessage {
  command: ValidatedCommand<"setIsSafe" | "setIsOnWheel" | "setIsWinner">;
  id: string;
  value: boolean;
}

export interface DeleteMessage {
  command: ValidatedCommand<"Delete">;
  id: string;
}

export interface ErrorMessage {
  error: string;
}

export interface GetDataMessage {
  command: ValidatedCommand<"Get data">;
  entries: EntryProps[];
}

export type WSMessage =
  | CreateMessage
  | SetterMessage
  | DeleteMessage
  | GetDataMessage
  | ErrorMessage;
