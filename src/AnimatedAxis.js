import {Group, Path, Skia, useComputedValue} from '@shopify/react-native-skia';
// import {format} from 'date-fns';
import React from 'react';
import Orientation from './Constants';

const AnimatedAxis = ({
  scale,
  top = 0,
  left = 0,
  tickLength = 8,
  strokeWidth = 1,
  strokeColor = 'black',
  textColor = 'black',
  labelOffset = 8,
  label,
  format,
  tickLabelOffset = 4,
  labelRotation = 45,
  hideZero = false,
  numTicks = 6,
  orientation = Orientation.left,
  moving,
}) => {
  if (!scale.current) {
    throw new Error('No scale.current set !');
  }
  const typeface = Skia.FontMgr.RefDefault().matchFamilyStyle('serif');
  if (!typeface) {
    throw new Error('Helvetica not found');
  }
  const font = Skia.Font(typeface, 9);

  const axisPath = useComputedValue(() => {
    const isVertical =
      orientation === Orientation.left || orientation === Orientation.right;
    let width = scale.current.range()[1];
    const data = scale.current.domain();
    const path = Skia.Path.Make();

    const lineRect = {
      x: left,
      y: top,
      width: isVertical ? strokeWidth : width,
      height: isVertical ? width : strokeWidth,
    };

    path.addRect(lineRect);

    if ('bandwidth' in scale.current) {
      data.forEach(d => {
        const barX = scale.current(d);

        let labelX, labelY, rect;
        if (isVertical) {
          rect = {
            x: left,
            y: barX + scale.current.bandwidth() / 2 - strokeWidth / 2,
            width: orientation === Orientation.left ? -tickLength : tickLength,
            height: strokeWidth,
          };
          path.addRect(rect);
        } else {
          rect = {
            x: barX + scale.current.bandwidth() / 2 - strokeWidth / 2,
            y: top,
            width: strokeWidth,
            height: orientation === Orientation.top ? -tickLength : tickLength,
          };
          path.addRect(rect);
          if (moving.current) {
            return;
          }
          const text = format ? format(d) : d.toString();
          const glyphs = font.getGlyphIDs(text);
          const textWidth = font.getGlyphWidths(glyphs).reduce((a, b) => a + b);
          const textHeight = font.getSize();
          if (isVertical) {
            labelX =
              orientation === Orientation.left
                ? -tickLength - textWidth - tickLabelOffset
                : left + tickLabelOffset + tickLength;
            labelY = barX + textHeight / 2;
          } else {
            labelX = barX - textWidth / 2;
            labelY =
              orientation === Orientation.top
                ? top - tickLength - tickLabelOffset
                : top + tickLength + textHeight + tickLabelOffset;
          }
          const textPath = Skia.Path.MakeFromText(text, labelX, labelY, font);
          path.op(textPath, 2);
        }
      });
    } else {
      scale.current.ticks(numTicks).forEach(d => {
        const barX = scale.current(d);

        let labelX, labelY, rect;
        if (isVertical) {
          rect = {
            x: left,
            y: barX,
            width: orientation === Orientation.left ? -tickLength : tickLength,
            height: strokeWidth,
          };
        } else {
          rect = {
            x: barX,
            y: top,
            width: strokeWidth,
            height: orientation === Orientation.top ? -tickLength : tickLength,
          };
        }
        path.addRect(rect);
        if (moving.current) {
          return;
        }
        const text = format ? format(d) : d.toString();
        const glyphs = font.getGlyphIDs(text);
        const textWidth = font.getGlyphWidths(glyphs).reduce((a, b) => a + b);
        const textHeight = font.getSize();
        if (isVertical) {
          labelX =
            orientation === Orientation.left
              ? -tickLength - textWidth - tickLabelOffset
              : left + tickLabelOffset + tickLength;
          labelY = barX + textHeight / 2;
        } else {
          labelX = barX - textWidth / 2;
          labelY =
            orientation === Orientation.top
              ? top - tickLength - tickLabelOffset
              : top + tickLength + textHeight + tickLabelOffset;
        }
        const textPath = Skia.Path.MakeFromText(text, labelX, labelY, font);
        path.op(textPath, 2);
      });
    }
    return path;
  }, [scale, moving]);

  return <Path path={axisPath} color={'grey'} />;
};

export default AnimatedAxis;
