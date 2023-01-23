import dayjs from 'dayjs';
import type { ChartPoint } from './types';
// import omit from 'lodash/omit';
// import { MIN_PLACEHOLDERS_COUNT } from './constants';

export const getMinMaxDate = (data: ChartPoint[], type = 'min'): Date => {
  const dateType = type === 'min' ? 'isBefore' : 'isAfter';
  const minMaxPoint = data.reduce(
    (a: ChartPoint, b: ChartPoint): ChartPoint =>
      dayjs(a.date)[dateType](dayjs(b.date)) ? a : b
  );
  return minMaxPoint?.date;
};

export const getMaxYValue = (data: ChartPoint[]): number => {
  const maxPoint = data.reduce(
    (acc: ChartPoint, b: ChartPoint): ChartPoint =>
      acc.value > b.value ? acc : b
  );
  return maxPoint?.value;
};

export const getXLabelsInterval = (totalXGraphCount: number): number => {
  let xGraphInterval = 1;
  if (totalXGraphCount > 15) {
    xGraphInterval = 2;
  }
  return xGraphInterval;
};

export const convertDataArrToObj = (
  data: ChartPoint[],
  dateFormat = 'MMM DD'
) => {
  return data.reduce((acc: Object, usage: ChartPoint) => {
    // @ts-ignore
    acc[dayjs(usage.date).format(dateFormat)] = usage.value;
    return acc;
  }, {});
};

export const getYLabels = (maxValue: number): Array<string | number> => {
  const fiveArr = Array.from(Array(5).keys());
  return fiveArr
    .map((item: number) => {
      if (item === 4) {
        return Number(maxValue.toFixed(1));
      }
      if (item === 0) return 0;
      return Math.floor((maxValue / 4) * item);
    })
    .reverse();
};

const getXLabelDate = (date: Date, isDateHidden: boolean) =>
  isDateHidden ? '--' : dayjs(date).format('D');
export const getXLabel = ({
  idx,
  date,
  totalCount,
  xLabelsInterval,
  chartType = 'line',
}: {
  idx: number;
  date: Date;
  totalCount: number;
  xLabelsInterval: number;
  chartType?: 'line' | 'bar';
}) => {
  const isDateHidden = chartType === 'bar' && dayjs(date).isAfter(dayjs());

  if (xLabelsInterval === 1) {
    return getXLabelDate(date, isDateHidden);
  }

  // here we want to keep the first and the last date of the cycle
  //  but exclude the second and the last but one
  if (idx === 0 || idx === totalCount - 1) {
    return getXLabelDate(date, isDateHidden);
  } else if (idx % xLabelsInterval && idx !== 1 && idx !== totalCount - 2) {
    return getXLabelDate(date, isDateHidden);
  } else {
    return '';
  }
};

// // sample of PoolLineDailyUsageFormatted:
// //   {"date": "2022-09-16", "18931943440": 0.08, "3576721372": 0.1}
// export type PoolLineDailyUsageFormatted = {
//   date: Date | string;
//   // mdn: usage of the line
//   // ...
// };
//
// // export const getKeysForBarChart = (poolLineDailyUsage: PoolLineDailyUsageFormatted[]) => {
// //   return Object.keys(omit(poolLineDailyUsage[0], 'date'));
// // };
// //
// // export const getBarChartPlaceholders = (
// //   usageArr: PoolLineDailyUsageFormatted[],
// //   cycleStartDate: Date,
// // ) => {
// //   const totalCount = usageArr.length;
// //   if (totalCount >= MIN_PLACEHOLDERS_COUNT) return usageArr;
// //
// //   if (usageArr.length) {
// //     const lastUsageItem = usageArr[usageArr.length - 1];
// //     let mostRecentDate = dayjs(lastUsageItem.date);
// //     const nextUsagePlaceholders = [...usageArr];
// //
// //     for (let i = totalCount; i < MIN_PLACEHOLDERS_COUNT; i++) {
// //       const nextDate = dayjs(mostRecentDate).add(1, 'day');
// //       nextUsagePlaceholders.push({ date: nextDate });
// //       mostRecentDate = nextDate;
// //     }
// //
// //     return nextUsagePlaceholders;
// //   } else {
// //     // if there is no any usages of any line -> return placeholders array...
// //     //  which is dates array starting from the cycleStartDate
// //     return Array(MIN_PLACEHOLDERS_COUNT)
// //       .fill(0)
// //       .map((_, idx: number) => ({ date: dayjs(cycleStartDate).add(idx, 'day') }));
// //   }
// // };
