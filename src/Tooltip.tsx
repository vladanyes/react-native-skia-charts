import React, { memo } from 'react';
import { Group, RoundedRect, SkiaValue } from '@shopify/react-native-skia';
import { CHART_TOOLTIP_HEIGHT } from './constants';

interface IProps {
  transform?: SkiaValue<{ translateX: number }[]>; // todo remove optional
  children: React.ReactNode;
  backgroundColor: string;
  tooltipWidth: number | SkiaValue;
  tooltipHeight?: number | SkiaValue;
}

const Tooltip = ({
  transform,
  children,
  backgroundColor,
  tooltipWidth,
  tooltipHeight = CHART_TOOLTIP_HEIGHT,
}: IProps) => {
  return (
    <Group transform={transform}>
      <RoundedRect
        r={10}
        x={0}
        y={0}
        width={tooltipWidth}
        height={tooltipHeight}
        color={backgroundColor}
      />
      {children}
    </Group>
  );
};

export default memo(Tooltip);
