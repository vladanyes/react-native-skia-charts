import React from 'react';
import { Canvas, Path } from '@shopify/react-native-skia';

export const SkiaTestChart = ({
  color = 'lightblue',
}: {
  color?: string;
}): React.ReactElement => {
  return (
    <Canvas style={{ flex: 1, width: 300, height: 300 }}>
      <Path
        path="M 128 0 L 168 80 L 256 93 L 192 155 L 207 244 L 128 202 L 49 244 L 64 155 L 0 93 L 88 80 L 128 0 Z"
        color={color}
      />
    </Canvas>
  );
};
