import { Command, EntryProps, GlobalParamSettingCommand } from "@shared/types";

export interface CreateMessage {
  command: Command.Create;
  entry: EntryProps;
}

export interface SetGlobalParamMessage {
  command: GlobalParamSettingCommand;
  value: any;
}
export interface SetterMessage {
  command: Command.SetIsSafe | Command.SetIsOnWheel | Command.SetIsWinner;
  id: string;
  value: boolean;
}

export interface DeleteMessage {
  command: Command.Delete;
  id: string;
}

export interface ErrorMessage {
  error: string;
}

export interface GetDataMessage {
  isGameStarted: boolean;
  isAcceptingEntries: boolean;
  command: Command.GetData;
  entries: EntryProps[];
  rules: string;
}

export type WSMessage =
  | CreateMessage
  | SetterMessage
  | SetGlobalParamMessage
  | DeleteMessage
  | GetDataMessage
  | ErrorMessage;
