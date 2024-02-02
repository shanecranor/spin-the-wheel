import { observable } from "@legendapp/state";
import { GlobalState } from "@shared/types";

export const globalState$ = observable<GlobalState>({
  rules: "",
  isGameStarted: false,
  isAcceptingEntries: false,
  currencyInfo: [
    {
      name: "Sparks",
      minPrice: 0,
      maxPrice: "",
      cooldownMinutes: 5,
    },
    {
      name: "channel points",
      minPrice: 1000,
      maxPrice: 5000,
      cooldownMinutes: 5,
    },
  ],
});
