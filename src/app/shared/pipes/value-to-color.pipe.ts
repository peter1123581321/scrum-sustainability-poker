import { Pipe, PipeTransform } from '@angular/core';
import { getColorForVotingValue } from 'src/app/shared/util/color.util';

@Pipe({
  name: 'valueToColor'
})
export class ValueToColorPipe implements PipeTransform {

  /**
   * Transforms a numeric value into a corresponding color string.
   * @param value the numeric value to be transformed
   * @returns the color string determined by the value using the getColorForVotingValue function
   */
  transform(value: number | undefined): string {
    return getColorForVotingValue(value);
  }

}
