import {
  getUserClient,
  getOrgClient,
  getOrgUserClient,
  initTruffleApp,
  getEmbed,
  getAccessToken,
} from "@trufflehq/sdk";
import { fromSpecObservable } from "./util.ts";
import { observable } from "@legendapp/state";
const staging = "https://mothertree.staging.bio/graphql";
const prod = "https://mothertree.truffle.vip/graphql";
export const mothertreeApiUrl = staging || prod;

initTruffleApp({
  url: mothertreeApiUrl,
});

export const embed = getEmbed();
export const user$ = fromSpecObservable(getUserClient().observable);
export const org$ = fromSpecObservable(getOrgClient().observable);
export const orgUser$ = fromSpecObservable(getOrgUserClient().observable);
export const accessToken$ = observable<Promise<string> | string>(
  getAccessToken()
);
