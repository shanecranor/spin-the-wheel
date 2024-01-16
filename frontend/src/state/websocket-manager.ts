import { localCommands } from "./local-commands";
import { entryState$, mapFromEntries } from "./entry-state";
import { observable } from "@legendapp/state";
import { WSMessage } from "@shared/websocket-types";
import { Command, GlobalParamSettingCommand } from "../../../shared/types";
import { notifications } from "@mantine/notifications";
import { globalState$ } from "./global-state";
export const webSocket$ = observable<WebSocket | null>(null);

export function startWebSockets() {
  if (webSocket$.peek() !== null) {
    if (webSocket$.peek()?.readyState === WebSocket.OPEN) {
      console.log("WebSocket connection already established.");
      return;
    }
  }
  //get name from window object url
  const url = new URL(window.location.href);
  const name = url.searchParams.get("name") || "default";
  const webSocket = new WebSocket(
    `wss://wheel-entry-worker.shanecranor.workers.dev?name=${name}`
  );
  webSocket.onopen = () => {
    console.log("WebSocket connection established.");
  };

  webSocket.onerror = (event) => {
    console.error("WebSocket error:", event);
  };

  webSocket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      console.log("WebSocket message received:", data);
      handleWebSocketEvent(data);
    } catch (error) {
      console.error("Error parsing message:", error);
    }
  };

  webSocket.onclose = (event) => {
    console.log("WebSocket connection closed:", event);
  };
  webSocket$.set(webSocket);
}

export function handleWebSocketEvent(data: WSMessage) {
  if ("error" in data) {
    //TODO: add toast for error handling
    console.error(data.error);
    return;
  }
  switch (data.command) {
    case Command.GetData:
      if (!data.entries) {
        console.error("No entries to load");
        return;
      }
      entryState$.set(mapFromEntries(data.entries));
      globalState$.set((old) => ({
        ...old,
        rules: data.rules,
        isGameStarted: data.isGameStarted,
        isAcceptingEntries: data.isAcceptingEntries,
      }));
      break;
    case GlobalParamSettingCommand.SetRules:
      if (!data.value) {
        console.error("No rules provided");
        return;
      }
      notifications.show({
        title: "Rules updated",
        message: "Rules have been updated",
      });
      localCommands.setRules(data.value);
      break;
    case GlobalParamSettingCommand.SetIsAcceptingEntries:
    case GlobalParamSettingCommand.SetIsGameStarted:
      if (!("value" in data)) {
        console.error("No value provided");
        return;
      }
      if (typeof data.value !== "boolean") {
        console.error(`Invalid value (${data.value}) provided`);
        return;
      }
      notifications.show({
        title: data.command,
        message: "Value updated to" + data.value ? "true" : "false",
      });
      handleGlobalCommand(data.command, data.value);
      break;
    case Command.Create:
      if (!data.entry) {
        console.error("No entry data provided");
        return;
      }
      localCommands.createEntry(data.entry);
      break;
    case Command.Delete:
      if (!data.id) {
        console.error("No entry ID provided");
        return;
      }
      localCommands.deleteEntry(data.id);
      break;
    case Command.SetIsSafe:
    case Command.SetIsOnWheel:
    case Command.SetIsWinner:
      if (!data.id) {
        console.error("No entry ID provided");
        return;
      }
      if (data.value === undefined) {
        console.error("No value provided");
        return;
      }
      handleEntryCommand(data.command, data.id, data.value);
      break;
    default:
      //this should never happen... but just in case
      console.error("Invalid command:", data);
      break;
  }
}

function handleGlobalCommand(
  command: GlobalParamSettingCommand,
  value: boolean
) {
  switch (command) {
    case GlobalParamSettingCommand.SetIsAcceptingEntries:
      localCommands.setIsAcceptingEntries(value);
      return;
    case GlobalParamSettingCommand.SetIsGameStarted:
      localCommands.setIsGameStarted(value);
      return;
  }
  console.error("Invalid global command:", command);
}

function handleEntryCommand(command: Command, id: string, value: boolean) {
  switch (command) {
    case Command.SetIsSafe:
      localCommands.setIsSafe(id, value);
      return;
    case Command.SetIsOnWheel:
      localCommands.setIsOnWheel(id, value);
      return;
    case Command.SetIsWinner:
      localCommands.setIsWinner(id, value);
      return;
  }
  console.error("Invalid entry command:", command);
}
