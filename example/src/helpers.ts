import type { ChartPoint } from '../../src/types';

function addDays(daysToAdd: number): Date {
  const result = new Date();
  result.setDate(result.getDate() + daysToAdd);
  return result;
}

export function generateRandomChartData(length: number): ChartPoint[] {
  return Array<number>(length)
    .fill(0)
    .map((_, index) => ({
      date: addDays(index),
      // | bitwise-OR operator
      // eslint-disable-next-line no-bitwise
      value: (Math.random() * index) | 0,
    }));
}
