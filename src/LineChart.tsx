import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import { Easing, LayoutChangeEvent, View } from 'react-native';
import {
  Canvas,
  DashPathEffect,
  Group,
  Path,
  runTiming,
  Skia,
  Text,
  useFont,
  useValue,
} from '@shopify/react-native-skia';
import { scaleLinear } from 'd3-scale';
import { curveCardinal, line } from 'd3-shape';
import dayjs from 'dayjs';
import {
  CHART_FONT_SIZE,
  CHART_HEIGHT,
  CHART_HORIZONTAL_MARGIN,
  CHART_LINE_COLOR,
  CHART_VERTICAL_MARGIN,
  CHART_WIDTH,
} from './constants';
import { getXLabel, getXLabelsInterval, getYLabels } from './helpers';
import { GestureDetector } from 'react-native-gesture-handler';
import { runOnJS, useAnimatedReaction } from 'react-native-reanimated';
import type { ChartPoint } from './types';
import { usePanGesture } from './hooks/usePanGesture';
import LineChartTooltip from './LineChartTooltip';

// todo move to types file
interface IProps {
  yAxisMax: number;
  startDate: Date;
  endDate: Date;
  isLoading?: boolean;
  labelsColor?: string;
  fontPath?: string;
  fontSize?: number;
  canvasHeight?: number;
  paddingHorizontal?: number;
  paddingVertical?: number;
  tension?: number;
  onTouchStart: (arg: boolean) => void;
  onTouchEnd: (arg: boolean) => void;
  data: ChartPoint[];
}

// fontMedium,
export const LineChart = memo(
  ({
    yAxisMax = 1, // todo make dynamic
    labelsColor = 'black',
    isLoading = false,
    startDate,
    endDate,
    fontSize = CHART_FONT_SIZE,
    paddingHorizontal = CHART_HORIZONTAL_MARGIN,
    paddingVertical = CHART_VERTICAL_MARGIN,
    tension = 0.5,
    onTouchStart,
    onTouchEnd,
    data = [],
  }: IProps) => {
    const [canvasWidth, setCanvasWidth] = useState(CHART_WIDTH);
    const [canvasHeight, setCanvasHeight] = useState(CHART_HEIGHT);
    const [isTouchActive, setIsTouchActive] = useState<boolean>(false);

    const xScaleBounds = [
      paddingHorizontal,
      canvasWidth - paddingHorizontal,
    ] as const;
    const chartHeight = canvasHeight - paddingVertical;
    const canvasStyles = {
      width: canvasWidth,
      height: canvasHeight,
    };

    const { x, gesture, isActive } = usePanGesture({
      xScaleBounds,
    });
    const font = useFont(
      require('../assets/fonts/Roboto-Regular.ttf'),
      fontSize
    );

    const yLabels = getYLabels(yAxisMax);

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

    const lineAnimationState = useValue<number>(0);
    // having this value we are preventing re-starting line chart animation
    // if it's already started
    const isLineAnimationRunning = useRef<boolean>(false);
    const totalCount = data.length;
    const xLabelsInterval = getXLabelsInterval(totalCount);

    // scales
    // todo get the latest date from the data
    const xScale = scaleLinear()
      .domain([dayjs(startDate).valueOf(), dayjs(endDate).valueOf()])
      .range(xScaleBounds);
    const yScale = scaleLinear().domain([0, yAxisMax]).range([chartHeight, 15]);

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
      if (!isLoading && !isLineAnimationRunning.current) {
        lineAnimationState.current = 0;
        isLineAnimationRunning.current = true;
        setTimeout(animateLine, 0);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [startDate, isLoading]);

    const curvedLine = data.length
      ? line<ChartPoint>()
          .x((d) => xScale(dayjs(d.date).valueOf()))
          .y((d) => yScale(d.value))
          .curve(curveCardinal.tension(tension))(data)
      : '';

    const chartPath = Skia.Path.MakeFromSVGString(curvedLine!);

    return (
      <GestureDetector gesture={gesture}>
        <View style={{ flex: 1 }} onLayout={onLayout}>
          <Canvas style={canvasStyles}>
            {!isLoading && chartPath && (
              <Path
                style="stroke"
                path={chartPath}
                strokeWidth={3}
                strokeJoin="round"
                strokeCap="round"
                color={CHART_LINE_COLOR}
                start={0}
                end={lineAnimationState}
              />
            )}

            {font ? (
              <Group>
                {yLabels.map((label: string | number, idx: number, array) => {
                  const isString = typeof label === 'string';
                  const isLastItem = idx === array.length - 1;
                  const yPoint = isString ? yScale(0) : yScale(label);

                  return (
                    <Group key={label}>
                      <Text
                        color={labelsColor}
                        font={font}
                        x={0}
                        y={isLastItem ? yPoint + 3 : yPoint}
                        text={isString ? label : label.toFixed(1)}
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
                {data.map((dataPoint, idx: number) => (
                  <Group color={labelsColor} key={`${dataPoint.date}-xAxis`}>
                    <Text
                      font={font}
                      x={xScale(dayjs(dataPoint.date).valueOf()) - 4}
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
              </Group>
            ) : null}

            {isTouchActive ? (
              <LineChartTooltip x={x} chartHeight={chartHeight} />
            ) : null}
          </Canvas>
        </View>
      </GestureDetector>
    );
  }
);
