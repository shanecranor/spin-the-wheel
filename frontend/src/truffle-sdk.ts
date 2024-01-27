import {
  initTruffleApp,
  getEmbed,
  getAccessToken,
  getMtClient,
} from "@trufflehq/sdk";
import { observable } from "@legendapp/state";
const staging = "https://mothertree.staging.bio/graphql";
const prod = "https://mothertree.truffle.vip/graphql";
export const mothertreeApiUrl = prod || staging;

initTruffleApp({
  url: mothertreeApiUrl,
});

export const mtClient = getMtClient();
export const embed = getEmbed();
export const org$ = observable(mtClient.getOrg());
export const orgMember$ = observable(mtClient.getOrgMember());
export const accessToken$ = observable(getAccessToken());
