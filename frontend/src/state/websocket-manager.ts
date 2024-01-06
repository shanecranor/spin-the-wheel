import { localCommands } from "./local-commands";
import { entryState$, mapFromEntries } from "./entry-state";
import { observable } from "@legendapp/state";
import { WSMessage } from "@shared/websocket-types";

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
    case "setIsWinner":
      if (!data.id) {
        console.error("No entry ID provided");
        return;
      }
      localCommands.setIsWinner(data.id, data.value);
      break;
  }
}
