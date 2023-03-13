import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import { LayoutChangeEvent, View } from 'react-native';
import {
  Canvas,
  DashPathEffect,
  Group,
  Path,
  runTiming,
  Skia,
  Text,
  useComputedValue,
  useFont,
  useSharedValueEffect,
  useValue,
} from '@shopify/react-native-skia';
import { scaleLinear, scalePoint } from 'd3-scale';
import {
  CHART_FONT_SIZE,
  CHART_HEIGHT,
  CHART_HORIZONTAL_MARGIN,
  CHART_LINE_COLOR,
  CHART_VERTICAL_MARGIN,
  CHART_WIDTH,
} from './constants';
import { GestureDetector } from 'react-native-gesture-handler';
import { runOnJS, useAnimatedReaction, Easing } from 'react-native-reanimated';
import type { LineChartProps } from './types';
import { usePanGesture } from './hooks/usePanGesture';

// fontMedium,
export const LineChart = memo(
  ({
    yAxisMax: yAxisMaxProp,
    labelsColor = 'black',
    // isLoading,
    // startDate: startDateProp,
    // endDate: endDateProp,
    fontSize = CHART_FONT_SIZE,
    fontFile,
    paddingHorizontal = CHART_HORIZONTAL_MARGIN,
    paddingVertical = CHART_VERTICAL_MARGIN,
    // tension = 0.5,
    onTouchStart,
    onTouchEnd,
    // withTooltip = true,
    // tooltip,
    datasets = [],
  }: LineChartProps) => {
    // only the first item of datasets prop will be used, other items will be ignored.
    const [{ data = [], color: chartColor = CHART_LINE_COLOR } = {}] = datasets;
    const [canvasWidth, setCanvasWidth] = useState(CHART_WIDTH);
    const [canvasHeight, setCanvasHeight] = useState(CHART_HEIGHT);
    const [, setIsTouchActive] = useState<boolean>(false);
    const skiaX = useValue(0);

    // define chart boundaries
    // const startDate = startDateProp || getMinMaxDate(data, 'min');
    // const endDate = endDateProp || getMinMaxDate(data, 'max');
    // const yAxisMax = yAxisMaxProp || getMaxYValue(data);

    const xScaleBounds = [
      paddingHorizontal,
      canvasWidth - paddingHorizontal,
    ] as const;
    const chartHeight = canvasHeight - paddingVertical;
    const yScaleBounds = [chartHeight, paddingVertical] as const;
    const canvasStyles = {
      width: canvasWidth,
      height: canvasHeight,
    };

    const {
      x: reanimatedX,
      gesture,
      isActive,
    } = usePanGesture({
      xScaleBounds,
    });
    const font = useFont(fontFile, fontSize);

    const onLayout = useCallback(
      ({ nativeEvent: { layout } }: LayoutChangeEvent) => {
        setCanvasWidth(Math.round(layout.width));
        setCanvasHeight(Math.round(layout.height));
      },
      [setCanvasWidth]
    );

    const setIsTouchActiveCallbacks = useCallback(
      (active: boolean) => {
        if (active) {
          onTouchStart?.(active);
        } else {
          onTouchEnd?.(active);
        }
        setIsTouchActive(active);
      },
      [onTouchEnd, onTouchStart]
    );

    useAnimatedReaction(
      () => isActive.value,
      (active) => {
        runOnJS(setIsTouchActiveCallbacks)(active);
      },
      [isActive]
    );

    // connect Reanimated values to Skia values
    useSharedValueEffect(() => {
      skiaX.current = reanimatedX.value;
    }, reanimatedX);

    const xScale = scalePoint()
      .domain(data.map((d) => d.x.toString()))
      .range(xScaleBounds)
      .align(0);

    const yScaleDomain = [0, yAxisMaxProp || Math.max(...data.map((d) => d.y))];
    const yScale = scaleLinear().domain(yScaleDomain).range(yScaleBounds);
    const scaledData = data.map((d) => ({
      x: xScale(d.x.toString())!,
      y: yScale(d.y),
    }));

    const linePath = useComputedValue(() => {
      const newPath = Skia.Path.Make();

      for (let i = 0; i < scaledData.length; i++) {
        const point = scaledData[i]!;

        if (i === 0) newPath.moveTo(point.x, point.y);

        const prev = scaledData[i - 1];
        const prevPrev = scaledData[i - 2];
        if (prev == null) continue;
        const p0 = prevPrev ?? prev;
        const p1 = prev;
        const cp1x = (2 * p0.x + p1.x) / 3;
        const cp1y = (2 * p0.y + p1.y) / 3;
        const cp2x = (p0.x + 2 * p1.x) / 3;
        const cp2y = (p0.y + 2 * p1.y) / 3;
        const cp3x = (p0.x + 4 * p1.x + point.x) / 6;
        const cp3y = (p0.y + 4 * p1.y + point.y) / 6;

        // http://blogs.sitepointstatic.com/examples/tech/canvas-curves/bezier-curve.html
        // https://www.youtube.com/watch?v=uQbqB8J7Ua0
        // https://github.com/flutter/flutter/issues/13088

        if (i !== scaledData.length - 1) {
          // Adds cubic from last point towards (x1, y1),
          //   then towards (x2, y2), ending at (x3, y3).
          newPath.cubicTo(cp1x, cp1y, cp2x, cp2y, cp3x, cp3y);
        } else {
          // draws the last piece of the chart
          // newPath.cubicTo(
          //   (p1.x + point.x) / 2,
          //   p1.y,
          //   (p1.x + point.x) / 2,
          //   point.y,
          //   point.x,
          //   point.y
          // );

          // newPath.cubicTo(
          //   cp1x,
          //   cp1y,
          //   (p1.x + point.x) / 2,
          //   (p1.y + point.y) / 2,
          //   point.x,
          //   point.y
          // );

          // newPath.cubicTo(point.x, point.y, point.x, point.y, point.x, point.y);

          newPath.cubicTo(
            p1.x,
            p1.y,
            (p1.x + point.x) / 2,
            (p1.y + point.y) / 2,
            point.x,
            point.y
          );
        }
      }

      return newPath;
    }, [scaledData]);

    const lineAnimationState = useValue<number>(0);
    // having this value we are preventing re-starting line chart animation
    // if it's already started
    const isLineAnimationRunning = useRef<boolean>(false);
    const animateLine = () => {
      lineAnimationState.current = 0;
      runTiming(
        lineAnimationState,
        1,
        {
          duration: 1000,
          easing: Easing.inOut(Easing.exp),
        },
        () => {
          isLineAnimationRunning.current = false;
        }
      );
    };

    useEffect(() => {
      // this useEffect is responsible for toggling chart
      if (!isLineAnimationRunning.current) {
        lineAnimationState.current = 0;
        isLineAnimationRunning.current = true;
        setTimeout(animateLine, 0);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data]);

    return (
      <GestureDetector gesture={gesture}>
        <View style={{ flex: 1 }} onLayout={onLayout}>
          <Canvas style={canvasStyles}>
            {font ? (
              <Group>
                {yScale.ticks(6).map((label: number, idx: number) => {
                  const yPoint = yScale(label);
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
                      x={xScale(label)}
                      y={canvasHeight}
                      text={label.toString()}
                    />
                  </Group>
                ))}
              </Group>
            ) : null}

            <Path
              style="stroke"
              path={linePath}
              strokeWidth={3}
              strokeJoin="round"
              strokeCap="round"
              color={chartColor}
              start={0}
              end={lineAnimationState}
            />
          </Canvas>
        </View>
      </GestureDetector>
    );
  }
);
