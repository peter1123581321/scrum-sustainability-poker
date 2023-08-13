import { TableUserVoteResult } from "./table.model";

export interface CustomUser {
  id: string; // must be the generated UID from the authenticated user
  displayName: string;
  isActive: boolean;
}

export interface CustomUserWithVotes {
  user: CustomUser;
  votes: TableUserVoteResult[];
}
