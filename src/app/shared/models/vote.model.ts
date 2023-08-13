import { Timestamp } from 'firebase/firestore';

export interface Vote {
  id?: string;
  createdAt: Timestamp;
  user: string;
  /**
   * The following properties are used in the VotingBoardComponent and IssuesComponent as string
   * (name of the properties as string) to genericly access the different values of the vote.
   * Therefore, if you change the name of one of these properties, you have to change it in the
   * VotingBoardComponent and IssuesComponent as well.
   */
  socialValue: number | null;
  individualValue: number | null;
  environmentalValue: number | null;
  economicalValue: number | null;
  technicalValue: number | null;
}
