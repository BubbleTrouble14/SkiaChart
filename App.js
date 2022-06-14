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
  Path,
  Skia,
  useTouchHandler,
} from '@shopify/react-native-skia';
import {max, scaleBand, scaleLinear} from 'd3';
import React from 'react';
import {SafeAreaView, StatusBar, useColorScheme, View} from 'react-native';
import {Colors} from 'react-native/Libraries/NewAppScreen';
import {useState} from 'react/cjs/react.development';

const insideBounds = (rect, x, y) => {
  return (
    x >= rect.x &&
    x <= rect.x + rect.width &&
    y >= rect.y &&
    y <= rect.y + rect.height
  );
};

const App = () => {
  const [selected, setSelected] = useState();

  const isDarkMode = useColorScheme() === 'dark';
  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  const height = 400;
  const width = 300;
  const margin = {top: 20, right: 20, bottom: 20, left: 40};
  const yMax = height - margin.bottom - margin.top;
  const xMax = width - margin.left - margin.right;

  const data = [
    {value: 2, name: 'Apples'},
    {value: 1, name: 'Pears'},
    {value: 7, name: 'Grapes'},
    {value: 4, name: 'Banannas'},
    {value: 7, name: 'Oranges'},
    {value: 3, name: 'Cherrys'},
    {value: 3, name: 'Avocados'},
  ];

  const xScale = scaleBand()
    .domain(data.map(val => val.name))
    .range([0, xMax])
    .paddingInner(0.2)
    .paddingOuter(0.2)
    .round(false);

  const yScale = scaleLinear()
    .domain([0, max(data, d => d.value)])
    .range([yMax, 0])
    .nice();

  const touchHandler = useTouchHandler({
    onStart: ({x, y}) => {
      data.forEach(d => {
        const name = d.name;
        const barWidth = xScale.bandwidth();
        const barHeight = yMax - (yScale(d.value) ?? 0);
        const barX = xScale(name);
        const barY = yMax - barHeight;
        const rect = {
          x: barX + margin.left,
          y: barY + margin.top,
          width: barWidth,
          height: barHeight,
        };
        if (insideBounds(rect, x, y)) {
          setSelected(d);
        }
      });
    },
  });

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <View style={{width, height}}>
        <Canvas style={{flex: 1}} onTouch={touchHandler}>
          <Group
            origin={{x: 128, y: 128}}
            transform={[{translateY: margin.top}, {translateX: margin.left}]}>
            {data.map((d, index) => {
              const path = Skia.Path.Make();
              const name = d.name;
              const barWidth = xScale.bandwidth();
              const barHeight = yMax - (yScale(d.value) ?? 0);
              const barX = xScale(name);
              const barY = yMax - barHeight;
              const rect = {
                x: barX,
                y: barY,
                width: barWidth,
                height: barHeight,
              };
              path.addRect(rect, false);
              path.close();
              return (
                <Path
                  key={`bar-${name}`}
                  path={path}
                  color={selected?.name === name ? 'red' : 'green'}
                />
              );
            })}
          </Group>
        </Canvas>
      </View>
    </SafeAreaView>
  );
};

export default App;
