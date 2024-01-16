export interface EntryProps {
  id: string;
  text: string;
  author: string;
  isSafe: boolean;
  weight?: number;
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
    typeof input.isWinner === "boolean" &&
    typeof input.weight === "number"
  );
};
export enum Command {
  Create = "Create",
  Delete = "Delete",
  SetIsSafe = "setIsSafe",
  SetIsOnWheel = "setIsOnWheel",
  SetIsWinner = "setIsWinner",
  SetIsAcceptingEntries = "setIsAcceptingEntries",
  SetIsGameStarted = "setIsGameStarted",
  SetRules = "setRules",
  GetData = "Get data",
}

export enum GlobalParamSettingCommand {
  SetIsAcceptingEntries = Command.SetIsAcceptingEntries,
  SetIsGameStarted = Command.SetIsGameStarted,
  SetRules = Command.SetRules,
}

export enum GlobalParam {
  IsAcceptingEntries = "isAcceptingEntries",
  IsGameStarted = "isGameStarted",
  Rules = "rules",
}

export type GlobalState = {
  [GlobalParam.IsAcceptingEntries]: boolean;
  [GlobalParam.IsGameStarted]: boolean;
  [GlobalParam.Rules]: string;
};

type GlobalParamMap = {
  [Key in GlobalParamSettingCommand]: GlobalParam;
};

export const globalParamMap: GlobalParamMap = {
  [Command.SetIsAcceptingEntries]: GlobalParam.IsAcceptingEntries,
  [Command.SetIsGameStarted]: GlobalParam.IsGameStarted,
  [Command.SetRules]: GlobalParam.Rules,
};
