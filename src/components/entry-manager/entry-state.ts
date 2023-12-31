import { observable } from "@legendapp/state";

export interface EntryProps {
  id: number;
  text: string;
  author: string;
  isSafe: boolean;
  isOnWheel: boolean;
  isWinner?: boolean;
}

const tempEntryData: EntryProps[] = [
  {
    id: 1,
    text: "end stream",
    author: "User123",
    isSafe: true,
    isOnWheel: true,
    isWinner: false,
  },
  {
    id: 2,
    text: "play valorant",
    author: "GamerGalaxy",
    isSafe: true,
    isOnWheel: true,
  },
  {
    id: 3,
    text: "cry",
    author: "TearsOfJoy",
    isSafe: true,
    isOnWheel: true,
  },
  {
    id: 4,
    text: "eat spicy chip",
    author: "SpicyFanatic",
    isSafe: true, // Assuming it's generally safe
    isOnWheel: true,
  },
  {
    id: 5,
    text: "jumping jacks",
    author: "ActiveStreamer",
    isSafe: true,
    isOnWheel: true,
  },
  {
    id: 6,
    text: "100 pushups",
    author: "FitnessFreak",
    isSafe: true, // Assuming general fitness level of audience
    isOnWheel: true,
  },
];

export const entryState$ = observable<EntryProps[]>(
  tempEntryData
    .concat(tempEntryData.map((entry) => ({ ...entry, id: entry.id + 6 })))
    .concat(tempEntryData.map((entry) => ({ ...entry, id: entry.id + 12 })))
);
