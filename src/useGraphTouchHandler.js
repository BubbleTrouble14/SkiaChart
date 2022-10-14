import {
  add,
  clamp,
  dist,
  runDecay,
  runSpring,
  useTouchHandler,
  useValue,
  vec,
} from '@shopify/react-native-skia';
import HapticFeedback from 'react-native-haptic-feedback';

export const useGraphTouchHandler = (
  x,
  y,
  xMax,
  width,
  margin,
  gestureActive,
  pathEnd,
) => {
  const translateY = margin.top;
  // const gestureActive = useValue(false);
  const offsetX = useValue(0);
  const onTouch = useTouchHandler({
    onStart: pos => {
      const normalizedCenter = add(
        vec(x.current, y.current),
        vec(0, translateY),
      );
      // if (dist(normalizedCenter, pos) < 50) {
      HapticFeedback.trigger('impactHeavy');
      gestureActive.current = true;
      offsetX.current = x.current - pos.x;
      // }
    },
    onActive: pos => {
      if (gestureActive.current) {
        const xPos = clamp(pos.x, 1, xMax - 1);
        x.current = xPos;
        pathEnd.current = xPos / width;
      }
    },
    onEnd: ({velocityX}) => {
      gestureActive.current = false;
      // if (gestureActive.current) {
      // runSpring(circleRadius, gestureActive ? 5 : 0, {
      //   mass: 1,
      //   stiffness: 1000,
      //   damping: 50,
      //   velocity: 0,
      // });
      // runDecay(x, {velocity: velocityX, clamp: [0, xMax]});
      // }
    },
  });
  return onTouch;
};
