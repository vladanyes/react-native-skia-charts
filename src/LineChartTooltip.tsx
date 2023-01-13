import React, { memo } from 'react';
import {
  DashPathEffect,
  Group,
  interpolate,
  Line,
  Text,
  useComputedValue,
  useValue,
  useValueEffect,
  vec,
} from '@shopify/react-native-skia';
import dayjs from 'dayjs';
import type { LineChartTooltipProps } from './types';
import { convertDataArrToObj } from './helpers';
import Tooltip from './Tooltip';

const LineChartTooltip = ({
  data,
  x,
  xScaleBounds,
  chartHeight,
  font,
  backgroundColor = 'black',
  width = 100,
  height = 50,
  dateFormat = 'MMM D',
  startDate,
  endDate,
}: // setContent,
LineChartTooltipProps) => {
  const dataMap = convertDataArrToObj(data, dateFormat);
  const tooltipContentDate = useValue<string>('');
  const tooltipContentValue = useValue<string>('');

  const transformTooltip = useComputedValue(() => {
    return [{ translateX: x.current }];
  }, [x]);

  const tooltipInterpolatedXPosition = useComputedValue(() => {
    return interpolate(x.current, xScaleBounds, [
      dayjs(startDate).valueOf(),
      dayjs(endDate).valueOf(),
    ]);
  }, [x, startDate, endDate]);

  // todo find a better way to calc contentDate
  useValueEffect(tooltipInterpolatedXPosition, () => {
    const contentDate = dayjs(tooltipInterpolatedXPosition.current).format(
      dateFormat
    );
    const contentValue = dataMap[contentDate as keyof typeof dataMap];

    if (contentDate) tooltipContentDate.current = contentDate.toString();
    if (contentValue) tooltipContentValue.current = contentValue.toString();
  });

  return (
    <Group>
      <Group transform={transformTooltip}>
        <Line
          p1={vec(0, 0)}
          p2={vec(0, chartHeight)}
          color="lightblue"
          style="stroke"
          strokeWidth={1}
        >
          <DashPathEffect intervals={[4, 4]} />
        </Line>
      </Group>
      <Tooltip backgroundColor={backgroundColor} width={width} height={height}>
        {font ? (
          <Group color="white">
            <Text font={font} x={10} y={20} text={tooltipContentDate} />
            <Text font={font} x={10} y={40} text={tooltipContentValue} />
          </Group>
        ) : null}
      </Tooltip>
    </Group>
  );
};

export default memo(LineChartTooltip);
