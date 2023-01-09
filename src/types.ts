export interface ChartPoint {
  value: number;
  date: Date;
}

export interface TooltipProps {
  backgroundColor?: string;
  tooltipDateFormat?: string;
  setContent?: (content: string) => void;
  width?: number;
  height?: number;
  dateFormat?: string;
}
