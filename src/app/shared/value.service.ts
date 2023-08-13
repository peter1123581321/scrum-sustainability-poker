import { Injectable } from '@angular/core';
import { Vote } from './models/vote.model';

@Injectable({
  providedIn: 'root'
})
export class ValueService {

  /**
   * Calculate the median of the provided values.
   * @param values the values for which to calculate the median
   * @returns the median of the provided values or undefined if no median can be calculated
   */
  public calcMedian(values: number[]): number | undefined {
    if (!values || values.length === 0) {
      // no votes have been given (e.g. everyone selected the question mark ["I'm not sure"]), so no median can be calculated
      return undefined;
    }

    const sortedValues = [...values].sort((a, b) => a - b); // sort the values in ascending order

    if (sortedValues.length % 2 === 0) {
      // number of elements is even
      return (sortedValues[sortedValues.length / 2] + sortedValues[(sortedValues.length / 2) - 1]) / 2;
    } else {
      // number of elements is odd
      return sortedValues[Math.floor(sortedValues.length / 2)];
    }
  }

  /**
   * Retrieves an array of non-null values from the 'votes' array.
   * @param votes the array of 'Vote' objects from which to retrieve the values
   * @param valuePropertyName the property name of the 'Vote' object to be used for filtering and mapping
   * @returns An array of non-null values
   */
  public getNonNullValuesForVoteProperty(votes: Vote[], valuePropertyName: string): number[] {
    return votes
      .filter(vote => vote[valuePropertyName as keyof Vote] !== null)
      .map(vote => vote[valuePropertyName as keyof Vote] as number);
  }
}
