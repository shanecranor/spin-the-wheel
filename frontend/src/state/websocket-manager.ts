import { localCommands } from "./local-commands";
import { entryState$, mapFromEntries } from "./entry-state";
import { observable } from "@legendapp/state";
import { WSMessage } from "@shared/websocket-types";

export const webSocket$ = observable<WebSocket | null>(null);

export function StartWebSockets() {
  const webSocket = new WebSocket(
    "wss://wheel-entry-worker.shanecranor.workers.dev?name=a"
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
    case "Get data":
      if (!data.entries) {
        console.error("No entries to load");
        return;
      }
      entryState$.set(mapFromEntries(data.entries));
      break;
    case "Create":
      if (!data.entry) {
        console.error("No entry data provided");
        return;
      }
      localCommands.createEntry(data.entry);
      break;
    case "Delete":
      if (!data.id) {
        console.error("No entry ID provided");
        return;
      }
      localCommands.deleteEntry(data.id);
      break;
    case "setIsSafe":
      if (!data.id) {
        console.error("No entry ID provided");
        return;
      }
      localCommands.setIsSafe(data.id, true);
      break;
    case "setIsOnWheel":
      if (!data.id) {
        console.error("No entry ID provided");
        return;
      }
      localCommands.setIsOnWheel(data.id, data.value);
      break;
  }
}
