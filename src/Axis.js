import {Path, Skia} from '@shopify/react-native-skia';
import React, {useMemo} from 'react';
import Orientation from './Constants';

const Axis = ({
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
}) => {
  if (!scale) {
    throw new Error('No scale set !');
  }
  const typeface = Skia.FontMgr.RefDefault().matchFamilyStyle('serif');
  if (!typeface) {
    throw new Error('Helvetica not found');
  }
  const font = Skia.Font(typeface, 9);

  const axisPath = useMemo(() => {
    const isVertical =
      orientation === Orientation.left || orientation === Orientation.right;
    let width = scale.range()[1];
    const data = scale.domain();
    const path = Skia.Path.Make();

    const lineRect = {
      x: left,
      y: top,
      width: isVertical ? strokeWidth : width,
      height: isVertical ? width : strokeWidth,
    };

    path.addRect(lineRect);

    if ('bandwidth' in scale) {
      data.forEach(d => {
        const barX = scale(d);

        let labelX, labelY, rect;
        if (isVertical) {
          rect = {
            x: left,
            y: barX + scale.bandwidth() / 2 - strokeWidth / 2,
            width: orientation === Orientation.left ? -tickLength : tickLength,
            height: strokeWidth,
          };
          path.addRect(rect);
        } else {
          rect = {
            x: barX + scale.bandwidth() / 2 - strokeWidth / 2,
            y: top,
            width: strokeWidth,
            height: orientation === Orientation.top ? -tickLength : tickLength,
          };
          path.addRect(rect);
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
    } else {
      scale.ticks(numTicks).forEach(d => {
        const barX = scale(d);

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
  }, [
    orientation,
    scale,
    left,
    top,
    strokeWidth,
    tickLength,
    format,
    font,
    tickLabelOffset,
    numTicks,
  ]);

  return <Path path={axisPath} color={'grey'} />;
};

export default Axis;
