import { CustomStepDefinition, LabelType, Options } from '@angular-slider/ngx-slider';
import { Component, OnInit } from '@angular/core';
import { getAuth } from '@angular/fire/auth';
import { DocumentData, DocumentReference, Timestamp } from '@angular/fire/firestore';
import { AuthService } from 'src/app/core/auth.service';
import { IssueDataSourceService } from 'src/app/core/data-source/issue-data-source.service';
import { RoomDataSourceService } from 'src/app/core/data-source/room-data-source.service';
import { VoteDataSourceService } from 'src/app/core/data-source/vote-data-source.service';
import { IssueService } from 'src/app/core/issue.service';
import { RoomService } from 'src/app/core/room.service';
import { VoteService } from 'src/app/core/vote.service';
import { DEFAULT_ISSUE_ID, SLIDER_CEIL, SLIDER_FLOOR } from 'src/app/shared/constants.config';
import { Dimension } from 'src/app/shared/models/dimension.model';
import { Issue } from 'src/app/shared/models/issue.model';
import { Room, RoomState } from 'src/app/shared/models/room.model';
import { Vote } from 'src/app/shared/models/vote.model';
import { SnackbarService } from 'src/app/shared/snackbar.service';
import { getColorForVotingValue } from 'src/app/shared/util/color.util';
import { ValueService } from 'src/app/shared/value.service';

@Component({
  selector: 'app-voting-board',
  templateUrl: './voting-board.component.html',
  styleUrls: ['./voting-board.component.scss']
})
export class VotingBoardComponent implements OnInit {

  public submittingVote = false;
  public finishingVoting = false;
  public loadingVoteOfCurrentUser = false;

  public socialValue = 0;
  public individualValue = 0;
  public environmentalValue = 0;
  public economicalValue = 0;
  public technicalValue = 0;

  public socialMedian: number | undefined = 0;
  public individualMedian: number | undefined = 0;
  public environmentalMedian: number | undefined = 0;
  public economicalMedian: number | undefined = 0;
  public technicalMedian: number | undefined = 0;

  public votingOptions: Options = {
    ceil: SLIDER_CEIL,
    floor: SLIDER_FLOOR,
    step: 1,
    showSelectionBarFromValue: 0,
    showSelectionBar: false,
    showTicks: true,
    getSelectionBarColor: (value: number): string => getColorForVotingValue(value),
    getPointerColor: (value: number): string => getColorForVotingValue(value)
  };

  public defaultResultOptions: Options = {
    readOnly: true,
    ceil: SLIDER_CEIL,
    floor: SLIDER_FLOOR,
    /**
     * When calculating the median the result can get .5
     * To display this value on the slider, the step has to be 0.5
     */
    step: 0.5,
    /**
     * To be able to show all possible median values, the possible
     * ticks (bullets shown on the slider) are -5, -4.5, -4, -3.5 ..... 3.5, 4, 4.5, 5
     * 'ticksArray' works with index and because we only want to show a bullet for
     * whole numbers, we skip every second index, which would be the decimal numbers
     */
    ticksArray: [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20],
    showSelectionBar: false,
    showTicks: true,
    showTicksValues: true
  };

  public socialResultOptions: Options = Object.assign({}, this.defaultResultOptions);
  public individualResultOptions: Options = Object.assign({}, this.defaultResultOptions);
  public environmentalResultOptions: Options = Object.assign({}, this.defaultResultOptions);
  public economicalResultOptions: Options = Object.assign({}, this.defaultResultOptions);
  public technicalResultOptions: Options = Object.assign({}, this.defaultResultOptions);

  public socialNotSureCounter = 0;
  public individualNotSureCounter = 0;
  public environmentalNotSureCounter = 0;
  public economicalNotSureCounter = 0;
  public technicalNotSureCounter = 0;

  public hideSocialSlider = false;
  public hideIndividualSlider = false;
  public hideEnvironmentalSlider = false;
  public hideEconomicalSlider = false;
  public hideTechnicalSlider = false;

  public showSocialInfoOverlay = false;
  public showIndividualInfoOverlay = false;
  public showEnvironmentalInfoOverlay = false;
  public showEconomicalInfoOverlay = false;
  public showTechnicalInfoOverlay = false;

