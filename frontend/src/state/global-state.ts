import { observable } from "@legendapp/state";
import { GlobalState } from "@shared/types";

export const globalState$ = observable<GlobalState>({
  rules: "",
  isGameStarted: false,
  isAcceptingEntries: false,
});
