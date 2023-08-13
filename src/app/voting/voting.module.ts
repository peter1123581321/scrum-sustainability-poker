import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RoomComponent } from './room/room.component';
import { OverviewComponent } from './overview/overview.component';
import { VotingBoardComponent } from './voting-board/voting-board.component';
import { SharedModule } from '../shared/shared.module';
import { VotingRoutingModule } from './voting-routing.module';
import { IssuesComponent } from './issues/issues.component';
import { CreateIssueDialogComponent } from './issues/create-issue-dialog/create-issue-dialog.component';
import { TimerComponent } from './room/timer/timer.component';

@NgModule({
  declarations: [
    RoomComponent,
    OverviewComponent,
    VotingBoardComponent,
    IssuesComponent,
    CreateIssueDialogComponent,
    TimerComponent
  ],
  imports: [
    CommonModule,
    VotingRoutingModule,
    SharedModule
  ]
})
export class VotingModule { }
