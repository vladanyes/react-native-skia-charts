import React, { memo, useCallback, useEffect, useState } from 'react';
import { LayoutChangeEvent, View } from 'react-native';
import {
  Canvas,
  useFont,
  Path,
  runTiming,
  Skia,
  Text,
  useComputedValue,
  useValue,
  Group,
} from '@shopify/react-native-skia';
import { Easing } from 'react-native-reanimated';
import { scaleLinear, scalePoint } from 'd3-scale';
import { max } from 'd3-array';
import type { BarChartProps, ChartPoint } from './types';
import { getMinMaxDate, getXLabel, getXLabelsInterval } from './helpers';
import {
  CHART_BAR_COLOR,
  CHART_BAR_WIDTH,
  CHART_FONT_SIZE,
  CHART_HEIGHT,
  CHART_HORIZONTAL_MARGIN,
  CHART_VERTICAL_MARGIN,
  CHART_WIDTH,
} from './constants';

export const BarChart = memo(
  ({
    isLoading,
    fontFile,
    fontSize = CHART_FONT_SIZE,
    labelsColor = 'black',
    startDate: startDateProp,
    // endDate: endDateProp,
    paddingHorizontal = CHART_HORIZONTAL_MARGIN,
    paddingVertical = CHART_VERTICAL_MARGIN,
    barWidth = CHART_BAR_WIDTH,
    datasets = [],
  }: BarChartProps) => {
    // only the first item of datasets prop will be used, other items will be ignored.
    const [{ data = [], color: chartColor = CHART_BAR_COLOR } = {}] = datasets;
    const [canvasWidth, setCanvasWidth] = useState(CHART_WIDTH);
    const [canvasHeight, setCanvasHeight] = useState(CHART_HEIGHT);
    const animationState = useValue<number>(0);
    const font = useFont(fontFile, fontSize);

    // define chart boundaries
    const startDate = startDateProp || getMinMaxDate(data, 'min');
    // const endDate = endDateProp || getMinMaxDate(data, 'max');
    const totalCount = data.length;
    const xLabelsInterval = getXLabelsInterval(totalCount);

    const chartHeight = canvasHeight - paddingVertical;
    const yScaleBounds = [paddingVertical, chartHeight] as const;
    const xScaleBounds = [
      paddingHorizontal,
      canvasWidth - paddingHorizontal,
    ] as const;
    const canvasStyles = {
      width: canvasWidth,
      height: canvasHeight,
    };

    // todo:fix types. remove as unknown
    const xScaleDomain = data.map(
      (dataPoint: ChartPoint) => dataPoint.date as unknown as string
    );
    const xScale = scalePoint()
      .domain(xScaleDomain)
      .range(xScaleBounds)
      .padding(xLabelsInterval === 1 ? -1 : 0.5);

    const yScaleDomain = [
      0,
      max(data, (yDataPoint: ChartPoint) => yDataPoint.value),
    ];
    // @ts-ignore todo: fix types
    const yScale = scaleLinear().domain(yScaleDomain).range(yScaleBounds);

    const animate = () => {
      animationState.current = 0;
      runTiming(animationState, 1, {
        duration: 1000,
        easing: Easing.inOut(Easing.exp),
      });
    };

    useEffect(() => {
      // this useEffect is responsible for toggling chart
      if (!isLoading) {
        animationState.current = 0;
        setTimeout(animate, 0);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [startDate, isLoading]);

    const path = useComputedValue(() => {
      const newPath = Skia.Path.Make();

      data.forEach((dataPoint: ChartPoint) => {
        const rect = Skia.XYWHRect(
          // todo: remove ts-ignore
          // @ts-ignore
          xScale(dataPoint.date) - barWidth / 2,
          chartHeight,
          barWidth,
          yScale(dataPoint.value * animationState.current) * -1
        );

        const rrect = Skia.RRectXY(rect, 8, 8);
        newPath.addRRect(rrect);
      });

      return newPath;
    }, [animationState]);

    const onLayout = useCallback(
      ({ nativeEvent: { layout } }: LayoutChangeEvent) => {
        setCanvasWidth(Math.round(layout.width));
        setCanvasHeight(Math.round(layout.height));
      },
      [setCanvasWidth]
    );

    if (!font) {
      return <View />;
    }

    return (
      <View style={{ flex: 1 }} onLayout={onLayout}>
        <Canvas style={canvasStyles}>
          <Path path={path} color={chartColor} />
          {data.map((dataPoint: ChartPoint, idx: number) => (
            <Group color={labelsColor} key={`${dataPoint.date}-${idx}`}>
              <Text
                font={font}
                // todo: remove ts-ignore
                // @ts-ignore
                x={xScale(dataPoint.date)}
                y={canvasHeight}
                text={getXLabel({
                  idx,
                  date: dataPoint.date,
                  xLabelsInterval,
                  totalCount,
                })}
              />
            </Group>
          ))}
        </Canvas>
      </View>
    );
  }
);
