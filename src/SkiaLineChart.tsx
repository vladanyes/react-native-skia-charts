import React, { memo, useEffect, useRef, useState } from 'react';
import { Easing } from 'react-native';
import {
  Canvas,
  clamp,
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
import { curveNatural, line } from 'd3-shape';
import dayjs from 'dayjs';
import {
  CHART_FONT_SIZE,
  CHART_HEIGHT,
  CHART_HORIZONTAL_MARGIN,
  CHART_LINE_COLOR,
  CHART_VERTICAL_MARGIN,
  CHART_WIDTH,
  CHART_YLABELS_HORIZONTAL_MARGIN,
} from './constants';
import { getXLabel, getXLabelsInterval, getYLabels } from './helpers';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';
import type { ChartPoint } from './types';

const xScaleRange: readonly [number, number] = [
  CHART_HORIZONTAL_MARGIN + 15,
  CHART_WIDTH - CHART_HORIZONTAL_MARGIN,
] as const;
const chartHeight = CHART_HEIGHT - CHART_VERTICAL_MARGIN;
const canvasStyles = {
  width: CHART_WIDTH,
  height: CHART_HEIGHT,
};

interface IProps {
  yAxisMax: number;
  startDate: Date;
  endDate: Date;
  isFetching?: boolean;
  labelsColor?: string;
  data: ChartPoint[];
}

export const SkiaLineChart = memo(
  ({
    yAxisMax = 1,
    labelsColor = 'black',
    isFetching = false,
    startDate,
    endDate,
    data = [],
  }: // font,
  // chartHeight,
  // fontMedium,
  // yLabels,
  // xScaleRange,
  // x,
  IProps) => {
    const setIsSwipeEnabled = (arg: boolean) => arg;
    const [isTouchActive, setIsTouchActive] = useState<boolean>(false);
    const font = useFont(
      require('../public/fons/Roboto-Regular.ttf'),
      CHART_FONT_SIZE
    );
    // x position of the cursor
    const x = useValue<number>(xScaleRange[0]);
    const yLabels = getYLabels('GB', yAxisMax);
    // const { panGestureRef, isLinesUsageChartShown, setIsSwipeEnabled } = props;

    // chart touch handlers
    const handleStart = (event: { x: number }) => {
      setIsTouchActive(true);
      setIsSwipeEnabled(false);
      handleUpdate(event);
    };

    const handleUpdate = (event: { x: number }) => {
      x.current = clamp(event.x, xScaleRange[0], xScaleRange[1]);
    };

    const handleEnd = () => {
      if (isTouchActive) {
        setIsTouchActive(false);
        setIsSwipeEnabled(true);
      }
    };

    // we have to use Gesture.Pan() here as our chart is withing the ScrollView...
    //   and we have to effectively manage Y axis moves.
    //  Skia can't properly handle Y axis moves withing the ScrollView by default.
    const panGesture = Gesture.Pan()
      .onBegin((e) => {
        // runOnJS is needed for calling functions in the same thread
        runOnJS(handleStart)(e);
      })
      .onUpdate((e) => {
        runOnJS(handleUpdate)(e);
      })
      .onFinalize(() => {
        runOnJS(handleEnd)();
      });
    // .withRef(panGestureRef);

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
      .range(xScaleRange);
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
      if (!isFetching && !isLineAnimationRunning.current) {
        lineAnimationState.current = 0;
        isLineAnimationRunning.current = true;
        setTimeout(animateLine, 0);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [startDate, isFetching]);

    const curvedLine = data.length
      ? line<ChartPoint>()
          .x((d) => xScale(dayjs(d.date).valueOf()))
          .y((d) => yScale(d.value))
          .curve(curveNatural)(data)
      : '';

    const chartPath = Skia.Path.MakeFromSVGString(curvedLine!);

    return (
      <GestureDetector gesture={panGesture}>
        <Canvas style={canvasStyles}>
          {!font ? null : (
            <Group>
              {!isFetching && chartPath && (
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
              {yLabels.map((label: string | number, idx: number, array) => {
                const isString = typeof label === 'string';
                const isLastItem = idx === array.length - 1;
                const yPoint = isString ? yScale(0) : yScale(label);

                return (
                  <Group key={label}>
                    <Text
                      color={labelsColor}
                      font={font}
                      x={CHART_YLABELS_HORIZONTAL_MARGIN}
                      y={isLastItem ? yPoint + 3 : yPoint}
                      text={isString ? label : label.toFixed(1)}
                    />
                    <Path
                      color="lightgrey"
                      style="stroke"
                      strokeWidth={1}
                      path={`M${xScaleRange[0]},${yPoint} L${xScaleRange[1]},${yPoint}`}
                    >
                      <DashPathEffect intervals={[5, 10]} />
                    </Path>
                  </Group>
                );
              })}

              {data.map((dataPoint, idx: number) => (
                <Group color={labelsColor} key={`${dataPoint.date}-xAxis`}>
                  <Text
                    font={font}
                    x={xScale(dayjs(dataPoint.date).valueOf()) - 4}
                    y={chartHeight + CHART_VERTICAL_MARGIN}
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
          )}
        </Canvas>
      </GestureDetector>
    );
  }
);
