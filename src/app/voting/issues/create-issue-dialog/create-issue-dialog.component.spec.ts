import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TestingModule } from 'src/app/testing/testing.module';
import { CreateIssueDialogComponent } from './create-issue-dialog.component';

describe('CreateIssueDialogComponent', () => {
  let component: CreateIssueDialogComponent;
  let fixture: ComponentFixture<CreateIssueDialogComponent>;

  const mockMatDialogRef = jasmine.createSpyObj('MatDialogRef', ['close', 'afterClosed']);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CreateIssueDialogComponent],
      imports: [TestingModule],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: {} },
        { provide: MatDialogRef, useValue: mockMatDialogRef },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateIssueDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
