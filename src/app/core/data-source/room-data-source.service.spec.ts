import { TestBed } from '@angular/core/testing';
import { TestingModule } from 'src/app/testing/testing.module';
import { RoomDataSourceService } from './room-data-source.service';

describe('RoomDataSourceService', () => {
  let service: RoomDataSourceService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestingModule]
    });
    service = TestBed.inject(RoomDataSourceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
