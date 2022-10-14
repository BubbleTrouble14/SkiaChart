/* eslint-disable react-native/no-inline-styles */
/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import {
  Canvas,
  Group,
  Line2DPathEffect,
  Paint,
  processTransform2d,
  Rect,
  Selector,
  useComputedValue,
  useFont,
  useLoop,
  useSharedValueEffect,
  useValue,
} from '@shopify/react-native-skia';
import {max, min} from 'd3-arrays';
import {scaleBand, scaleTime} from 'd3-scale';
import {differenceInCalendarDays, subDays, subHours} from 'date-fns';
import React, {useMemo} from 'react';
import {
  LogBox,
  SafeAreaView,
  StatusBar,
  useWindowDimensions,
} from 'react-native';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import {useSharedValue} from 'react-native-reanimated';

LogBox.ignoreLogs(['Require cycle:']);

const groups = [
  {name: 'Red', color: 'grey'},
  {name: 'Green', color: 'blue'},
  {name: 'Blue', color: 'green'},
  {name: 'Brown', color: 'red'},
];

const data = [
  {
    start: subDays(new Date(Date.now()), 14),
    end: subDays(new Date(Date.now()), 11),
    name: 'test15',
    group: 'Red',
  },
  {
    start: subDays(new Date(Date.now()), 11),
    end: subDays(new Date(Date.now()), 9),
    name: 'test14',
    group: 'Green',
  },
  {
    start: subDays(new Date(Date.now()), 7),
    end: subDays(new Date(Date.now()), 5),
    name: 'test13',
    group: 'Blue',
  },
  {
    start: subDays(new Date(Date.now()), 3),
    end: subDays(new Date(Date.now()), 2),
    name: 'test12',
    group: 'Brown',
  },
];

