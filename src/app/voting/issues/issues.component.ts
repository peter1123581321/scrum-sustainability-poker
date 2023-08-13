import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { lastValueFrom, map } from 'rxjs';
import { CreateIssueDialogComponent } from './create-issue-dialog/create-issue-dialog.component';
import { ActivatedRoute } from '@angular/router';
import { IssueDataSourceService } from 'src/app/core/data-source/issue-data-source.service';
import { SnackbarService } from 'src/app/shared/snackbar.service';
import { Issue, IssueResult, IssueWithVotes } from 'src/app/shared/models/issue.model';
import { Room, RoomState } from 'src/app/shared/models/room.model';
import { RoomDataSourceService } from 'src/app/core/data-source/room-data-source.service';
import { AuthService } from 'src/app/core/auth.service';
import { RoomService } from 'src/app/core/room.service';
import { IssueService } from 'src/app/core/issue.service';
import { IssueDialogData } from 'src/app/shared/models/issue-dialog-data.model';
import { VoteDataSourceService } from 'src/app/core/data-source/vote-data-source.service';
import { Timestamp } from '@angular/fire/firestore';
import { TableIssueVoteResult } from 'src/app/shared/models/table.model';
import { Vote } from 'src/app/shared/models/vote.model';
import { Dimension } from 'src/app/shared/models/dimension.model';
import { ValueService } from 'src/app/shared/value.service';

@Component({
  selector: 'app-issues',
  templateUrl: './issues.component.html',
  styleUrls: ['./issues.component.scss']
})
export class IssuesComponent implements OnInit {

  private roomId = '';

  public openIssues: Issue[] = [];
  public finishedIssues: IssueResult[] = [];
  public currentRoom: Room | undefined;

  public issueResultDisplayedColumns: string[] = ['dimension', 'median', 'notSure'];

  @Output()
  public closeSidenav: EventEmitter<boolean> = new EventEmitter<boolean>();

