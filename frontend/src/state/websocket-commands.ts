import {
  Command,
  EntryProps,
  GlobalParamSettingCommand,
} from "../../../shared/types";
import { webSocket$ } from "./websocket-manager";
import { CommandFunctions } from "./commands";
import { WSMessage } from "@shared/websocket-types";

const checkWebsocket = () => {
  if (webSocket$.peek() === null) {
    throw new Error("WebSocket not initialized");
  }
  return true;
};

const sendWebsocketMessage = (message: WSMessage) => {
  checkWebsocket();
  console.log("WebSocket message sent:", message);
  webSocket$.peek()?.send(JSON.stringify(message));
};
export const webSocketCommands: CommandFunctions = {
  //Global commands
  setRules(rules: string) {
    sendWebsocketMessage({
      command: GlobalParamSettingCommand.SetRules,
      value: rules,
    });
  },
  setIsAcceptingEntries(isAcceptingEntries: boolean) {
    sendWebsocketMessage({
      command: GlobalParamSettingCommand.SetIsAcceptingEntries,
      value: isAcceptingEntries,
    });
  },
  setIsGameStarted(isGameStarted: boolean) {
    sendWebsocketMessage({
      command: GlobalParamSettingCommand.SetIsGameStarted,
      value: isGameStarted,
    });
  },
  //per entry commands
  createEntry(entry: EntryProps) {
    sendWebsocketMessage({
      command: Command.Create,
      entry,
    });
  },
  setIsOnWheel(entryId: string, isOnWheel: boolean) {
    sendWebsocketMessage({
      command: Command.SetIsOnWheel,
      id: entryId,
      value: isOnWheel,
    });
  },
  setIsSafe(entryId: string, isSafe: boolean) {
    sendWebsocketMessage({
      command: Command.SetIsSafe,
      id: entryId,
      value: isSafe,
    });
  },
  setIsWinner(entryId: string, isWinner: boolean) {
    sendWebsocketMessage({
      command: Command.SetIsWinner,
      id: entryId,
      value: isWinner,
    });
  },
  deleteEntry(entryId: string) {
    sendWebsocketMessage({
      command: Command.Delete,
      id: entryId,
    });
  },
};
