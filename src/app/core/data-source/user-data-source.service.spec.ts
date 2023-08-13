import { TestBed } from '@angular/core/testing';
import { TestingModule } from 'src/app/testing/testing.module';
import { UserDataSourceService } from './user-data-source.service';

describe('UserDataSourceService', () => {
  let service: UserDataSourceService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestingModule]
    });
    service = TestBed.inject(UserDataSourceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
