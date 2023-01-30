import type React from 'react';
import type {
  SkFont,
  SkiaMutableValue,
  SkiaValue,
} from '@shopify/react-native-skia';

export interface ChartPoint {
  value: number;
  date: Date;
}

export interface BarChartProps {
  chartColor?: string;
  fontFile: SkFont;
  fontSize?: number;
  labelsColor?: string;
  tooltip?: TooltipProps;
  data: ChartPoint[];
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
  fontFile: SkFont;
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
