import { Issue } from './issue.model';

export interface IssueDialogData {
  roomId: string;
  isNewIssue: boolean;
  issue: Issue | undefined;
}
