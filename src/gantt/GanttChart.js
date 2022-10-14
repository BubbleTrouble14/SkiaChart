import {
  Canvas,
  Group,
  Line2DPathEffect,
  Paint,
  Path,
  processTransform2d,
  Skia,
  useComputedValue,
  useTouchHandler,
  useValue,
} from '@shopify/react-native-skia';
import {max, min} from 'd3-arrays';
import {scaleBand, scaleTime} from 'd3-scale';
import React, {useMemo} from 'react';
import {View, Text} from 'react-native';
import Axis from '../Axis';
import Orientation from '../Constants';
import AnimatedGanttBar from './AnimatedGanttBar';
import GanttBar from './GanttBar';
import PropTypes from 'prop-types';
import AnimatedAxis from '../AnimatedAxis';
import {format} from 'date-fns';

const modeType = {
  NONE: -1,
  LEFT: 0,
  RIGHT: 1,
  MOVE: 2,
};

const GanttChart = ({
  data,
  yAccessor,
  compact = false,
  width = 600,
  height = 200,
  offset = 8,
  chartSeparation = 20,
  lineCount = 6,
  verticalMargin = 8,
  margin = {top: 20, right: 10, bottom: 0, left: 80},
  brushMargin = {top: 0, right: 10, bottom: 30, left: 10},
  y,
  children,
}) => {
  if (!data) {
    throw Error('No data set!');
  } else if (!yAccessor) {
    throw Error('No yAccessor set!');
  }

  const innerHeight = height - margin.top - margin.bottom;
  const topChartBottomMargin = compact
    ? chartSeparation / 2
    : chartSeparation + 10;
  const topChartHeight = 0.8 * innerHeight - topChartBottomMargin;
  const bottomChartHeight = innerHeight - topChartHeight - chartSeparation;

  const xMax = Math.max(width - margin.left - margin.right, 0);
  const yMax = Math.max(topChartHeight, 0);
  const xBrushMax = Math.max(width - brushMargin.left - brushMargin.right, 0);
  const yBrushMax = Math.max(
    bottomChartHeight - brushMargin.top - brushMargin.bottom,
    0,
  );

  const brushYScale = useMemo(
    () =>
      scaleBand()
        .domain(data.map(val => yAccessor(val)))
        .range([0, yBrushMax])
        .paddingInner(0.2)
        .paddingOuter(0.2)
        .round(false),
    [data, yAccessor, yBrushMax],
  );

  const yScale = useMemo(
    () =>
      scaleBand()
        .domain(data.map(val => yAccessor(val)))
        .range([0, yMax])
        .paddingInner(0.2)
        .paddingOuter(0.2)
        .round(false),
    [data, yMax, yAccessor],
  );

  const brushTimeScale = useMemo(
    () =>
      scaleTime()
        .domain([min(data, d => d.startDate), max(data, d => d.endDate)])
        .range([0, xBrushMax]),
    [data, xBrushMax],
  );

  const minWidth = 40;
  const barWidth = 10;

  const skiaOuterBrushPath = Skia.Path.Make();
  const skiaInnerBrushPath = Skia.Path.Make();

  skiaOuterBrushPath.addRect({
    x: 0,
    y: 0,
    width: barWidth,
    height: yBrushMax,
  });
  skiaOuterBrushPath.addRect(
    {x: xBrushMax, y: 0, width: -barWidth, height: yBrushMax},
    false,
  );

  const bounds = skiaOuterBrushPath.getBounds();
  skiaInnerBrushPath.addRect(
    {
      x: bounds.x + barWidth,
      y: 0,
      width: bounds.width - 2 * barWidth,
      height: yBrushMax,
    },
    false,
  );

  const selected = useValue(null);
  const moving = useValue(false);
  const outerPath = useValue(skiaOuterBrushPath);
  const innerPath = useValue(skiaInnerBrushPath);
  const outerPathPrev = useValue(skiaOuterBrushPath);
  const modeValue = useValue(modeType.NONE);
  const offsetPosition = useValue(0);

  const brushVal = useValue([
    brushTimeScale.invert(outerPath.current.getBounds().x),
    brushTimeScale.invert(
      outerPath.current.getBounds().x + outerPath.current.getBounds().width,
    ),
  ]);

  const timeScale = useComputedValue(
    () =>
      scaleTime()
        .domain([brushVal.current[0], brushVal.current[1]])
        .range([0, xMax]),
    [brushVal],
  );

  //   useValueEffect(selected, () => {
  //     setReactSelected(selected.current);
  //   });

  const brushTouchHandler = useTouchHandler(
    {
      onStart: ({x, y}) => {
        const bounds = outerPath.current.getBounds();
        if (x - brushMargin.left < 0 || x - brushMargin.left > xBrushMax) {
          return;
        }
        const xPos = x - brushMargin.left;
        const yHeight = topChartHeight + topChartBottomMargin + margin.top;
        if (y > yHeight && y < yHeight + yBrushMax) {
          if (xPos < bounds.x + barWidth) {
            modeValue.current = modeType.LEFT;
          } else if (xPos > bounds.x + bounds.width - barWidth) {
            modeValue.current = modeType.RIGHT;
          } else {
            modeValue.current = modeType.MOVE;
            offsetPosition.current = xPos;
          }
        } else {
          modeValue.current = modeType.NONE;
        }
      },
      onActive: ({x, y}) => {
        const xPos = Math.min(Math.max(x - brushMargin.left, 0), xBrushMax);

        const p1 = Skia.Path.Make();
        const p2 = Skia.Path.Make();
        if (modeValue.current === modeType.LEFT) {
          const prevBounds = outerPathPrev.current.getBounds();
          if (xPos >= prevBounds.x + prevBounds.width - minWidth) {
            p1.addRect(
              {
                x: prevBounds.x + prevBounds.width - minWidth,
                y: 0,
                width: barWidth,
                height: yBrushMax,
              },
              false,
            );
          } else {
            p1.addRect(
              {x: xPos, y: 0, width: barWidth, height: yBrushMax},
              false,
            );
          }
          p1.addRect(
            {
              x: prevBounds.x + prevBounds.width,
              y: 0,
              width: -barWidth,
              height: yBrushMax,
            },
            false,
          );
          outerPath.current = p1;
          const bounds = p1.getBounds();

          p2.addRect(
            {
              x: bounds.x + barWidth,
              y: 0,
              width: bounds.width - 2 * barWidth,
              height: yBrushMax,
            },
            false,
          );
          innerPath.current = p2;
        } else if (modeValue.current === modeType.RIGHT) {
          const prevBounds = outerPathPrev.current.getBounds();
          p1.addRect(
            {x: prevBounds.x, y: 0, width: barWidth, height: yBrushMax},
            false,
          );
          if (xPos <= prevBounds.x + minWidth) {
            p1.addRect(
              {
                x: prevBounds.x + minWidth,
                y: 0,
                width: -barWidth,
                height: yBrushMax,
              },
              false,
            );
          } else {
            p1.addRect(
              {x: xPos, y: 0, width: -barWidth, height: yBrushMax},
              false,
            );
          }
          outerPath.current = p1;
          const bounds = p1.getBounds();

          p2.addRect(
            {
              x: bounds.x + barWidth,
              y: 0,
              width: bounds.width - 2 * barWidth,
              height: yBrushMax,
            },
            false,
          );
          innerPath.current = p2;
        } else if (modeValue.current === modeType.MOVE) {
          const prevBounds = outerPathPrev.current.getBounds();

          const movePos = xPos - offsetPosition.current;
          if (prevBounds.width.toFixed(2) === xBrushMax.toFixed(2)) {
            return;
          }

          const x0 = Math.max(0, prevBounds.x + movePos);
          const x1 = Math.min(
            prevBounds.x + prevBounds.width + movePos,
            xBrushMax,
          );

          p1.addRect(
            {
              x: x1 === xBrushMax ? xBrushMax - prevBounds.width : x0,
              y: 0,
              width: barWidth,
              height: yBrushMax,
            },
            false,
          );
          p1.addRect(
            {
              x: x0 === 0 ? 0 + prevBounds.width : x1,
              y: 0,
              width: -barWidth,
              height: yBrushMax,
            },
            false,
          );
          outerPath.current = p1;

          const bounds = p1.getBounds();

          p2.addRect(
            {
              x: bounds.x + barWidth,
              y: 0,
              width: bounds.width - 2 * barWidth,
              height: yBrushMax,
            },
            false,
          );
          innerPath.current = p2;
        } else {
          return;
        }
        const value = [
          brushTimeScale.invert(p1.getBounds().x),
          brushTimeScale.invert(p1.getBounds().x + p1.getBounds().width),
        ];

        brushVal.current = value;
      },
      onEnd: ({x, y}) => {
        outerPathPrev.current = outerPath.current;
        let found = null;
        data.forEach(data => {
          const name = yAccessor(data);
          const barHeight = yScale.bandwidth();
          const barY = yScale(name) + margin.top;
          const xBar = timeScale.current(data.startDate) + margin.left;
          const barWidth = timeScale.current(data.endDate) - xBar + margin.left;
          if (
            x >= xBar &&
            x <= xBar + barWidth &&
            y >= barY &&
            y <= barY + barHeight
          ) {
            found = name;
          }
        });
        if (!found) {
          selected.current = null;
          return;
        }
        if (selected.current === found) {
          selected.current = null;
        } else {
          selected.current = found;
        }
        return;
      },
    },
    [timeScale],
  );

  return (
    <View style={{flexDirection: 'column'}}>
      <View style={{width, height}}>
        <Canvas style={{flex: 1}} onTouch={brushTouchHandler}>
          <Group
            clip={{
              x: 0,
              y: 0,
              width: xMax,
              height: height,
            }}
            transform={[{translateY: margin.top}, {translateX: margin.left}]}>
            {data.map((d, index) => {
              return (
                <AnimatedGanttBar
                  showbrushVal
                  key={index}
                  data={d}
                  timeScale={timeScale}
                  yScale={yScale}
                  yAccessor={yAccessor}
                  selected={selected}
                  moving={moving}
                />
              );
            })}
          </Group>
          <Group
            transform={[{translateY: margin.top}, {translateX: margin.left}]}>
            <Axis
              scale={yScale}
              orientation={Orientation.left}
              strokeColor={'grey'}
              brushValColor={'grey'}
              label={'Test'}
            />
            <AnimatedAxis
              moving={moving}
              scale={timeScale}
              top={yMax}
              orientation={Orientation.bottom}
              strokeColor={'grey'}
              brushValColor={'grey'}
              format={d => format(d, 'MM-dd')}
            />
          </Group>

          <Group
            transform={[
              {translateY: topChartHeight + topChartBottomMargin + margin.top},
              {translateX: brushMargin.left},
            ]}>
            {data.map((d, index) => {
              return (
                <GanttBar
                  key={index}
                  data={d}
                  timeScale={brushTimeScale}
                  yScale={brushYScale}
                  yAccessor={yAccessor}
                />
              );
            })}
            <Path path={outerPath} color="black" opacity={0.2}>
              <Paint
                color={'black'}
                strokeWidth={0.8}
                style="stroke"
                opacity={0.8}
              />
            </Path>
            <Path path={innerPath} color="black" opacity={0.2}>
              <Line2DPathEffect
                width={1.5}
                matrix={processTransform2d([
                  {scaleX: 8, scaleY: 8},
                  {rotate: 30},
                ])}
              />
              <Paint
                color={'black'}
                strokeWidth={0.8}
                style="stroke"
                opacity={0.8}
              />
            </Path>
          </Group>
        </Canvas>
      </View>
      <Text>{selected.current}</Text>
    </View>
  );
};

GanttChart.propTypes = {
  data: PropTypes.array,
  colors: PropTypes.array,
  width: PropTypes.number,
  height: PropTypes.number,
  offset: PropTypes.number,
  valueExtractor: PropTypes.func,
  nameExtractor: PropTypes.func,
  children: PropTypes.any,
};

export default GanttChart;
