import type { ChartPoint } from 'react-native-skia-charts';

function addDays(daysToAdd: number): Date {
  const result = new Date();
  result.setDate(result.getDate() + daysToAdd);
  return result;
}
const COLORS = ['#FD9843', '#DE5C9D', '#1AA179', '#113994'];

export const generateRandomStackedChartData = (length: number) => {
  return Array<number>(length)
    .fill(0)
    .map((_, index) => ({
      label: `Label ${index}`,
      color: COLORS[index % COLORS.length],
      data: generateRandomChartData(length),
    }));
  // {
  //   label: 'First line',
  //   color: '#DE5C9D',
  //   data: [
  //     {
  //       date: '2020-01-02',
  //       value: 10,
  //     },
  //   ],
  // },
};

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
