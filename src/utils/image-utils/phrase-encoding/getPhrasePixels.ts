import { Point } from '../buffer-encoding/bufferConstants';
import { CharacterMetadata } from '../pixel-encoding/getCharacterMetadata';
import {
  PIXEL_COUNT_X,
  BRUSH_WIDTH,
  BRUSH_HEIGHT,
  Pixel,
  PIXEL_GRID_CAP_HEIGHT,
} from '../pixel-encoding/pixel';
import { PixelImageAlignment } from './pixelImageAlignment';

/**
 * Gets all pixel data for a phrase accounting for the pixels of each letter,
 * the vertical alignment of each letter within the pixel space, the alignment
 * of the phrase, and the space between letters. "encodePhraseAsPixels" is
 * responsible for reporting when an image is truncated because some phrase
 * pixels do not fit in the pixel space.
 */
export const getPhrasePixels = (
  characters: CharacterMetadata[],
  alignment: PixelImageAlignment,
) => {
  const totalLetterWidth = characters.reduce(
    (sum, character) => sum + character.letterWidth,
    0,
  );
  const totalLetterSpacing = characters.length - 1;
  const textWidth = totalLetterWidth + totalLetterSpacing;
  const alignmentOffset =
    alignment === PixelImageAlignment.Left || PIXEL_COUNT_X - textWidth < 0
      ? 0
      : Math.floor((PIXEL_COUNT_X - textWidth) / 2);

  let accumulatedPixelWidth: number = 0;
  const pixels = characters.flatMap((character, index) => {
    const adjustedPoints = character.points.map((point) => {
      const accumulatedLetterSpacing = index;
      const letterHeightOffset = PIXEL_GRID_CAP_HEIGHT - character.letterHeight;

      const adjustedPoint: Point = [
        (alignmentOffset +
          accumulatedPixelWidth +
          accumulatedLetterSpacing +
          point[0]) *
          BRUSH_WIDTH,
        (letterHeightOffset + point[1]) * BRUSH_HEIGHT,
      ];
      return adjustedPoint;
    });

    accumulatedPixelWidth += character.letterWidth;

    const paths: Pixel[] = adjustedPoints.map((point) => [point]);
    return paths;
  });

  return pixels;
};
