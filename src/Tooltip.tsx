import React, { memo } from 'react';
import { Group, RoundedRect } from '@shopify/react-native-skia';
import { CHART_TOOLTIP_HEIGHT } from './constants';
import type { TooltipProps } from './types';

const Tooltip = ({
  transform,
  children,
  backgroundColor,
  width = 100,
  height = CHART_TOOLTIP_HEIGHT,
}: TooltipProps) => {
  return (
    <Group transform={transform}>
      <RoundedRect
        r={10}
        x={0}
        y={0}
        width={width}
        height={height}
        color={backgroundColor}
      />
      {children}
    </Group>
  );
};

export default memo(Tooltip);