  public currentRoom: Room | undefined;
  public currentIssue: Issue | undefined;
  public submittedVoteId: string | undefined;
  private votes: Vote[] = [];

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
   * Initializes a new instance of the {@link VotingBoardComponent} class.
   * @param authService the injected auth service
   * @param roomService the injected room service
   * @param voteService the injected vote service
   * @param issueService the injected issue service
   * @param snackbarService the injected snackbar service
   * @param valueService the injected value service
   * @param roomDataSourceService the injected room dataSource service
   * @param issueDataSourceService the injected issue dataSource service
   * @param voteDataSourceService the injected vote dataSource service
   */
  constructor(
    private readonly authService: AuthService,
    private readonly roomService: RoomService,
    private readonly voteService: VoteService,
    private readonly issueService: IssueService,
    private readonly snackbarService: SnackbarService,
    private readonly valueService: ValueService,
    private readonly roomDataSourceService: RoomDataSourceService,
    private readonly issueDataSourceService: IssueDataSourceService,
    private readonly voteDataSourceService: VoteDataSourceService
  ) { }

  /**
   * Implements the init method. See {@link OnInit}.
   */
  ngOnInit(): void {
    this.setupSubscriptions();
  }

  /**
   * Submits the vote result of the current user.
   */
  public submitResult(): void {
    const user = this.authService.user;

    // if the variable submittedVoteId has a value (i.e. is NOT undefined),
    // this means that the user has already submitted a vote
    if (this.submittedVoteId || !user || !this.currentRoom || !this.currentIssue) {
      return;
    }

    this.submittingVote = true;

    const vote: Vote = {
      createdAt: Timestamp.now(),
      user: user.uid,
      socialValue: this.hideSocialSlider ? null : this.socialValue,
      individualValue: this.hideIndividualSlider ? null : this.individualValue,
      environmentalValue: this.hideEnvironmentalSlider ? null : this.environmentalValue,
      economicalValue: this.hideEconomicalSlider ? null : this.economicalValue,
      technicalValue: this.hideTechnicalSlider ? null : this.technicalValue
    };

    this.voteDataSourceService.addVote(vote, this.currentRoom.id ?? '', this.currentIssue.id ?? '')
      .then((newVote: DocumentReference<DocumentData>) => {
        this.submittedVoteId = newVote.id;
        this.submittingVote = false;
      })
      .catch((error) => {
        this.submittingVote = false;
        this.snackbarService.openSnackBar('Your voting could not be saved. Please try again.', false);
        console.error('ERROR in VotingBoardComponent - submitResult', error);
      });
  }

  /**
   * Finishes the voting for the current issue.
   */
  public finishVoting(): void {
    if (!this.currentRoom || !this.currentIssue) {
      return;
    }

    this.finishingVoting = true;

    // the voting is ended by the host, this means that the current issue moves from the 'open' issues to the 'finished' issues
    // to avoid that the host immediately clicks on the voting button for the next open issue, when the move is still
    // processed --> set the isLoadingIssues to true when the host clicks on the finish voting button
    this.issueService.isLoadingIssues = true;

    const currentRoomId = this.currentRoom.id ?? '';
    const currentIssueId = this.currentIssue.id ?? '';

    this.roomDataSourceService.setStateForRoom(currentRoomId, RoomState.Results, currentIssueId)
      .then(() => {
        this.finishingVoting = false;

        // Normally, isLoadingIssues is set to false when the issues have been loaded in the issue service.
        // However, for the default issue, the issues are not loaded.
        // Therefore, set isLoadingIssues to false here.
        if (currentIssueId === DEFAULT_ISSUE_ID) {
          this.issueService.isLoadingIssues = false;
        }
      })
      .catch((error) => {
        this.finishingVoting = false;
        this.issueService.isLoadingIssues = false;
        this.snackbarService.openSnackBar('Voting could not be finished. Please try again.', false);
        console.error('ERROR in VotingBoardComponent - finishVoting', error);
      });

    // set the status of the issue to 'finished'
    this.issueDataSourceService.setIssueStatus(currentRoomId, currentIssueId, true);
  }

