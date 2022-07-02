import React from 'react';
import {useMemo} from 'react';
import {Path, Skia} from '@shopify/react-native-skia';
import PropTypes from 'prop-types';
const GanttBar = ({data, timeScale, yScale, yAccessor, showText = false}) => {
  const typeface = Skia.FontMgr.RefDefault().matchFamilyStyle('serif');
  if (!typeface) {
    throw new Error('Helvetica not found');
  }
  const font = Skia.Font(typeface, 9);
  const barPath = useMemo(() => {
    const path = Skia.Path.Make();
    const name = yAccessor(data);
    const barHeight = yScale.bandwidth();
    const barY = yScale(name);
    const x = timeScale(data.startDate);
    const width = timeScale(data.endDate) - x;
    const rect = {
      x: x,
      y: barY,
      width: width,
      height: barHeight,
    };
    if (showText) {
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
    path.addRect(rect);
    return path;
  }, [data, font, showText, timeScale, yAccessor, yScale]);

  return <Path path={barPath} color={'blue'} />;
};

GanttBar.propTypes = {
  data: PropTypes.object,
  timeScale: PropTypes.func,
  yScale: PropTypes.func,
  yAccessor: PropTypes.func,
  showText: PropTypes.bool,
};

export default GanttBar;
