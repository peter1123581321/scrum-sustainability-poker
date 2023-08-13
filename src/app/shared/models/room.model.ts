import { Timestamp } from 'firebase/firestore';

export interface Room {
  id?: string;
  name: string;
  createdAt: Timestamp;
  host?: string;
  currentIssue?: string;
  currentState: RoomState;
  timerStartAt?: Timestamp;
  timerSeconds?: number;
}

export interface RoomTimer {
  timerStartAt: Timestamp;
  timerSeconds: number;
}

export enum RoomState {
  Idle,
  Voting,
  Results,
}