  /**
   * Setup the subscriptions for the component.
   */
  private setupSubscriptions(): void {
    this.loadingVoteOfCurrentUser = true;

    // load current room and current issue to vote for
    this.roomService.currentRoom$.subscribe(room => {
      if (room) {
        this.currentRoom = room;

        if (room.currentIssue) {
          this.issueDataSourceService.getIssue(room.id ?? '', room.currentIssue)
            .then((issue: Issue | null) => {
              if (issue) {
                this.currentIssue = issue;

                if (room.currentState === RoomState.Voting && this.loadingVoteOfCurrentUser) {
                  // the vote of the user only needs to be loaded from the database when the page has been reloaded
                  // in all other cases, we know if the user has submitted a vote if an id is stored in the 'submittedVoteId' variable
                  // therefore, only call the loadVoteOfUser method when the room is in the voting state (i.e. when the user can submit a vote)
                  // and the page has just been reloaded [loadingVoteOfCurrentUser = true] (i.e. loadingVoteOfCurrentUser is only set to true once
                  // in the setup of the subscriptions and then set to false, when the loading of the vote has been performed, or the room is
                  // currently not in the voting state)
                  this.loadVoteIdOfUser();
                } else {
                  this.loadingVoteOfCurrentUser = false;
                }
              } else {
                this.currentIssue = undefined;
                this.loadingVoteOfCurrentUser = false;
              }
            })
            .catch((error) => {
              console.error('ERROR in VotingBoardComponent - setupSubscriptions', error);
            });
        } else {
          this.currentIssue = undefined;
          this.loadingVoteOfCurrentUser = false;
        }

        if (room.currentState === RoomState.Results) {
          // when the room state is set to 'results' (i.e. the results of the voting are shown)
          // reset the values of the sliders, so that for the next voting, the
          // user gets again the default values for the sliders
          this.socialValue = 0;
          this.individualValue = 0;
          this.environmentalValue = 0;
          this.economicalValue = 0;
          this.technicalValue = 0;

          this.hideSocialSlider = false;
          this.hideIndividualSlider = false;
          this.hideEnvironmentalSlider = false;
          this.hideEconomicalSlider = false;
          this.hideTechnicalSlider = false;

          this.submittedVoteId = undefined;

          this.setOptionsAndValueForResult();
        }
      }
    });

    this.voteService.votes$.subscribe(votes => {
      this.votes = votes;

      if (this.currentRoom && this.currentRoom.currentState === RoomState.Results) {
        // The following method is called here (when votes change) and when the room changes.
        // The reason for this is that when the page is reloaded, the room loads before
        // the votes load. Therefore, the method called when changing rooms does not yet have
        // any vote values. Therefore, no results are displayed below the slider.
        // Therefore, we also call this method when the poll has changed and the room status is
        // 'Results' (i.e. the method is called a second time when the page is reloaded and the room status is 'Results').
        this.setOptionsAndValueForResult();
      }
    });
  }

  /**
   * Prepare sliders (i.e. slider options, median, steps to display, etc.) for the result view.
   */
  private setOptionsAndValueForResult(): void {
    // --- Social deminsion ---
    const socialValues: number[] = this.valueService.getNonNullValuesForVoteProperty(this.votes, 'socialValue');
    this.socialMedian = this.valueService.calcMedian(socialValues);
    this.socialResultOptions = this.generateResultOptionsForDimension(Dimension.Social, this.socialResultOptions, this.socialMedian);

    // --- Individual deminsion ---
    const individualValues: number[] = this.valueService.getNonNullValuesForVoteProperty(this.votes, 'individualValue');
    this.individualMedian = this.valueService.calcMedian(individualValues);
    this.individualResultOptions = this.generateResultOptionsForDimension(Dimension.Individual, this.individualResultOptions, this.individualMedian);

    // --- Environmental deminsion ---
    const environmentalValues: number[] = this.valueService.getNonNullValuesForVoteProperty(this.votes, 'environmentalValue');
    this.environmentalMedian = this.valueService.calcMedian(environmentalValues);
    this.environmentalResultOptions = this.generateResultOptionsForDimension(Dimension.Environmental, this.environmentalResultOptions, this.environmentalMedian);

    // --- Economical deminsion ---
    const economicalValues: number[] = this.valueService.getNonNullValuesForVoteProperty(this.votes, 'economicalValue');
    this.economicalMedian = this.valueService.calcMedian(economicalValues);
    this.economicalResultOptions = this.generateResultOptionsForDimension(Dimension.Economical, this.economicalResultOptions, this.economicalMedian);

    // --- Technical deminsion ---
    const technicalValues: number[] = this.valueService.getNonNullValuesForVoteProperty(this.votes, 'technicalValue');
    this.technicalMedian = this.valueService.calcMedian(technicalValues);
    this.technicalResultOptions = this.generateResultOptionsForDimension(Dimension.Technical, this.technicalResultOptions, this.technicalMedian);
  }

  /**
   * Generates result options for a specific dimension.
   * @param dimension the dimension for which to generate result options
   * @param resultOptions the base result options to merge with
   * @param median the median value to use in the translate function
   * @returns The generated result options for the specified dimension
   */
  private generateResultOptionsForDimension(dimension: Dimension, resultOptions: Options, median: number | undefined): Options {
    return Object.assign({}, resultOptions, {
      stepsArray: this.getNrOfVotesForSliderSteps(dimension),
      translate: (value: number, label: LabelType): string => this.getSliderValueForStep(value, label, median)
    });
  }

