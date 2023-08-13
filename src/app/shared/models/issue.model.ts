import { Timestamp } from 'firebase/firestore';
import { TableIssueVoteResult } from './table.model';
import { Vote } from './vote.model';

export interface Issue {
  id?: string;
  key: string;
  title: string;
  createdAt: Timestamp;
  finishedVoting: boolean;
  isDefaultIssue: boolean;
}

export interface IssueWithVotes {
  issueId: string;
  votes: Vote[];
}

export interface IssueResult {
  issue: Issue;
  nrOfPlayersVoted: number | undefined;
  result: TableIssueVoteResult[] | undefined;
}
