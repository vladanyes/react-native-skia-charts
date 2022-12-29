import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import { Easing, LayoutChangeEvent, View } from 'react-native';
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
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';
import type { ChartPoint } from './types';

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
  data: ChartPoint[];
}

// fontMedium,
export const SkiaLineChart = memo(
  ({
    yAxisMax = 1,
    labelsColor = 'black',
    isLoading = false,
    startDate,
    endDate,
    fontSize = CHART_FONT_SIZE,
    paddingHorizontal = CHART_HORIZONTAL_MARGIN,
    paddingVertical = CHART_VERTICAL_MARGIN,
    tension = 0.5,
    data = [],
  }: // x,
  IProps) => {
    const setIsSwipeEnabled = (arg: boolean) => arg;
    const [canvasWidth, setCanvasWidth] = useState(CHART_WIDTH);
    const [canvasHeight, setCanvasHeight] = useState(CHART_HEIGHT);
    const [isTouchActive, setIsTouchActive] = useState<boolean>(false);
    const font = useFont(
      require('../assets/fonts/Roboto-Regular.ttf'),
      fontSize
    );

    const xScaleRange = [
      paddingHorizontal,
      canvasWidth - paddingHorizontal,
    ] as const;
    const chartHeight = canvasHeight - paddingVertical;
    const canvasStyles = {
      width: canvasWidth,
      height: canvasHeight,
    };

    // x position of the cursor
    const x = useValue<number>(xScaleRange[0]);
    const yLabels = getYLabels(yAxisMax);
    // const { panGestureRef, isLinesUsageChartShown, setIsSwipeEnabled } = props;

    const onLayout = useCallback(
      ({ nativeEvent: { layout } }: LayoutChangeEvent) => {
        setCanvasWidth(Math.round(layout.width));
        setCanvasHeight(Math.round(layout.height));
      },
      [setCanvasWidth]
    );

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
      <GestureDetector gesture={panGesture}>
        <View style={{ flex: 1 }} onLayout={onLayout}>
          <Canvas style={canvasStyles}>
            <Group>
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
              {font &&
                yLabels.map((label: string | number, idx: number, array) => {
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
                        path={`M${xScaleRange[0]},${yPoint} L${xScaleRange[1]},${yPoint}`}
                      >
                        <DashPathEffect intervals={[5, 10]} />
                      </Path>
                    </Group>
                  );
                })}

              {font &&
                data.map((dataPoint, idx: number) => (
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
          </Canvas>
        </View>
      </GestureDetector>
    );
  }
);
