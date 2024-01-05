import { Command, EntryProps } from "@shared/types";

type ValidatedCommand<T extends Command> = T;
interface CreateMessage {
  command: ValidatedCommand<"Create">;
  entry: EntryProps;
}
interface SetterMessage {
  command: ValidatedCommand<"setIsSafe" | "setIsOnWheel" | "setIsWinner">;
  id: string;
  value: boolean;
}

interface DeleteMessage {
  command: ValidatedCommand<"Delete">;
  id: string;
}

interface ErrorMessage {
  error: string;
}

interface GetDataMessage {
  command: ValidatedCommand<"Get data">;
  entries: EntryProps[];
}

export type WSMessage =
  | CreateMessage
  | SetterMessage
  | DeleteMessage
  | GetDataMessage
  | ErrorMessage;
