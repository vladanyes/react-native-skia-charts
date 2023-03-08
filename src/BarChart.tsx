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
  DashPathEffect,
} from '@shopify/react-native-skia';
import { Easing } from 'react-native-reanimated';
import { scaleLinear, scalePoint } from 'd3-scale';
import type { BarChartProps, ChartPoint } from './types';
import {
  CHART_BAR_COLOR,
  CHART_BAR_WIDTH,
  CHART_FONT_SIZE,
  CHART_HEIGHT,
  CHART_HORIZONTAL_MARGIN,
  CHART_VERTICAL_MARGIN,
  CHART_WIDTH,
  CHART_BAR_RADIUS,
} from './constants';

export const BarChart = memo(
  ({
    // isLoading,
    fontFile,
    yAxisMax,
    fontSize = CHART_FONT_SIZE,
    labelsColor = 'black',
    // startDate: startDateProp,
    // endDate: endDateProp,
    paddingHorizontal = CHART_HORIZONTAL_MARGIN,
    paddingVertical = CHART_VERTICAL_MARGIN,
    barWidth: barWidthProp = CHART_BAR_WIDTH,
    datasets = [],
    borderRadius = CHART_BAR_RADIUS,
  }: BarChartProps) => {
    // only the first item of datasets prop will be used, other items will be ignored.
    const [{ data = [], color: chartColor = CHART_BAR_COLOR } = {}] = datasets;
    const [canvasWidth, setCanvasWidth] = useState(CHART_WIDTH);
    const [canvasHeight, setCanvasHeight] = useState(CHART_HEIGHT);
    const animationState = useValue<number>(0);
    const font = useFont(fontFile, fontSize);

    // define chart boundaries
    // const startDate = startDateProp || getMinMaxDate(data, 'min');
    // const endDate = endDateProp || getMinMaxDate(data, 'max');
    // const totalCount = data.length;
    // const xLabelsInterval = getXLabelsInterval(totalCount);

    const xScaleBounds = [
      paddingHorizontal,
      canvasWidth - paddingHorizontal,
    ] as const;
    const chartHeight = canvasHeight - paddingVertical;
    const yScaleBounds = [paddingVertical, chartHeight] as const;
    const canvasStyles = {
      width: canvasWidth,
      height: canvasHeight,
    };

    const xScale = scalePoint()
      .domain(data.map((d) => d.x.toString()))
      .range(xScaleBounds)
      .align(0);
    const barWidth = Math.min(barWidthProp, xScale.step());

    const yScaleDomain = [0, yAxisMax || Math.max(...data.map((d) => d.y))];
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
      animationState.current = 0;
      setTimeout(animate, 0);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data]);

    const path = useComputedValue(() => {
      const newPath = Skia.Path.Make();
      data.forEach((dataPoint: ChartPoint) => {
        const rect = Skia.XYWHRect(
          xScale(dataPoint.x)! - barWidthProp / 2,
          chartHeight,
          barWidth,
          yScale(dataPoint.y * animationState.current) * -1
        );

        const rrect = Skia.RRectXY(rect, borderRadius, borderRadius);
        newPath.addRRect(rrect);
      });

      return newPath;
    }, [animationState, data]);

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
          {font ? (
            <Group>
              {yScale.ticks(6).map((label: number, idx: number) => {
                const yPoint = chartHeight - yScale(label);
                // https://stackoverflow.com/questions/51497534/how-to-force-a-specific-amount-of-y-axis-ticks-in-d3-charts
                return (
                  <Group key={label + idx.toString()}>
                    <Text
                      color={labelsColor}
                      font={font}
                      x={0}
                      y={yPoint}
                      text={label.toString()}
                    />
                    <Path
                      color="lightgrey"
                      style="stroke"
                      strokeWidth={1}
                      path={`M${xScaleBounds[0]},${yPoint} L${xScaleBounds[1]},${yPoint}`}
                    >
                      <DashPathEffect intervals={[5, 10]} />
                    </Path>
                  </Group>
                );
              })}
            </Group>
          ) : null}

          {font ? (
            <Group>
              {xScale.domain().map((label, idx: number) => (
                <Group color={labelsColor} key={label + idx.toString()}>
                  <Text
                    font={font}
                    x={xScale(label)! - barWidth / 2}
                    y={canvasHeight}
                    text={label.toString()}
                  />
                </Group>
              ))}
            </Group>
          ) : null}

          <Path path={path} color={chartColor} />

          {/*{data.map((dataPoint: ChartPoint, idx: number) => (*/}
          {/*  <Group color={labelsColor} key={`${dataPoint.x}-${idx}`}>*/}
          {/*    <Text*/}
          {/*      font={font}*/}
          {/*      // todo: remove ts-ignore*/}
          {/*      // @ts-ignore*/}
          {/*      x={xScale(dataPoint.x)}*/}
          {/*      y={canvasHeight}*/}
          {/*      text={getXLabel({*/}
          {/*        idx,*/}
          {/*        date: dataPoint.x,*/}
          {/*        xLabelsInterval,*/}
          {/*        totalCount,*/}
          {/*      })}*/}
          {/*    />*/}
          {/*  </Group>*/}
          {/*))}*/}
        </Canvas>
      </View>
    );
  }
);
