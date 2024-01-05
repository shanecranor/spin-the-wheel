import { EntryProps } from "@shared/types";
import { webSocket$ } from "./websocket-manager";
import { CommandFunctions } from "./commands";
import { WSMessage } from "./websocket-types";

const checkWebsocket = () => {
  if (webSocket$.peek() === null) {
    throw new Error("WebSocket not initialized");
  }
  return true;
};

const sendWebsocketMessage = (message: WSMessage) => {
  checkWebsocket();
  webSocket$.peek()?.send(JSON.stringify(message));
};
export const webSocketCommands: CommandFunctions = {
  createEntry(entry: EntryProps) {
    checkWebsocket();
    sendWebsocketMessage({
      command: "Create",
      entry,
    });
  },
  setIsOnWheel(entryId: string, isOnWheel: boolean) {
    sendWebsocketMessage({
      command: "setIsOnWheel",
      id: entryId,
      value: isOnWheel,
    });
  },
  setIsSafe(entryId: string, isSafe: boolean) {
    sendWebsocketMessage({
      command: "setIsSafe",
      id: entryId,
      value: isSafe,
    });
  },
  setIsWinner(entryId: string, isWinner: boolean) {
    sendWebsocketMessage({
      command: "setIsWinner",
      id: entryId,
      value: isWinner,
    });
  },
  deleteEntry(entryId: string) {
    sendWebsocketMessage({
      command: "Delete",
      id: entryId,
    });
  },
};