  /**
   * Get the content to display below/above the slider for the given value.
   * @param value the value of the slider
   * @param label the label type of the value
   * @param median the median of the slider as number or undefined if no median is available
   * @returns the string (or HTML component) to be displayed below/above the slider
   */
  private getSliderValueForStep(value: number, label: LabelType, median: number | undefined): string {
    if (label === LabelType.Low && median !== undefined) {
      // class 'tooltip' and class 'tooltiptext' are defined in styles.scss
      return `
      <div class="tooltip">
        <span><b>&#x0078;&#x0303;</b> ${value}</span>
        <span class="tooltiptext">Median = ${value}</span>
      </div>
      `;
    } else if (label !== LabelType.Low) {
      return '' + value;
    } else {
      return '';
    }
  }

  /**
   * Loads the voteId of the current user and the current issue.
   */
  private loadVoteIdOfUser(): void {
    const currentUser = getAuth().currentUser;
    if (currentUser && this.currentRoom && this.currentIssue) {
      this.voteDataSourceService.getVoteIdForIssueAndUser(this.currentRoom.id ?? '', this.currentIssue.id ?? '', currentUser.uid)
        .then((voteId: string | null) => {
          this.submittedVoteId = voteId ? voteId : undefined;
          this.loadingVoteOfCurrentUser = false;
        })
        .catch((error) => {
          console.error('ERROR in VotingBoardComponent - loadVoteOfUser', error);
        });
    }
  }

  /**
   * Get the number of votes for each step of the provided dimension.
   * @param dimension the dimension for which to get the number of votes for each step
   * @returns the number of votes for each step of the provided dimension as an array of {@link CustomStepDefinition}
   */
  private getNrOfVotesForSliderSteps(dimension: Dimension): CustomStepDefinition[] {
    // Create a new map to store the vote count for each step
    const resultMap = new Map<(number | string), number>();

    this.votes.forEach(vote => {
      let value: number | null = null;

      // Determine the value based on the provided dimension
      switch (dimension) {
        case Dimension.Social: value = vote.socialValue; break;
        case Dimension.Individual: value = vote.individualValue; break;
        case Dimension.Environmental: value = vote.environmentalValue; break;
        case Dimension.Economical: value = vote.economicalValue; break;
        case Dimension.Technical: value = vote.technicalValue; break;
      }


      if (value !== null) {
        // The value is not null

        if (resultMap.has(value)) {
          // The value already exists in the map, increment its counter
          let counter: number = resultMap.get(value) ?? 0;
          resultMap.set(value, ++counter);
        } else {
          // The value doesn't exist in the map, initialize its counter to 1
          resultMap.set(value, 1);
        }
      } else {
        // The value is null, increment the counter for 'noValue'

        if (resultMap.has('noValue')) {
          // 'noValue' already exists in the map, increment its counter
          let counter: number = resultMap.get('noValue') ?? 0;
          resultMap.set('noValue', ++counter);
        } else {
          // 'noValue' doesn't exist in the map, initialize its counter to 1
          resultMap.set('noValue', 1);
        }
      }
    });

    // Update the respective 'NotSure' counters based on the dimension
    switch (dimension) {
      case Dimension.Social: this.socialNotSureCounter = resultMap.get('noValue') ?? 0; break;
      case Dimension.Individual: this.individualNotSureCounter = resultMap.get('noValue') ?? 0; break;
      case Dimension.Environmental: this.environmentalNotSureCounter = resultMap.get('noValue') ?? 0; break;
      case Dimension.Economical: this.economicalNotSureCounter = resultMap.get('noValue') ?? 0; break;
      case Dimension.Technical: this.technicalNotSureCounter = resultMap.get('noValue') ?? 0; break;
    }

    return this.generateStepsAsHtml(resultMap);
  }

  /**
   * Generates the custom HTML steps for the slider as an array of CustomStepDefinition objects.
   * @param resultMap the map with the values and the number of votes for each value
   * @returns an array of CustomStepDefinition objects, which contains the number of votes for the steps and which are used to display the slider steps in the slider
   */
  private generateStepsAsHtml(resultMap: Map<number | string, number>): CustomStepDefinition[] {
    const steps: CustomStepDefinition[] = [];

    // Loop over every possible value of the slider (from min value to max value)
    for (let value = SLIDER_FLOOR; value <= SLIDER_CEIL; value += 1) {
      // Check if the resultMap contains a count for the current value.
      // If a count exists, create a legend with the count enclosed in a span element. Otherwise, the legend is empty.
      // (the class 'slider-result-counter' is defined in styles.scss)
      const legend = resultMap.get(value) ? `<span class="slider-result-counter">${resultMap.get(value)}</span>` : '';
      steps.push({ value, legend });

      const decimalValue = value + 0.5;
      if (decimalValue < SLIDER_CEIL) {
        // users can only vote whole numbers, so there is no legend for half steps
        // the half steps are only used to display possible decimal (.5) median numbers
        steps.push({ value: decimalValue, legend: '' });
      }
    }

    return steps;
  }

}
