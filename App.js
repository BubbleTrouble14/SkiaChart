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
  const {width} = useWindowDimensions();

  const isDarkMode = useColorScheme() === 'dark';
  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <GanttChart
        data={data}
        yAccessor={val => val.name}
        width={width}
        height={400}
      />
    </SafeAreaView>
  );
};

export default App;
