import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { MatAccordion } from '@angular/material/expansion';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';
import { AuthService } from 'src/app/core/auth.service';
import { IssueDataSourceService } from 'src/app/core/data-source/issue-data-source.service';
import { RoomDataSourceService } from 'src/app/core/data-source/room-data-source.service';
import { VoteDataSourceService } from 'src/app/core/data-source/vote-data-source.service';
import { RoomService } from 'src/app/core/room.service';
import { UserService } from 'src/app/core/user.service';
import { VoteService } from 'src/app/core/vote.service';
import { DEFAULT_ISSUE_ID } from 'src/app/shared/constants.config';
import { CustomUser, CustomUserWithVotes } from 'src/app/shared/models/custom-user.model';
import { Dimension } from 'src/app/shared/models/dimension.model';
import { IssueWithVotes } from 'src/app/shared/models/issue.model';
import { Room, RoomState, RoomTimer } from 'src/app/shared/models/room.model';
import { TableUserVoteResult } from 'src/app/shared/models/table.model';
import { Vote } from 'src/app/shared/models/vote.model';
import { SnackbarService } from 'src/app/shared/snackbar.service';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss']
})
export class OverviewComponent implements OnInit {

  private roomId = '';
  public users: CustomUserWithVotes[] = [];
  public votes: Vote[] = [];
  public currentRoom: Room | undefined;
  public timer: RoomTimer | undefined;
  public startingVotingWithoutIssue = false;

  public userResultDisplayedColumns: string[] = ['dimension', 'value'];

  @ViewChild('userAccordion', { static: false })
  public userAccordion: MatAccordion | undefined;

  @Output()
  public openSidenav: EventEmitter<boolean> = new EventEmitter<boolean>();

  public get invitationLink(): string {
    return `${location.href}`;
  }

  public get isHost(): boolean {
    return this.authService.isHost;
  }

  public get isIdleState(): boolean {
    return this.currentRoom?.currentState === RoomState.Idle;
  }

  public get isVotingState(): boolean {
    return this.currentRoom?.currentState === RoomState.Voting;
  }

  public get isResultState(): boolean {
    return this.currentRoom?.currentState === RoomState.Results;
  }

  /**
   * Initializes a new instance of the {@link OverviewComponent} class.
   * @param route the injected activatedRoute service
   * @param snackbarService the injected snackbar service
   * @param authService the injected auth service
   * @param roomService the injected room service
   * @param userService the injected user service
   * @param voteService the injected vote service
   * @param roomDataSourceService the injected room dataSource service
   * @param issueDataSourceService the injected issue dataSource service
   * @param voteDataSourceService the injected vote dataSource service
   */
  constructor(
    private readonly route: ActivatedRoute,
    private readonly snackbarService: SnackbarService,
    private readonly authService: AuthService,
    private readonly roomService: RoomService,
    private readonly userService: UserService,
    private readonly voteService: VoteService,
    private readonly roomDataSourceService: RoomDataSourceService,
    private readonly issueDataSourceService: IssueDataSourceService,
    private readonly voteDataSourceService: VoteDataSourceService
  ) { }

  /**
   * Implements the init method. See {@link OnInit}.
   */
  ngOnInit(): void {
    this.roomId = this.route.snapshot.paramMap.get('roomId') ?? '';
    this.setupSubscriptions();
  }

  /**
   * Copy the invitation link to the clipboard.
   */
  public copyInvitationLink(): void {
    navigator.clipboard.writeText(this.invitationLink);
    this.snackbarService.openSnackBar('Invitation link copied.', true);
  }

  /**
   * Emits the openSidenav event.
   */
  public openIssueSidenav(): void {
    this.openSidenav.emit(true);
  }

  /**
   * Sets the timer values in the room document to start the timer.
   * @param seconds the seconds to start the timer with
   */
  public startTimer(seconds: number): void {
    this.roomDataSourceService.setTimerValues(this.roomId, seconds);
  }

  /**
   * Resets the timer values in the room document to stop the timer.
   */
  public stopTimer(): void {
    this.roomDataSourceService.resetTimerValues(this.roomId);
  }