  public get isLoadingIssues(): boolean {
    return this.issueService.isLoadingIssues;
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
   * Initializes a new instance of the {@link IssuesComponent} class.
   * @param route the injected activatedRoute service
   * @param dialog the injected service to open Material Design modal dialogs
   * @param snackbarService the injected snackbar service
   * @param valueService the injected value service
   * @param authService the injected auth service
   * @param roomService the injected room service
   * @param issueService the injected issue service
   * @param issueDataSourceService the injected issue dataSource service
   * @param roomDataSourceService the injected room dataSource service
   * @param voteDataSourceService the injected vote dataSource service
   */
  constructor(
    private readonly route: ActivatedRoute,
    private readonly dialog: MatDialog,
    private readonly snackbarService: SnackbarService,
    private readonly valueService: ValueService,
    private readonly authService: AuthService,
    private readonly roomService: RoomService,
    private readonly issueService: IssueService,
    private readonly issueDataSourceService: IssueDataSourceService,
    private readonly roomDataSourceService: RoomDataSourceService,
    private readonly voteDataSourceService: VoteDataSourceService,
  ) { }

  /**
   * Implements the init method. See {@link OnInit}.
   */
  ngOnInit(): void {
    this.roomId = this.route.snapshot.paramMap.get('roomId') ?? '';
    this.setupSubscriptions();
  }

  /**
   * Open a new issue dialog for creating a new issue.
   */
  public async openDialogToCreateNewIssue(): Promise<void> {
    const dialogRef = this.dialog.open(CreateIssueDialogComponent, {
      data: { roomId: this.roomId, isNewIssue: true } as IssueDialogData,
      width: '500px',
      maxHeight: '80vh',
      panelClass: 'dialog-no-padding',
      disableClose: true,
    });

    await lastValueFrom(dialogRef.afterClosed());
  }

  /**
   * Close the currently opened sidenav container.
   */
  public closeSidenavClicked(): void {
    this.closeSidenav.emit(true);
  }

  /**
   * Start voting for the provided issue.
   * @param issue the issue for which to vote
   */
  public voteIssue(issue: Issue): void {
    this.roomDataSourceService.setStateForRoom(this.roomId, RoomState.Voting, issue.id ?? '');
  }

  /**
   * Open a new confirm dialog to delete an issue.
   * @param issue the issue to delete
   */
  public deleteIssue(issue: Issue): void {
    if (confirm(`Do you really want to delete the issue '${issue.title} (${issue.key})'?`)) {
      this.issueDataSourceService.deleteIssue(issue.id ?? '', this.roomId)
        .catch((error) => {
          this.snackbarService.openSnackBar('Could not delete issue. Please try again.', false);
          console.error('ERROR in IssuesComponent - deleteIssue', error);
        });
    }
  }

  /**
   * Open a new issue dialog for updating an existing issue.
   * @param issue the issue to update and being injected to the update dialog
   */
  public async openDialogToEditIssue(issue: Issue): Promise<void> {
    const dialogRef = this.dialog.open(CreateIssueDialogComponent, {
      data: { roomId: this.roomId, isNewIssue: false, issue: issue } as IssueDialogData,
      width: '500px',
      maxHeight: '80vh',
      panelClass: 'dialog-no-padding',
      disableClose: true,
    });

    await lastValueFrom(dialogRef.afterClosed());
  }

  /**
   * Import issues from a CSV file.
   * @param event the event containing the file to import
   */
  public onCSVFileSelected(event: Event): void {
    const target = event.target as HTMLInputElement;
    const files = target.files;

    // check if a CSV file was selected
    if (!files || !files[0] || files[0].type !== 'text/csv') {
      return;
    }

    const newIssues: Issue[] = [];
    const reader = new FileReader();

    reader.onload = (e: ProgressEvent<FileReader>) => {
      const csvdata = e.target?.result;
      if (csvdata) {
        // split the CSV data into rows
        const rowData: string[] = (csvdata as string).split('\n');

        // iterate over the rows and split them into columns
        rowData.forEach((row: string) => {
          const rowElements: string[] = row.split(';');

          // if the row contains at least two columns (i.e. key and title), add a new issue to the issue array
          if (rowElements && rowElements.length >= 2 && rowElements[0] && rowElements[1]) {
            newIssues.push({
              key: rowElements[0].trim(),
              title: rowElements[1].trim(),
              createdAt: Timestamp.now(),
              finishedVoting: false,
              isDefaultIssue: false
            });
          }
        });
      }
    };

    reader.readAsText(files[0]);

    reader.onloadend = () => {
      if (newIssues && newIssues.length > 0) {
        this.issueDataSourceService.addIssues(newIssues, this.roomId)
          .then(() => {
            this.snackbarService.openSnackBar('Issues have been imported.', true);
          })
          .catch((error) => {
            this.snackbarService.openSnackBar('Issues could not be imported. Please try again.', false);
            console.error('ERROR in IssuesComponent - onFileSelected', error);
          });
      } else {
        this.snackbarService.openSnackBar('No issues have been imported.', false);
      }
    };

    reader.onerror = (error) => {
      this.snackbarService.openSnackBar('Issues could not be imported. Please try again.', false);
      console.error('ERROR in IssuesComponent - onerror', error);
    };
  }

  /**
   * Setup the subscriptions for the component.
   */
  private setupSubscriptions(): void {
    this.roomService.currentRoom$.subscribe(room => {
      this.currentRoom = room;
    });

    this.issueService.openIssues$.subscribe(issues => {
      this.openIssues = issues;
    });

    this.issueService.finishedIssues$.pipe(
      map((issues: Issue[]) => {
        // convert the finished issues to IssueResult objects, because for
        // finished issues we need to display additional information (i.e. nrOfPlayersVoted, median)
        const finsihedIssues: IssueResult[] = [];
        issues.forEach((issue: Issue) => {
          finsihedIssues.push({
            issue: issue,
            nrOfPlayersVoted: undefined,
            result: undefined
          });
        });
        return finsihedIssues;
      })
    ).subscribe((issues: IssueResult[]) => {
      // only update the finished issues if the number of finished issues has changed (i.e. a issue has been finished),
      // because finishedIssues$ also fires, for example, when a new issue has been created
      if (this.finishedIssues.length !== issues.length) {
        this.finishedIssues = issues;

        this.loadAndPrepareResultsForFinishedIssues();
      }
    });
  }

  /**
   * Loads the votes for the finished issues and prepares the results (i.e. nrOfPlayersVoted, median).
   */
  private loadAndPrepareResultsForFinishedIssues(): void {
    if (!this.currentRoom) {
      return;
    }

    const currentRoomId = this.currentRoom.id ?? '';

    // load all finished issues from the database
    this.issueDataSourceService.getFinishedIssues(currentRoomId)
      .then((finishedIssuesOfCurrentRoom: Issue[]) => {
        const promises: Promise<IssueWithVotes>[] = [];
        finishedIssuesOfCurrentRoom.forEach((finishedIssue: Issue) => {
          promises.push(this.voteDataSourceService.getVotesForIssue(currentRoomId, finishedIssue.id ?? ''));
        });

        Promise.all(promises)
          .then((issuesWithVotes: IssueWithVotes[]) => {
            this.prepareIssueResults(issuesWithVotes);
          });
      })
      .catch((error) => {
        console.error('ERROR in IssuesComponent - loadAndPrepareResultsForFinishedIssues', error);
      });
  }

  /**
   * Prepares the results (i.e. nrOfPlayersVoted, median) for the finished issues.
   * @param issuesWithVotes the issues with votes
   */
  private prepareIssueResults(issuesWithVotes: IssueWithVotes[]): void {
    this.finishedIssues.forEach((finishedIssue: IssueResult) => {
      finishedIssue.nrOfPlayersVoted = this.getNrOfPlayersVoted(finishedIssue.issue, issuesWithVotes);
      finishedIssue.result = this.getTableDataSource(finishedIssue.issue, issuesWithVotes);
    });
  }

  /**
   * Returns the number of players who voted for the issue.
   * @param issue the issue for which to get the number of players who voted
   * @param issuesWithVotes the issues with votes
   * @returns number of players who voted for the issue
   */
  private getNrOfPlayersVoted(issue: Issue, issuesWithVotes: IssueWithVotes[]): number {
    const issueVote = issuesWithVotes.find(x => x.issueId === issue.id ?? '');

    if (issueVote) {
      return issueVote.votes.length;
    } else {
      return 0;
    }
  }

  /**
   * Returns the table data source for the finished issue.
   * @param issue the (finished) issue for which to get the table data source
   * @param issuesWithVotes the issues with votes
   * @returns data source for the finished issue table
   */
  private getTableDataSource(issue: Issue, issuesWithVotes: IssueWithVotes[]): TableIssueVoteResult[] {
    const issueVote = issuesWithVotes.find(x => x.issueId === issue.id);

    if (!issueVote) {
      return [];
    }

    // key is the property name of Vote object
    const dimensions = [
      { key: 'socialValue', dimension: Dimension.Social },
      { key: 'individualValue', dimension: Dimension.Individual },
      { key: 'environmentalValue', dimension: Dimension.Environmental },
      { key: 'economicalValue', dimension: Dimension.Economical },
      { key: 'technicalValue', dimension: Dimension.Technical }
    ];

    const results = dimensions.map(({ key, dimension }) => {
      const values: number[] = issueVote.votes.filter(x => x[key as keyof Vote] !== null).map(x => x[key as keyof Vote]) as number[];
      const notSure: number = issueVote.votes.filter(x => x[key as keyof Vote] === null).length;

      return {
        dimension,
        median: this.valueService.calcMedian(values),
        notSure
      };
    });

    return results;
  }

}
