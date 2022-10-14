import {
  Canvas,
  Easing,
  Group,
  LinearGradient,
  mix,
  RoundedRect,
  runTiming,
  useComputedValue,
  vec,
} from '@shopify/react-native-skia';
import React from 'react';
import {StyleSheet, Text, TouchableWithoutFeedback, View} from 'react-native';

const buttonWidth = 50;
const styles = StyleSheet.create({
  root: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    alignItems: 'center',
  },
  container: {
    // backgroundColor: '#272636',
    borderRadius: 16,
    flexDirection: 'row',
  },
  button: {
    height: 48,
    width: buttonWidth,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
  },
  label: {
    fontFamily: 'Helvetica',
    fontSize: 16,
    color: 'black',
    textAlign: 'center',
  },
});

export const JellySelector = ({
  currentState,
  nextState,
  transition,
  jellyData,
  onPress,
}) => {
  const transform = useComputedValue(() => {
    return [
      {
        translateX: mix(
          transition.current,
          currentState.current * buttonWidth,
          nextState.current * buttonWidth,
        ),
      },
    ];
  }, [currentState, nextState, transition]);
  return (
    <View style={styles.root}>
      <View style={styles.container}>
        <Canvas style={StyleSheet.absoluteFill}>
          <Group transform={transform}>
            <RoundedRect
              x={0}
              y={0}
              height={48}
              width={buttonWidth}
              r={16}
              color="#e6e6e6"
            />
          </Group>
        </Canvas>
        {jellyData.map((item, index) => (
          <TouchableWithoutFeedback
            key={index}
            onPress={() => {
              onPress(index);
              currentState.current = nextState.current;
              nextState.current = index;
              transition.current = 0;
              runTiming(transition, 1, {
                duration: 200,
                easing: Easing.inOut(Easing.cubic),
              });
            }}>
            <View style={styles.button}>
              <Text style={styles.label}>{item.label}</Text>
            </View>
          </TouchableWithoutFeedback>
        ))}
      </View>
    </View>
  );
};
