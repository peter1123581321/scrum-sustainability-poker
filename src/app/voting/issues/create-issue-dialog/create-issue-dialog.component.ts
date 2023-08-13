import { Component, Inject, OnInit } from '@angular/core';
import { Timestamp } from '@angular/fire/firestore';
import { FormControl, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { IssueDataSourceService } from 'src/app/core/data-source/issue-data-source.service';
import { IssueDialogData } from 'src/app/shared/models/issue-dialog-data.model';
import { Issue } from 'src/app/shared/models/issue.model';
import { SnackbarService } from 'src/app/shared/snackbar.service';

@Component({
  selector: 'app-create-issue-dialog',
  templateUrl: './create-issue-dialog.component.html',
  styleUrls: ['./create-issue-dialog.component.scss']
})
export class CreateIssueDialogComponent implements OnInit {

  public loading = false;
  public issueKeyCtrl = new FormControl('', [Validators.required]);
  public issueTitleCtrl = new FormControl('', [Validators.required]);

  /**
   * Initializes a new instance of the {@link CreateIssueDialogComponent} class.
   * @param snackbarService the injected snackbar service
   * @param issueDataSourceService the injected issue dataSource service
   * @param dialogRef the reference to the dialog opened via the MatDialog service
   * @param issueDialogData the data being injected from the dialog into this component.
   */
  constructor(
    private readonly snackbarService: SnackbarService,
    private readonly issueDataSourceService: IssueDataSourceService,
    private readonly dialogRef: MatDialogRef<CreateIssueDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public readonly issueDialogData: IssueDialogData
  ) { }

  /**
   * Implements the init method. See {@link OnInit}.
   */
  ngOnInit(): void {
    if (!this.issueDialogData.isNewIssue && this.issueDialogData.issue) {
      // set the form values if an issue is provided and the dialog is not a new issue dialog
      this.issueKeyCtrl.setValue(this.issueDialogData.issue.key);
      this.issueTitleCtrl.setValue(this.issueDialogData.issue.title);
    }
  }

  /**
   * Create a new issue.
   */
  public createNewIssue(): void {
    this.issueKeyCtrl.markAsTouched();
    this.issueTitleCtrl.markAsTouched();

    if (this.issueKeyCtrl.invalid || this.issueTitleCtrl.invalid || // invalid value
      !this.issueKeyCtrl.value || !this.issueTitleCtrl.value // no value
    ) {
      return;
    }

    this.disableForm();

    const issue: Issue = {
      key: this.issueKeyCtrl.value,
      title: this.issueTitleCtrl.value,
      createdAt: Timestamp.now(),
      finishedVoting: false,
      isDefaultIssue: false
    };

    this.issueDataSourceService.addIssue(issue, this.issueDialogData.roomId)
      .then(() => {
        this.dialogRef.close(true);
      })
      .catch((error) => {
        this.enableForm();
        this.snackbarService.openSnackBar('Issue could not be created. Please try again.', false);
        console.error('ERROR in CreateIssueDialogComponent - createNewIssue', error);
      });
  }

  /**
   * Update the existing issue, provided via the dialog data.
   */
  public updateIssue(): void {
    this.issueKeyCtrl.markAsTouched();
    this.issueTitleCtrl.markAsTouched();

    if (this.issueKeyCtrl.invalid || this.issueTitleCtrl.invalid || // invalid value OR
      !this.issueKeyCtrl.value || !this.issueTitleCtrl.value || // no value OR
      !this.issueDialogData.issue // no issue provided as dialog data
    ) {
      return;
    }

    this.disableForm();

    const issue: Issue = {
      id: this.issueDialogData.issue.id,
      key: this.issueKeyCtrl.value,
      title: this.issueTitleCtrl.value,
      createdAt: this.issueDialogData.issue.createdAt,
      finishedVoting: this.issueDialogData.issue.finishedVoting,
      isDefaultIssue: this.issueDialogData.issue.isDefaultIssue
    };

    this.issueDataSourceService.updateIssue(issue, this.issueDialogData.roomId)
      .then(() => {
        this.dialogRef.close(true);
      })
      .catch((error) => {
        this.enableForm();
        this.snackbarService.openSnackBar('Issue could not be updated. Please try again.', false);
        console.error('ERROR in CreateIssueDialogComponent - updateIssue', error);
      });
  }

  /**
   * Close the currently opened issue dialog.
   */
  public closeIssueDialog(): void {
    this.dialogRef.close(false);
  }

  /**
   * Disable all input fields and buttons.
   */
  private disableForm(): void {
    this.loading = true;
    this.issueKeyCtrl.disable();
    this.issueTitleCtrl.disable();
  }

  /**
   * Enable all input fields and buttons.
   */
  private enableForm(): void {
    this.loading = false;
    this.issueKeyCtrl.enable();
    this.issueTitleCtrl.enable();
  }

}
