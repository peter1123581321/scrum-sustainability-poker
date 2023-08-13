export interface TableUserVoteResult {
  dimension: string;
  value: number | null;
}

export interface TableIssueVoteResult {
  dimension: string;
  median: number | undefined;
  notSure: number | undefined;
}
