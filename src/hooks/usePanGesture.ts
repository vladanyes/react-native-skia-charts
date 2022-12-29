import { useMemo } from 'react';
import { Gesture, PanGesture } from 'react-native-gesture-handler';
import Reanimated, { useSharedValue } from 'react-native-reanimated';

interface Params {
  holdDuration: number;
  xScaleBounds?: readonly [number, number];
}

interface ReturnType {
  x: Reanimated.SharedValue<number>;
  y: Reanimated.SharedValue<number>;
  isActive: Reanimated.SharedValue<boolean>;
  gesture: PanGesture;
}

export function usePanGesture({
  holdDuration = 300,
  xScaleBounds = [0, 1],
}: Params): ReturnType {
  const x = useSharedValue(xScaleBounds[0]);
  const y = useSharedValue(0);
  const isPanGestureActive = useSharedValue(false);

  const panGesture = useMemo(
    () =>
      Gesture.Pan()
        .activateAfterLongPress(holdDuration)
        .onChange((e) => {
          // clamp x value to xScaleBounds.
          // can't move it to a separate function as ...
          //  ...it doesn't work with shared values.
          x.value = Math.min(Math.max(xScaleBounds[0], e.x), xScaleBounds[1]);
          y.value = e.y;
        })
        .onStart(() => {
          isPanGestureActive.value = true;
        })
        .onEnd(() => {
          isPanGestureActive.value = false;
        }),
    [holdDuration, isPanGestureActive, x, y, xScaleBounds]
  );

  return useMemo(
    () => ({
      gesture: panGesture,
      isActive: isPanGestureActive,
      x,
      y,
    }),
    [isPanGestureActive, panGesture, x, y]
  );
}
