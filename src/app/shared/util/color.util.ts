/**
 * Returns a color hex for the given value.
 * @param value the value of a voting dimension
 * @returns the color hex string
 */
export function getColorForVotingValue(value: number | undefined): string {
  const neutralValue = '#d8e0f3'; // color for neutral value

  if (value === undefined) {
    return neutralValue;
  }

  // colors for positive values
  if (value > 0 && value <= 2) {
    return '#b3f52b';
  }
  if (value >= 2.5 && value <= 4) {
    return '#8ed203';
  }
  if (value >= 4.5) {
    return '#1bc002';
  }

  // colors for negative values
  if (value < 0 && value >= -2) {
    return '#fece00';
  }
  if (value <= -2.5 && value >= -4) {
    return '#fe9903';
  }
  if (value <= -4.5) {
    return '#e23004';
  }

  return neutralValue;
}