const App = () => {
  const {width, height} = useWindowDimensions();

  const margin = {left: 0, right: 0};

  // const chartWidth = 1000;
  const chartHeight = height / 3;
  const brushHeight = height / 6;

  const rPrevBarWidth = useSharedValue(0);
  const transform = useValue([]);

  const defaultDayCountForWidth = 4;
  const pixelsPerDay = width / defaultDayCountForWidth;
  const totalDays = differenceInCalendarDays(
    max(data.map(item => item.end)),
    min(data.map(item => item.start)),
  );
  const chartWidth = totalDays * pixelsPerDay;

  // console.log(pixelsPerDay, chartWidth);

  const rViewWidth = useSharedValue(chartWidth);
  const viewWidth = useValue(chartWidth);
  const viewOffestX = useSharedValue(0);

  const visibleDays = useSharedValue(defaultDayCountForWidth);
  const minVisibleDuration = 7;
  const numVisibleDays = 10;
  const viewPixelsInDay = width / minVisibleDuration;
  const viewTotalPixels = differenceInCalendarDays(
    max(data.map(item => item.end)),
    min(data.map(item => item.start)),
  );
  const viewVisiblePixels = numVisibleDays * viewPixelsInDay;

  const brushOffsetX = useSharedValue(-200);

  // console.log(width);
  // console.log(viewTotalPixels, viewPixelsInDay, viewVisiblePixels);

  const yScale = useMemo(() => {
    return scaleBand()
      .domain(data.map(val => val.group))
      .range([0, chartHeight])
      .paddingInner(0.2)
      .paddingOuter(0.2)
      .round(false);
  }, [chartHeight]);

  const yScaleBackground = useMemo(() => {
    return scaleBand()
      .domain(data.map(val => val.group))
      .range([0, chartHeight])
      .paddingInner(0)
      .paddingOuter(0.1)
      .round(false);
  }, [chartHeight]);

  const timeScale = useComputedValue(
    () =>
      scaleTime()
        .domain([min(data, d => d.start), max(data, d => d.end)])
        .range([0, viewWidth.current - margin.left - margin.right]),
    [viewWidth],
  );

  const yScaleBrush = useMemo(() => {
    return scaleBand()
      .domain(data.map(val => val.group))
      .range([0, brushHeight])
      .paddingInner(0.2)
      .paddingOuter(0.2)
      .round(false);
  }, [brushHeight]);

  const brushTimeScale = useMemo(() => {
    return scaleTime()
      .domain([min(data, d => d.start), max(data, d => d.end)])
      .range([0, width - margin.left - margin.right]);
  }, [width, margin.left, margin.right]);

  useSharedValueEffect(() => {
    transform.current = [{translateX: viewOffestX.value}];
  }, viewOffestX);

  useSharedValueEffect(() => {
    viewWidth.current = rViewWidth.value;
  }, rViewWidth);

  const brushX0 = useValue(0);
  const brushX1 = useValue(brushTimeScale(timeScale.current.invert(width)));

  useSharedValueEffect(
    () => {
      const x0 = rViewWidth.value - (rViewWidth.value + viewOffestX.value);
      // const x1 = width;

      brushX0.current = brushTimeScale(timeScale.current.invert(x0));
      brushX1.current = brushTimeScale(timeScale.current.invert(width));
      // brushX1.current = timeScale.current.invert(x1);
      // console.log(
      //   brushTimeScale(timeScale.current.invert(x0)),
      //   brushTimeScale(timeScale.current.invert(x1)),
      // );
      // const
      // console.log(rViewWidth.value - (rViewWidth.value + viewOffestX.value));
    },
    rViewWidth,
    viewOffestX,
  );

  const x = useSharedValue(0);

  const pan = Gesture.Pan()
    .minDistance(20)
    .onBegin(e => {
      x.value = viewOffestX.value - e.x;
    })
    .onChange(e => {
      viewOffestX.value = Math.min(
        Math.max(x.value + e.x, -rViewWidth.value + width),
        0,
      );
    })
    .onEnd(e => {
      x.value = viewOffestX.value - e.x;
    })
    .hitSlop({horizontal: 20});

  const pinch = Gesture.Pinch()
    .onBegin(e => {
      rPrevBarWidth.value = rViewWidth.value;
      x.value = viewOffestX.value;
    })
    .onChange(e => {
      rViewWidth.value = Math.max(e.scale * rPrevBarWidth.value, width);
      // viewOffestX.value =
      //   x.value * e.scale +
      //   (rViewWidth.value * e.scale) / rPrevBarWidth.value -
      //   (width / e.scale) * e.scale +
      //   width / e.scale;
      viewOffestX.value = Math.min(
        x.value * e.scale - (width / 2) * e.scale + width / 2,
        0,
      );

      // console.log(viewOffestX.value);

      // if (e.scale > 1) {
      //   viewOffestX.value =
      //     x.value - (rViewWidth.value - rPrevBarWidth.value) / 2;
      // } else {
      //   viewOffestX.value =
      //     x.value +
      //     e.scale * (-x.value / (rViewWidth.value - rPrevBarWidth.value));
      // }
      // console.log(e.scale);
      // viewOffestX.value =
      //   x.value - (rViewWidth.value - rPrevBarWidth.value) / 2;
    })
    .onEnd(e => {
      rPrevBarWidth.value = rViewWidth.value;
      x.value = viewOffestX.value;
    });

  // const pan = Gesture.Pan()
  //   .minDistance(20)
  //   .onBegin(e => {
  //     x.value = viewOffestX.value - e.viewOffestX;
  //   })
  //   .onChange(e => {
  //     viewOffestX.value = Math.min(
  //       Math.max(x.value + e.viewOffestX, -rViewWidth.value + width),
  //       0,
  //     );
  //   })
  //   .onEnd(e => {
  //     x.value = viewOffestX.value - e.viewOffestX;
  //   })
  //   .hitSlop({horizontal: 20});

  // const pinch = Gesture.Pinch()
  //   .onBegin(e => {
  //     rPrevBarWidth.value = rViewWidth.value;
  //     x.value = viewOffestX.value;

  //     console.log(viewOffestX.value);
  //   })
  //   .onChange(e => {
  //     const newWidth = Math.max(e.scale * rPrevBarWidth.value, width);
  //     rViewWidth.value = newWidth;

  //     // viewOffestX.value = x.value;

  //     console.log(x.value, rPrevBarWidth.value - newWidth);
  //   })
  //   .onEnd(e => {
  //     x.value = viewOffestX.value;
  //   });

  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <SafeAreaView
        style={{
          display: 'flex',
          flex: 1,
        }}>
        <StatusBar barStyle="light-content" />

        <GestureDetector gesture={Gesture.Race(pinch, pan)}>
          <Canvas style={{flex: 1}}>
            {groups.map((item, i) => {
              return (
                <Rect
                  opacity={0.6}
                  key={item.name}
                  x={0}
                  y={yScaleBackground(item.name)}
                  height={yScaleBackground.bandwidth()}
                  width={width}
                  color={item.color}
                />
              );
            })}
            <Group transform={[{translateX: margin.left}]}>
              <Group transform={transform}>
                {data.map((item, i) => {
                  return (
                    <Rect
                      key={i}
                      x={Selector(timeScale, v => {
                        return v(item.start);
                      })}
                      y={yScale(item.group)}
                      height={yScale.bandwidth()}
                      width={Selector(timeScale, v => {
                        return Math.abs(v(item.end) - v(item.start));
                      })}
                      color="red"
                    />
                  );
                })}
              </Group>
            </Group>
            <Group transform={[{translateY: chartHeight}]}>
              <>
                {data.map((item, i) => {
                  return (
                    <Rect
                      key={i}
                      x={brushTimeScale(item.start)}
                      y={yScaleBrush(item.group)}
                      height={yScaleBrush.bandwidth()}
                      width={Math.abs(
                        brushTimeScale(item.end) - brushTimeScale(item.start),
                      )}
                      color="red"
                    />
                  );
                })}
                <Rect
                  opacity={0.2}
                  x={brushX0}
                  y={0}
                  width={brushX1}
                  height={brushHeight}
                  color={'grey'}>
                  <Line2DPathEffect
                    width={1.5}
                    matrix={processTransform2d([
                      {scaleX: 8, scaleY: 8},
                      {rotate: 30},
                    ])}
                  />
                  <Paint
                    color={'grey'}
                    strokeWidth={0.8}
                    style="stroke"
                    opacity={0.8}
                  />
                </Rect>
              </>
            </Group>
          </Canvas>
        </GestureDetector>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

export default App;
