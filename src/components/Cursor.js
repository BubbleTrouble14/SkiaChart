import {Shadow, Skia, SkiaValue} from '@shopify/react-native-skia';
import {
  interpolateColors,
  Circle,
  Group,
  useComputedValue,
  Paint,
} from '@shopify/react-native-skia';
import React from 'react';

export const COLORS = ['#F69D69', '#FFC37D', '#61E0A1', '#31CBD1'].map(
  Skia.Color,
);

export const Cursor = ({x, y, width, circleRadius, circleStrokeRadius}) => {
  const color = useComputedValue(
    () =>
      interpolateColors(
        x.current / width,
        COLORS.map((_, i) => i / COLORS.length),
        COLORS,
      ),
    [x],
  );
  const transform = useComputedValue(
    () => [{translateX: x.current}, {translateY: y.current}],
    [x, y],
  );
  return (
    <Group transform={transform}>
      <Circle
        cx={0}
        cy={0}
        r={circleStrokeRadius}
        color={'#000000'}
        opacity={0.03}
      />
      {/* <Circle cx={0} cy={0} r={12} color={'#000000'} opacity={0.04} /> */}
      <Circle cx={0} cy={0} r={circleRadius} color={'#6a7ee7'}>
        <Shadow dx={0} dy={0} blur={3} color="#828282" />

        {/* <Paint style="stroke" strokeWidth={2} color="white" /> */}
      </Circle>
    </Group>
  );
};
