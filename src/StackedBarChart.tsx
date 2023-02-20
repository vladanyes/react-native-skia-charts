import React, { memo, useCallback, useEffect, useState } from 'react';
import { LayoutChangeEvent, View } from 'react-native';
import {
  Canvas,
  useFont,
  Path,
  runTiming,
  Skia,
  Text,
  Selector,
  useComputedValue,
  useValue,
  Group,
} from '@shopify/react-native-skia';
import { Easing } from 'react-native-reanimated';
import { scaleBand, scaleLinear, scaleOrdinal } from 'd3-scale';
import { max } from 'd3-array';
import type { BarChartProps, ChartPoint } from './types';
import d3Max, {
  getDataToStack,
  getMinMaxDate,
  getXLabel,
  getXLabelsInterval,
  getYLabels,
} from './helpers';
import {
  CHART_BAR_COLOR,
  CHART_BAR_WIDTH,
  CHART_FONT_SIZE,
  CHART_HEIGHT,
  CHART_HORIZONTAL_MARGIN,
  CHART_VERTICAL_MARGIN,
  CHART_WIDTH,
} from './constants';
import { stack } from 'd3-shape';

export const StackedBarChart = memo(
  ({
    isLoading,
    chartColor = CHART_BAR_COLOR,
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
    console.log('datasets', datasets);
    const [canvasWidth, setCanvasWidth] = useState(CHART_WIDTH);
    const [canvasHeight, setCanvasHeight] = useState(CHART_HEIGHT);
    const barsAnimationState = useValue<number>(0);
    const font = useFont(fontFile, fontSize);

    const stackKeys = datasets.map((dataset) => dataset.label);
    const stackColors = datasets.map((dataset) => dataset.color);
    const dataToStack = getDataToStack(datasets);
    const stackGenerator = stack().keys(stackKeys);

    const stackedData = stackGenerator(dataToStack);
    // stackedData --> [[[0, 10], [0, 10]], [[10, 30], [10, 30]]]

    const colorScale = scaleOrdinal().domain(stackKeys).range(stackColors);

    // const totalCount = datasets.length;
    // const xLabelsInterval = getXLabelsInterval(totalCount);

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

    // This is our min/max values for Y axis
    const yDomain = [
      0,
      max(stackedData, (layer) => max(layer, (sequence) => sequence[1] + 0.05)),
    ];

    const xDomain = dataToStack.map((data) => data.date);
    const xScale = scaleBand()
      .domain(xDomain)
      .range(xScaleBounds)
      .paddingInner(0.5)
      .align(0);

    const yScale = scaleLinear().domain(yDomain).range(yScaleBounds);

    const [_, yAxisMax] = yDomain;
    // const yLabels = getYLabels(yAxisMax);


    // stacked bars path
    const pathsArr = useComputedValue(() => {
      return stackedData
        .map((layer: number[][]) => {
          // layer => [[0, 150], [0, 100]]
          const path = Skia.Path.Make();
          let color = 'black';
          layer.forEach((subLayer: number[], subIdx: number) => {
            // subLayer => [0, 150]
            const currentData = dataToStack[subIdx];
            color = colorScale(layer.key) as string;

            const rect = Skia.XYWHRect(
              xScale(currentData.date),
              chartHeight,
              xScale.bandwidth(),
              yScale(subLayer[1] * barsAnimationState.current) * -1
            );

            const rrect = Skia.RRectXY(rect, 8, 8);
            path.addRRect(rrect);
          });

          return { path, color };
        })
        .reverse(); // reverse final array in order to prevent overlapping while rendering
    }, [stackedData, barsAnimationState]);

    const animateBars = (from: number = 0, to: number = 1) => {
      barsAnimationState.current = from;
      runTiming(barsAnimationState, to, {
        duration: 600,
        easing: Easing.inOut(Easing.exp),
      });
    };

    useEffect(() => {
      animateBars(0, 1);
    }, [datasets]);

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
          <Group>
            {stackedData.map((_, i) => (
              <Path
                key={i}
                path={Selector(pathsArr, (v) => v[i]?.path)}
                style="fill"
                strokeWidth={3}
                color={Selector(pathsArr, (v) => v[i]?.color)}
              />
            ))}
          </Group>
        </Canvas>
      </View>
    );
  }
);
