import React, { memo } from 'react';
import {
  DashPathEffect,
  Group,
  Line,
  useComputedValue,
  useSharedValueEffect,
  useValue,
  vec,
} from '@shopify/react-native-skia';
import type Reanimated from 'react-native-reanimated';

interface IProps {
  x: Reanimated.SharedValue<number>;
  chartHeight: number;
}

const LineChartTooltip = ({ x, chartHeight }: IProps) => {
  const translateX = useValue(0);

  useSharedValueEffect(() => {
    // todo refactor rightXBound instead of xScaleBounds[1]
    // const xPos = clamp(x.value, xScaleBounds[0], xScaleBounds[1]);
    // const isLeftPos = xPos + tooltipWidth.current >= xScaleRange[1];

    // const translateX = isLeftPos
    //   ? xPos - tooltipWidth.current - CHART_TOOLTIP_MARGIN * 2
    //   : xPos + CHART_TOOLTIP_MARGIN;

    translateX.current = x.value;
  }, x);

  const transformTooltip = useComputedValue(() => {
    return [{ translateX: translateX.current }];
  }, [translateX]);

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
      {/*<Tooltip*/}
      {/*  transform={transformTooltip}*/}
      {/*  backgroundColor={CHART_TOOLTIP_BACKGROUND}*/}
      {/*  tooltipWidth={tooltipWidth}*/}
      {/*  tooltipHeight={tooltipHeight}*/}
      {/*>*/}
      {/*  <Drawing drawing={drawTooltipContentUsage} />*/}
      {/*</Tooltip>*/}
    </Group>
  );
};

export default memo(LineChartTooltip);
