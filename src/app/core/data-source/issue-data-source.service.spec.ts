import { TestBed } from '@angular/core/testing';
import { TestingModule } from 'src/app/testing/testing.module';
import { IssueDataSourceService } from './issue-data-source.service';

describe('IssueDataSourceService', () => {
  let service: IssueDataSourceService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestingModule]
    });
    service = TestBed.inject(IssueDataSourceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
