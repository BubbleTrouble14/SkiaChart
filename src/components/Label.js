/* eslint-disable react-hooks/rules-of-hooks */
import {
  Group,
  interpolate,
  Path,
  Skia,
  Text,
  useComputedValue,
} from '@shopify/react-native-skia';
import React from 'react';

const format = value =>
  '$ ' +
  Math.round(value)
    .toString()
    .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');

export const Label = ({
  currentState,
  y,
  yMax,
  graphs,
  width,
  height,
  margin,
  minX,
  maxX,
  format = val => `${val.toFixed(2)} $`,
}) => {
  const typeface = Skia.FontMgr.RefDefault().matchFamilyStyle('serif');
  if (!typeface) {
    throw new Error('Helvetica not found');
  }

  const font = Skia.Font(typeface, 12);
  const changePercentFont = Skia.Font(typeface, 14);
  const titleFont = Skia.Font(typeface, 24);

  const text = useComputedValue(() => {
    const graph = graphs[currentState.current];
    return format(
      interpolate(y.current, [0, yMax], [graph.maxPrice, graph.minPrice]),
    );
  }, [y]);

  const minPriceText = useComputedValue(() => {
    const graph = graphs[currentState.current];
    return format(graph.minPrice);
  }, [currentState]);

  const maxPriceText = useComputedValue(() => {
    const graph = graphs[currentState.current];
    return format(graph.maxPrice);
  }, [currentState]);

  const pathValue = useComputedValue(() => {
    const graph = graphs[currentState.current];
    const path = Skia.Path.Make();
    const width = changePercentFont.getSize() / 2;
    path.moveTo(width / 2, -width);
    path.lineTo(width, -width / 3);
    path.lineTo(0, -width / 3);
    path.close();
    const textPath = Skia.Path.MakeFromText(
      `${graph.percentChange}%`,
      width + 4,
      0,
      changePercentFont,
    );
    path.op(textPath, 2);
    return path;
  }, [currentState]);

  return (
    <>
      <Text x={margin.left} y={30} text={text} font={titleFont} color="black" />
      <Group
        transform={[
          {translateY: titleFont.getSize() + 30},
          {translateX: margin.left},
        ]}>
        <Path path={pathValue} color="green" />
      </Group>

      <Text
        x={minX}
        y={margin.top - 10}
        text={maxPriceText}
        font={font}
        color="#a3a3a3"
      />
      <Text
        x={maxX}
        y={margin.top + yMax + 10}
        text={minPriceText}
        font={font}
        color="#a3a3a3"
      />
    </>
  );
};
