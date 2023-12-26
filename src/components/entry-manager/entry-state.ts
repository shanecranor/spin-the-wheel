import { observable } from "@legendapp/state";


export interface EntryProps {
  id: number;
  text: string;
  author: string;
  isSafe: boolean;
  isSentToWheel: boolean;
}

const tempEntryData: EntryProps[] = [
  {
    id: 1,
    text: "end stream",
    author: "User123",
    isSafe: true,
    isSentToWheel: true,
  },
  {
    id: 2,
    text: "play valorant",
    author: "GamerGalaxy",
    isSafe: true,
    isSentToWheel: true,
  },
  {
    id: 3,
    text: "cry",
    author: "TearsOfJoy",
    isSafe: true,
    isSentToWheel: true,
  },
  {
    id: 4,
    text: "eat spicy chip",
    author: "SpicyFanatic",
    isSafe: true, // Assuming it's generally safe
    isSentToWheel: true,
  },
  {
    id: 5,
    text: "jumping jacks",
    author: "ActiveStreamer",
    isSafe: true,
    isSentToWheel: true,
  },
  {
    id: 6,
    text: "100 pushups",
    author: "FitnessFreak",
    isSafe: true, // Assuming general fitness level of audience
    isSentToWheel: true,
  },
];


export const entryState$ = observable<EntryProps[]>(tempEntryData)