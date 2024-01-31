import { Button } from "@mantine/core";
import { globalState$ } from "../../state/global-state";
import { startWebSockets } from "../../state/websocket-manager";
import { FullPageInfoMessage } from "../full-page-info-message/full-page-info-message";
import { WithState } from "@legendapp/state";
import { GlobalState } from "@shared/types";

export const getErrorMessage = (
  accessToken: string & WithState,
  isWebSocketOpen: boolean,
  globalState: GlobalState
) => {
  let errorMessage = undefined;
  if (accessToken.state?.isLoaded === false) {
    errorMessage = (
      <FullPageInfoMessage message="waiting for access token/no token" />
    );
  } else if (isWebSocketOpen === false) {
    errorMessage = (
      <FullPageInfoMessage message="not connected to websocket">
        <Button onClick={() => startWebSockets()}>try to reconnect</Button>
      </FullPageInfoMessage>
    );
  } else if (!globalState.isAcceptingEntries || !globalState.isGameStarted) {
    const list = [];
    if (!globalState$.isAcceptingEntries.get()) {
      list.push("start accepting entries");
    }
    if (!globalState$.isGameStarted.get()) {
      list.push("start the game");
    }
    errorMessage = (
      <FullPageInfoMessage
        message={`waiting for the streamer to ${list.join(" and ")}`}
      />
    );
  }
  return errorMessage;
};
