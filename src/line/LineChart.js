import {
  Canvas,
  Easing,
  Group,
  LinearGradient,
  Path,
  runSpring,
  runTiming,
  Skia,
  useComputedValue,
  useValue,
  useValueEffect,
  vec,
} from '@shopify/react-native-skia';
import PropTypes from 'prop-types';
import React, {createContext, useMemo} from 'react';
import {View, Button} from 'react-native';
import {extent} from 'd3-arrays';
import {scaleLinear} from 'd3-scale';
import {curveCardinal, line as d3Line} from 'd3-shape';
import {useState} from 'react/cjs/react.development';
import {JellySelector} from '../JellySelector';
import {curveLines, getYForX} from '../Math';
import {useGraphTouchHandler} from '../useGraphTouchHandler';
import data from '../data.json';
import {Label} from '../components/Label';
import {Cursor} from '../components/Cursor';
import {getSixDigitHex} from '../utils/getSixDigitHex';

const buildGraph = (datapoints, label, xMax, yMax) => {
  const prices = datapoints.map(item => item[1]);
  const dates = datapoints.map(item => item[0]);
  const minDate = Math.min(...dates);
  const maxDate = Math.max(...dates);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const percentChange = ((1 - minPrice / maxPrice) * 100).toFixed(2);
  let xMinPrice = 0;
  let xMaxPrice = 0;

  const points = datapoints.map(([date, price]) => {
    const x = ((date - minDate) / (maxDate - minDate)) * xMax;
    const y = ((price - minPrice) / (maxPrice - minPrice)) * yMax;

    if (minPrice === price) {
      xMinPrice = x;
    }
    if (maxPrice === price) {
      xMaxPrice = x;
    }

    return {x, y};
  });
  const path = curveLines(points, 0.2, 'bezier');
  return {
    label,
    minPrice,
    maxPrice,
    xMinPrice,
    xMaxPrice,
    percentChange: percentChange,
    path,
  };
};

const LineChart = ({
  xAccessor,
  yAccessor,
  width = 200,
  height = 300,
  offset = 8,
  color = '#6a7ee7',
  enableFadeInMask = false,
  lineCount = 6,
  verticalMargin = 8,
  margin = {top: 120, right: 20, bottom: 24, left: 20},
  children,
}) => {
  //   if (!data) {
  //     throw Error('No data set!');
  //   } else if (!xAccessor) {
  //     throw Error('No xAccessor set!');
  //   } else if (!yAccessor) {
  //     throw Error('No yAccessor set!');
  //   }

  // const test = buildGraph(data, 'test', width, height);
  // console.log(test);

  const yMax = height - margin.bottom - margin.top;
  const xMax = width - margin.left - margin.right;

  const graphs = [
    buildGraph(data.prices, 'test', xMax, yMax),
    buildGraph(data.prices.slice(30, 60), 'test1', xMax, yMax),
    buildGraph(data.prices.slice(60, 90), 'test2', xMax, yMax),
    buildGraph(data.prices.slice(90, 120), 'test3', xMax, yMax),
    buildGraph(data.prices.slice(120, 150), 'test4', xMax, yMax),
    buildGraph(data.prices.slice(60, 90), 'test5', xMax, yMax),
    buildGraph(data.prices.slice(20, 60), 'test6', xMax, yMax),
    buildGraph(data.prices.slice(90, 120), 'test7', xMax, yMax),
  ];

  const jellyData = [
    {label: '1h', value: 0},
    {label: '24h', value: 1},
    {label: '7d', value: 2},
    {label: '30d', value: 3},
    {label: '90d', value: 4},
    {label: '1y', value: 5},
    // {label: 'all', value: 6},
  ];

  const transition = useValue(4);

  const currentState = useValue(0);
  const nextState = useValue(0);

  // const state = useValue({
  //   next: 0,
  //   current: 0,
  // });

  const stateChanged = useValue(0);

  const gradientColors = useMemo(() => {
    if (enableFadeInMask) {
      return [
        `${getSixDigitHex(color)}00`,
        `${getSixDigitHex(color)}ff`,
        `${getSixDigitHex(color)}ff`,
        `${getSixDigitHex(color)}33`,
        `${getSixDigitHex(color)}33`,
      ];
    } else {
      return [
        color,
        color,
        color,
        `${getSixDigitHex(color)}33`,
        `${getSixDigitHex(color)}33`,
      ];
    }
  }, [color, enableFadeInMask]);

  const pathEnd = useValue(1);

  const path = useComputedValue(() => {
    // const {current, next} = state.current;
    const start = graphs[currentState.current].path;
    const end = graphs[nextState.current].path;
    return end.interpolate(start, transition.current);
  }, [currentState, nextState, transition]);

  const x = useValue(0);
  const y = useComputedValue(
    () => getYForX(path.current.toCmds(), x.current),
    [x, path],
  );

  const gestureActive = useValue(false);

  const minX = useValue(graphs[currentState.current].xMinPrice);
  const maxX = useValue(graphs[currentState.current].xMaxPrice);
  const circleRadius = useValue(0);
  const circleStrokeRadius = useComputedValue(
    () => circleRadius.current * 6,
    [circleRadius],
  );

  const onTouch = useGraphTouchHandler(
    x,
    y,
    xMax,
    width,
    margin,
    gestureActive,
    pathEnd,
  );

  useValueEffect(gestureActive, () => {
    runSpring(circleRadius, gestureActive.current ? 5 : 0, {
      mass: 1,
      stiffness: 1000,
      damping: 50,
      velocity: 0,
    });
    if (!gestureActive.current) {
      pathEnd.current = 1;
    }
  });

  const positions = useComputedValue(
    () => [
      0,
      Math.min(0.15, pathEnd.current),
      pathEnd.current,
      pathEnd.current,
      1,
    ],
    [pathEnd],
  );

  return (
    <View style={{flex: 1}}>
      <Canvas style={{width, height}} onTouch={onTouch}>
        <Label
          currentState={currentState}
          y={y}
          yMax={yMax}
          graphs={graphs}
          width={width}
          height={height}
          margin={margin}
          minX={minX}
          maxX={maxX}
        />
        <Group
          transform={[{translateY: margin.top}, {translateX: margin.left}]}>
          <Path
            style="stroke"
            path={path}
            strokeWidth={3}
            strokeJoin="round"
            strokeCap="round"
            color="#6a7ee7">
            <LinearGradient
              start={vec(0, 0)}
              end={vec(width, 0)}
              colors={gradientColors}
              positions={positions}
            />
          </Path>
          <Cursor
            x={x}
            y={y}
            width={width}
            circleRadius={circleRadius}
            circleStrokeRadius={circleStrokeRadius}
          />
        </Group>
      </Canvas>
      <JellySelector
        onPress={index => {
          stateChanged.current = index;
          runTiming(minX, graphs[index].xMinPrice, {
            easing: Easing.linear,
            duration: 200,
          });
          runTiming(maxX, graphs[index].xMaxPrice, {
            easing: Easing.linear,
            duration: 200,
          });
        }}
        currentState={currentState}
        nextState={nextState}
        transition={transition}
        jellyData={jellyData}
      />
    </View>
  );
};

LineChart.propTypes = {
  data: PropTypes.array,
  colors: PropTypes.array,
  width: PropTypes.number,
  height: PropTypes.number,
  offset: PropTypes.number,
  valueExtractor: PropTypes.func,
  nameExtractor: PropTypes.func,
  children: PropTypes.any,
};

export default LineChart;
