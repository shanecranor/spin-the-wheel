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
    isOnWheel: false,
    isWinner: false,
  },
  {
    id: 2,
    text: "play valorant",
    author: "GamerGalaxy",
    isSafe: true,
    isOnWheel: false,
  },
  {
    id: 3,
    text: "cry",
    author: "TearsOfJoy",
    isSafe: true,
    isOnWheel: false,
  },
  {
    id: 4,
    text: "eat spicy chip",
    author: "SpicyFanatic",
    isSafe: true, // Assuming it's generally safe
    isOnWheel: false,
  },
  {
    id: 5,
    text: "do a really long task ie the entire B movie script",
    author: "guy with a really long and annoying username becaause why not",
    isSafe: true,
    isOnWheel: false,
  },
  {
    id: 6,
    text: "100 pushups",
    author: "FitnessFreak",
    isSafe: true, // Assuming general fitness level of audience
    isOnWheel: false,
  },
];

export const entryState$ = observable<EntryProps[]>(tempEntryData);
