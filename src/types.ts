import type React from 'react';
import type {
  SkFont,
  DataSourceParam,
  SkiaMutableValue,
  SkiaValue,
} from '@shopify/react-native-skia';

export interface ChartPoint {
  value: number;
  date: Date;
}

export interface Dataset {
  // label is required as we use it as an object key in *getDataToStack*
  label: string;
  color?: string;
  data: ChartPoint[];
}

export interface BarChartProps {
  // todo: should be removed
  chartColor?: string;
  fontFile: DataSourceParam;
  fontSize?: number;
  labelsColor?: string;
  tooltip?: TooltipProps;
  // todo: should be removed
  data: ChartPoint[];
  datasets?: Dataset[];
  barWidth?: number;
  startDate?: Date;
  endDate?: Date;
  isLoading?: boolean;
  paddingHorizontal?: number;
  paddingVertical?: number;
}

export interface LineChartProps {
  yAxisMax?: number;
  chartColor?: string;
  startDate?: Date;
  endDate?: Date;
  isLoading?: boolean;
  labelsColor?: string;
  fontFile: DataSourceParam;
  fontSize?: number;
  paddingHorizontal?: number;
  paddingVertical?: number;
  tension?: number;
  onTouchStart?: (arg: boolean) => void;
  onTouchEnd?: (arg: boolean) => void;
  withTooltip?: boolean;
  tooltip?: TooltipProps;
  data: ChartPoint[];
}

export interface TooltipProps {
  transform?: SkiaValue<{ translateX: number }[]>; // todo remove optional
  backgroundColor?: string;
  dateFormat?: string;
  setContent?: (content: string) => void;
  width?: number;
  height?: number;
  children: React.ReactNode;
}

export interface LineChartTooltipProps extends Omit<TooltipProps, 'children'> {
  x: SkiaMutableValue<number>;
  xScaleBounds: readonly [number, number];
  chartHeight: number;
  font: SkFont | null;
  data: ChartPoint[];
  startDate: Date;
  endDate: Date;
}

export type FlattenDataType = {
  date: Date;
  [key: string]: number | Date;
};
// {
//   "date": "2020-01-01T00:00:00.000Z",
//   "First item label": 10
// }

export type GroupedDataType = [Date, FlattenDataType[]];
// const GroupedDataType = [
//   [
//     '2020-01-01T00:00:00.000Z',
//     [
//       {
//         'date': '2020-01-01T00:00:00.000Z',
//         'First line': 10,
//       },
//       {
//         'date': '2020-01-01T00:00:00.000Z',
//         'Third line': 10,
//       },
//     ],
//   ],
//   [
//     '2020-01-02T00:00:00.000Z',
//     [
//       {
//         'date': '2020-01-02T00:00:00.000Z',
//         'Second line': 20,
//       },
//       {
//         'date': '2020-01-02T00:00:00.000Z',
//         'Third line': 30,
//       },
//     ],
//   ],
// ];
export type CombinedDataType = FlattenDataType;
// const CombinedDataType = [
//   {
//     'date': '2020-01-01T00:00:00.000Z',
//     'First line': 10,
//     'Third line': 10,
//   },
// ]
