import { TestBed } from '@angular/core/testing';
import { TestingModule } from 'src/app/testing/testing.module';
import { VoteDataSourceService } from './vote-data-source.service';

describe('VoteDataSourceService', () => {
  let service: VoteDataSourceService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestingModule]
    });
    service = TestBed.inject(VoteDataSourceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