  /**
   * Starts the voting without an issue by setting the room state to 'voting' and the current issue id to the default issue id.
   */
  public startVotingWithoutIssue(): void {
    this.startingVotingWithoutIssue = true;

    /**
     * It can be the case that a voting without an issue has already been performed.
     * Therefore we have to delete all existing votes for this default issue, so that the users can submit their new votes.
     * One way would be to delete the entire issue document, however deleting a document in firestore does not delete its
     * subcollections (see https://firebase.google.com/docs/firestore/manage-data/delete-data?hl=en#delete_documents).
     * Also, only deleting the 'votes' collection of the default issue cannot/should not be done (see
     * https://firebase.google.com/docs/firestore/manage-data/delete-data?hl=en#collections).
     *
     * The 'workaround' for this problem is that we first load all votes for the default issue.
     * Then we delete all the votes using Promise.all - this promise fulfills when all of the input's promises fulfill,
     * so in our case when all deletes have been performed.
     * Then, we create the default issue in case it has not been created yet (when it has already been created, firestore skips the creation).
     * And finally we set the room state to 'voting' and the current voting issue to the default issue.
     */
    this.voteDataSourceService.getVotesForIssue(this.roomId, DEFAULT_ISSUE_ID)
      .then((issueWithVotes: IssueWithVotes) => {
        const deletePromises: Promise<void>[] = [];
        issueWithVotes.votes.forEach((vote: Vote) => {
          deletePromises.push(this.voteDataSourceService.deleteVote(this.roomId, DEFAULT_ISSUE_ID, vote.id ?? ''));
        });

        Promise.all(deletePromises)
          .then(() => {
            // create the default issue again and set the current state for the room
            const votingPreparePromises: Promise<void>[] = [];
            votingPreparePromises.push(this.issueDataSourceService.createDefaultIssue(this.roomId));
            votingPreparePromises.push(this.roomDataSourceService.setStateForRoom(this.roomId, RoomState.Voting, DEFAULT_ISSUE_ID));

            Promise.all(votingPreparePromises)
              .then(() => {
                this.startingVotingWithoutIssue = false;
              })
              .catch((error) => {
                this.startingVotingWithoutIssue = false;
                this.snackbarService.openSnackBar('Voting without issue could not started. Please try again.', false);
                console.error('ERROR in OverviewComponent - startVotingWithoutIssue (Promise.all votingPreparePromises)', error);
              });
          })
          .catch((error) => {
            this.startingVotingWithoutIssue = false;
            this.snackbarService.openSnackBar('Voting without issue could not started. Please try again.', false);
            console.error('ERROR in OverviewComponent - startVotingWithoutIssue (Promise.all deletePromises)', error);
          });
      })
      .catch((error) => {
        this.startingVotingWithoutIssue = false;
        this.snackbarService.openSnackBar('Voting without issue could not started. Please try again.', false);
        console.error('ERROR in OverviewComponent - startVotingWithoutIssue (getVotesForIssue)', error);
      });
  }

  /**
   * Setup the subscriptions for the component.
   */
  private setupSubscriptions(): void {
    this.roomService.currentRoom$.subscribe(room => {
      if (room) {
        if (this.currentRoom?.currentState !== room.currentState) {
          // state of the room has changed - close all open expansion panels (e.g. for voting)
          this.userAccordion?.closeAll();
        }

        this.currentRoom = room;
      }
    });

    this.userService.users$.pipe(
      map((users: CustomUser[]) => {
        // convert the users to CustomUserWithVotes objects, because for
        // users in the overview panel we need to display the submitted votes
        const usersWithVotes: CustomUserWithVotes[] = [];
        users.forEach((user: CustomUser) => {
          usersWithVotes.push({
            user: user,
            votes: this.getTableDataSource(user.id)
          });
        });
        return usersWithVotes;
      })
    ).subscribe((usersWithVotes: CustomUserWithVotes[]) => {
      this.users = usersWithVotes;
    });

    this.roomService.timer$.subscribe(timer => {
      this.timer = timer; // set the timer in the overview component to enable/disable the timer button
    });

    this.voteService.votes$.subscribe(votes => {
      this.votes = votes;

      this.users.forEach((userWithVotes: CustomUserWithVotes) => {
        userWithVotes.votes = this.getTableDataSource(userWithVotes.user.id);
      });
    });
  }

  /**
   * Returns the data source for the table with the votes of the user.
   * @param userId the id of the user for which the votes should be retrieved
   * @returns data source for the table with the votes of the user
   */
  private getTableDataSource(userId: string): TableUserVoteResult[] {
    const vote = this.votes.find(x => x.user === userId);
    if (vote) {
      return [
        { dimension: Dimension.Social, value: vote.socialValue },
        { dimension: Dimension.Individual, value: vote.individualValue },
        { dimension: Dimension.Environmental, value: vote.environmentalValue },
        { dimension: Dimension.Economical, value: vote.economicalValue },
        { dimension: Dimension.Technical, value: vote.technicalValue }
      ];
    } else {
      return [];
    }
  }

}
