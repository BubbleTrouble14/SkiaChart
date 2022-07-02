/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React from 'react';
import {LogBox, SafeAreaView, StatusBar, useColorScheme} from 'react-native';
import {Colors} from 'react-native/Libraries/NewAppScreen';
import useWindowDimensions from 'react-native/Libraries/Utilities/useWindowDimensions';
import {useState} from 'react/cjs/react.development';
import data from './src/Data';
import GanttChart from './src/gantt/GanttChart';

LogBox.ignoreLogs(['Require cycle:']);

const App = () => {
  const [selected, setSelected] = useState();
  const {width} = useWindowDimensions();

  const isDarkMode = useColorScheme() === 'dark';
  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  const height = 400;
  const margin = {top: 20, right: 20, bottom: 20, left: 40};
  const yMax = height - margin.bottom - margin.top;
  const xMax = width - margin.left - margin.right;

  // const data = [
  //   {
  //     value: 2,
  //     name: 'Apples',
  //     startDate: new Date('2022-05-14T13:41:35.909Z'),
  //     endDate: new Date('2022-06-14T13:41:35.909Z'),
  //     color: '#377eb8',
  //   },
  //   {
  //     value: 4,
  //     name: 'Pears',
  //     startDate: new Date('2022-04-14T13:41:35.909Z'),
  //     endDate: new Date('2022-05-18T13:41:35.909Z'),
  //     color: '#ff7f00',
  //   },
  //   {
  //     value: 7,
  //     name: 'Grapes',
  //     startDate: new Date('2022-02-12T13:41:35.909Z'),
  //     endDate: new Date('2022-04-14T13:41:35.909Z'),
  //     color: '#e41a1c',
  //   },
  //   {
  //     value: 4,
  //     name: 'Test',
  //     startDate: new Date('2022-02-14T13:41:35.909Z'),
  //     endDate: new Date('2022-03-14T13:41:35.909Z'),
  //     color: '#ff7f00',
  //   },
  //   {
  //     value: 3,
  //     name: 'Banannas',
  //     startDate: new Date('2022-02-14T13:41:35.909Z'),
  //     endDate: new Date('2022-03-08T13:41:35.909Z'),
  //     color: '#4daf4a',
  //   },
  //   {
  //     value: 7,
  //     name: 'Oranges',
  //     startDate: new Date('2022-01-14T13:41:35.909Z'),
  //     endDate: new Date('2022-02-14T13:41:35.909Z'),
  //     color: '#984ea3',
  //   },
  //   {
  //     value: 2,
  //     name: 'Strawberries',
  //     startDate: new Date('2022-03-14T13:41:35.909Z'),
  //     endDate: new Date('2022-04-14T13:41:35.909Z'),
  //     color: '#377eb8',
  //   },
  //   {
  //     value: 4,
  //     name: 'Kiwis',
  //     startDate: new Date('2022-02-14T13:41:35.909Z'),
  //     endDate: new Date('2022-03-14T13:41:35.909Z'),
  //     color: '#ff7f00',
  //   },
  //   {
  //     value: 7,
  //     name: 'Watermelons',
  //     startDate: new Date('2022-01-14T13:41:35.909Z'),
  //     endDate: new Date('2022-02-13T09:40:35.909Z'),
  //     color: '#e41a1c',
  //   },
  //   {
  //     value: 4,
  //     name: 'egg',
  //     startDate: new Date('2022-02-14T13:41:35.909Z'),
  //     endDate: new Date('2022-03-14T13:41:35.909Z'),
  //     color: '#377eb8',
  //   },
  //   {
  //     value: 7,
  //     name: 'test',
  //     startDate: new Date('2022-01-14T13:41:35.909Z'),
  //     endDate: new Date('2022-02-13T09:40:35.909Z'),
  //     color: '#e41a1c',
  //   },
  // ];

  console.log(data);

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <GanttChart
        data={data}
        // yAccessor={val => val.name}
        // xAccessor={val => val.duration}
        yAccessor={val => val.name}
        width={width}
        height={400}
      />
    </SafeAreaView>
  );
};

export default App;
