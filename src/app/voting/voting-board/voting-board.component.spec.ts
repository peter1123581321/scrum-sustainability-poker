import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TestingModule } from 'src/app/testing/testing.module';
import { VotingBoardComponent } from './voting-board.component';

describe('VotingBoardComponent', () => {
  let component: VotingBoardComponent;
  let fixture: ComponentFixture<VotingBoardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [VotingBoardComponent],
      imports: [TestingModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VotingBoardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
