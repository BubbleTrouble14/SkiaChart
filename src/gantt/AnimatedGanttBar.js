import {Group, Path, Skia, useComputedValue} from '@shopify/react-native-skia';
import React from 'react';
import PropTypes from 'prop-types';

const AnimatedGanttBar = ({data, timeScale, yScale, yAccessor, moving}) => {
  const typeface = Skia.FontMgr.RefDefault().matchFamilyStyle('serif');
  if (!typeface) {
    throw new Error('Helvetica not found');
  }
  const font = Skia.Font(typeface, 9);
  const barPath = useComputedValue(() => {
    const path = Skia.Path.Make();
    const name = yAccessor(data);
    const barHeight = yScale.bandwidth();
    const barY = yScale(name);
    const x = timeScale.current(data.startDate);
    const width = timeScale.current(data.endDate) - x;
    const rect = {
      x: x,
      y: barY,
      width: width,
      height: barHeight,
    };
    if (!moving.current) {
      if (width > 20) {
        const glyphs = font.getGlyphIDs(yAccessor(data).toString());
        const textWidth = font.getGlyphWidths(glyphs).reduce((a, b) => a + b);
        const textHeight = font.getSize();
        const textPath = Skia.Path.MakeFromText(
          yAccessor(data).toString(),
          x + width / 2 - textWidth / 2,
          barY + barHeight / 2 + textHeight / 2,
          font,
        );
        path.op(textPath, 2);
      }
    }
    path.addRect(rect);
    return path;
  }, [timeScale, moving]);

  return <Path path={barPath} color={'blue'} />;
};

AnimatedGanttBar.propTypes = {
  data: PropTypes.object,
  timeScale: PropTypes.object,
  yScale: PropTypes.func,
  yAccessor: PropTypes.func,
  moving: PropTypes.any,
};

export default AnimatedGanttBar;
