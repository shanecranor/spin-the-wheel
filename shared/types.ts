export interface EntryProps {
  id: string | number;
  text: string;
  author: string;
  isSafe: boolean;
  isOnWheel: boolean;
  isWinner?: boolean;
}
