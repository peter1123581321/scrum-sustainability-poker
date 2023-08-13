import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { onSnapshot, Firestore, query, collection, Unsubscribe, where } from '@angular/fire/firestore';
import { Issue } from '../shared/models/issue.model';
import { RoomService } from './room.service';
import { Room } from '../shared/models/room.model';
import { IssueDataSourceService } from './data-source/issue-data-source.service';

@Injectable({
  providedIn: 'root'
})
export class IssueService {

  private issueSubscription: Unsubscribe | undefined;
  private issuesVal = new BehaviorSubject<Array<Issue>>([]);
  private currentIssueVal = new BehaviorSubject<Issue | undefined>(undefined);
  private isLoadingIssuesVal = new BehaviorSubject<boolean>(false);

  public get openIssues$(): Observable<Issue[]> {
    return this.issuesVal.pipe(
      map((issues) => {
        return issues.filter(x => !x.finishedVoting);
      })
    );
  }

  public get finishedIssues$(): Observable<Issue[]> {
    return this.issuesVal.pipe(
      map((issues) => {
        return issues.filter(x => x.finishedVoting);
      })
    );
  }

  public get currentIssue$(): Observable<Issue | undefined> {
    return this.currentIssueVal.asObservable();
  }

  public set isLoadingIssues(value: boolean) {
    this.isLoadingIssuesVal.next(value);
  }

  public get isLoadingIssues(): boolean {
    return this.isLoadingIssuesVal.value;
  }

  /**
   * Initializes a new instance of the {@link IssueService} class.
   * @param firestore the injected firestore service
   * @param roomService the injected room service
   * @param issueDataSourceService the injected issue dataSource service
   */
  constructor(
    private readonly firestore: Firestore,
    private readonly roomService: RoomService,
    private readonly issueDataSourceService: IssueDataSourceService
  ) {
    // Subscribe to changes of the current room id and setup the issue subscription.
    // Here, we just listen to the id, because for setting up issues, we only need the
    // room id, we do not need to change the issue subscription when other properties of
    // the room changes.
    this.roomService.currentRoomId$.subscribe((roomId: string | undefined) => {
      if (roomId) {
        this.setupIssueSubscription(roomId);
      }
    });

    // Subscribe to changes of the current room.
    // Here, we need to listen to the whole room, because we need to know, when the
    // currentIssue changes, so we set the currentIssueVal accordingly.
    this.roomService.currentRoom$.subscribe((room: Room | undefined) => {
      if (room && room.currentIssue && room.currentIssue !== this.currentIssueVal.value?.id) {
        this.issueDataSourceService.getIssue(room.id ?? '', room.currentIssue)
          .then((issue: Issue | null) => {
            if (issue) {
              this.currentIssueVal.next(issue);
            } else {
              this.currentIssueVal.next(undefined);
            }
          })
          .catch((error) => {
            console.error('ERROR in IssueService - constructor', error);
          });
      }
    });
  }

  /**
   * Sets up and manages all subscriptions needed for the management of issues.
   * @param roomId the id of the room for which the issues are managed
   */
  private setupIssueSubscription(roomId: string): void {
    if (this.issueSubscription) {
      this.issueSubscription(); // unsubscribe from existing subscription
    }

    const q = query(
      collection(this.firestore, 'rooms', roomId, 'issues'),
      where('isDefaultIssue', '==', false)
    );

    this.issueSubscription = onSnapshot(q, (querySnapshot) => {
      this.isLoadingIssuesVal.next(true);

      const issues: Issue[] = [];
      querySnapshot.forEach((doc) => {
        issues.push({
          id: doc.id,
          ...doc.data()
        } as Issue);
      });

      // order issues by title
      issues.sort((a: Issue, b: Issue) => {
        if (a.title < b.title)
          return -1;
        if (a.title > b.title)
          return 1;
        return 0;
      });

      this.issuesVal.next(issues);
      this.isLoadingIssuesVal.next(false);
    });
  }
}
