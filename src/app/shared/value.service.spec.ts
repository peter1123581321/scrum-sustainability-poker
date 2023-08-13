import { TestBed } from '@angular/core/testing';
import { TestingModule } from 'src/app/testing/testing.module';
import { ValueService } from './value.service';
import { Vote } from './models/vote.model';
import { Timestamp } from '@angular/fire/firestore';

describe('ValueService', () => {
  let service: ValueService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestingModule]
    });
    service = TestBed.inject(ValueService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Calculation of median', () => {
    it('should return undefined when no values are provided', () => {
      const result = service.calcMedian([]);
      expect(result).toBeUndefined();
    });

    it('should calculate the median for odd number of elements', () => {
      const values = [5, 2, 3, 1, 4];
      const result = service.calcMedian(values);
      expect(result).toBe(3); // Median of [1, 2, 3, 4, 5] is 3
    });

    it('should calculate the median for even number of elements', () => {
      const values = [4, 2, 1, 3];
      const result = service.calcMedian(values);
      expect(result).toBe(2.5); // Median of [1, 2, 3, 4] is (2 + 3) / 2 = 2.5
    });

    it('should not modify the original array', () => {
      const values = [3, 2, 1];
      service.calcMedian(values);
      expect(values).toEqual([3, 2, 1]); // Original array should remain unchanged
    });
  });

  describe('Return of non-null values', () => {
    it('should retrieve non-null values for a given property', () => {
      const votes: Vote[] = [
        { id: '1', createdAt: Timestamp.now(), user: 'Alice', socialValue: 5, individualValue: null, environmentalValue: 3, economicalValue: 3, technicalValue: null },
        { id: '2', createdAt: Timestamp.now(), user: 'Bob', socialValue: null, individualValue: 2, environmentalValue: null, economicalValue: 4, technicalValue: 4 },
        { id: '3', createdAt: Timestamp.now(), user: 'Charlie', socialValue: 0, individualValue: 1, environmentalValue: 0, economicalValue: 2, technicalValue: 5 }
      ];
      const propertyName = 'economicalValue';
      const result = service.getNonNullValuesForVoteProperty(votes, propertyName);
      expect(result).toEqual([3, 4, 2]); // non-null values for the 'economicalValue' property: 3, 4, 2
    });

    it('should handle empty votes array', () => {
      const votes: Vote[] = [];
      const propertyName = 'socialValue';
      const result = service.getNonNullValuesForVoteProperty(votes, propertyName);
      expect(result).toEqual([]);
    });

    it('should handle votes array with null values for the property', () => {
      const votes: Vote[] = [
        { id: '1', createdAt: Timestamp.now(), user: 'Alice', socialValue: 1, individualValue: null, environmentalValue: 1, economicalValue: 5, technicalValue: 5 },
        { id: '2', createdAt: Timestamp.now(), user: 'Bob', socialValue: 3, individualValue: null, environmentalValue: 5, economicalValue: null, technicalValue: 4 }
      ];
      const propertyName = 'individualValue';
      const result = service.getNonNullValuesForVoteProperty(votes, propertyName);
      expect(result).toEqual([]); // all values for the 'individualValue' property are null
    });

    it('should handle votes array with non-null values and null values for the property', () => {
      const votes: Vote[] = [
        { id: '1', createdAt: Timestamp.now(), user: 'Alice', socialValue: 1, individualValue: 2, environmentalValue: 5, economicalValue: 5, technicalValue: 4 },
        { id: '2', createdAt: Timestamp.now(), user: 'Bob', socialValue: 3, individualValue: 5, environmentalValue: 5, economicalValue: 0, technicalValue: null },
        { id: '2', createdAt: Timestamp.now(), user: 'Bob', socialValue: 3, individualValue: 5, environmentalValue: 5, economicalValue: 0, technicalValue: 0 }
      ];
      const propertyName = 'technicalValue';
      const result = service.getNonNullValuesForVoteProperty(votes, propertyName);
      expect(result).toEqual([4, 0]); // non-null values for the 'technicalValue' property: 4, 0 --> one of the votes has a null value
    });
  });

});
