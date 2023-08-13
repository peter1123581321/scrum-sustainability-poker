import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { onSnapshot, Firestore, query, collection } from '@angular/fire/firestore';
import { RoomService } from './room.service';
import { Vote } from '../shared/models/vote.model';
import { IssueService } from './issue.service';
import { Unsubscribe } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})
export class VoteService {

  private voteSubscription: Unsubscribe | undefined;
  private votesVal = new BehaviorSubject<Array<Vote>>([]);

  public get votes$(): Observable<Vote[]> {
    return this.votesVal.asObservable();
  }

  /**
   * Initializes a new instance of the {@link VoteService} class.
   * @param firestore the injected firestore service
   * @param roomService the injected room service
   * @param issueService the injected issue service
   */
  constructor(
    private readonly firestore: Firestore,
    private readonly roomService: RoomService,
    private readonly issueService: IssueService
  ) {
    combineLatest(this.roomService.currentRoomId$, this.issueService.currentIssue$).subscribe(([roomId, issue]) => {
      if (roomId && issue) {
        this.setupVoteSubscription(roomId, issue.id ?? '');
      }
    });
  }

  /**
   * Sets up and manages all subscriptions needed for the management of votes.
   * @param roomId the roomId where the issue is stored
   * @param issueId the id of the issue for which the votes are managed
   */
  private setupVoteSubscription(roomId: string, issueId: string): void {
    if (this.voteSubscription) {
      this.voteSubscription(); // unsubscribe from existing subscription
    }

    const q = query(
      collection(this.firestore, 'rooms', roomId, 'issues', issueId, 'votes')
    );

    this.voteSubscription = onSnapshot(q, (querySnapshot) => {
      const votes: Vote[] = [];
      querySnapshot.forEach((doc) => {
        votes.push({
          id: doc.id,
          ...doc.data()
        } as Vote);
      });

      this.votesVal.next(votes);
    });
  }
}
