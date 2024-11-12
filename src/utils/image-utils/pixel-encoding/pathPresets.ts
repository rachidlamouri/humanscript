/**
 * @file These paths are utils for understanding the vector space and pixel
 * space of in-game images. You can run them through "encodeImage" and create a
 * hassembly code file that contains at least one in-game operation (eg. INBOX)
 * and a "DEFINE LABEL n" statement. Search "DEFINE LABEL" in "programs/" for
 * examples. Paste the hassembly code into any level with a floor to see the
 * rendered floor label.
 */

import {
  MAX_VALUE,
  MIN_VALUE,
  Path,
  Point,
} from '../buffer-encoding/bufferConstants';
import {
  BRUSH_WIDTH,
  BRUSH_HEIGHT,
  Pixel,
  centerPixels,
  truncatePixels,
  PIXEL_COUNT_X,
  PIXEL_COUNT_Y,
} from './pixel';

/**
 * Draws a dot in each corner to help visualize the full image space.
 */
export const CORNER_DOT_PATHS: Pixel[] = [
  [[MIN_VALUE, MIN_VALUE]],
  [[MAX_VALUE, MIN_VALUE]],
  [[MAX_VALUE, MAX_VALUE]],
  [[MIN_VALUE, MAX_VALUE]],
];

/**
 * Draws a partial border that just covers the corners. This is used by the
 * compiler to make sure all labels and comments are the same size. Plus it looks
 * pretty.
 */
export const CORNER_PATHS: Path[] = [
  [
    [MIN_VALUE, BRUSH_HEIGHT],
    [MIN_VALUE, MIN_VALUE],
    [BRUSH_WIDTH, MIN_VALUE],
  ],
  [
    [MAX_VALUE - BRUSH_WIDTH, MIN_VALUE],
    [MAX_VALUE, MIN_VALUE],
    [MAX_VALUE, BRUSH_HEIGHT],
  ],
  [
    [MAX_VALUE - BRUSH_WIDTH, MAX_VALUE],
    [MAX_VALUE, MAX_VALUE],
    [MAX_VALUE, MAX_VALUE - BRUSH_HEIGHT],
  ],
  [
    [MIN_VALUE, MAX_VALUE - BRUSH_HEIGHT],
    [MIN_VALUE, MAX_VALUE],
    [MIN_VALUE + BRUSH_WIDTH, MAX_VALUE],
  ],
];

/**
 * Draws a full border. This one has a great personality.
 */
export const BORDER_PATHS: Path[] = [
  [
    [MIN_VALUE, MIN_VALUE],
    [MAX_VALUE, MIN_VALUE],
    [MAX_VALUE, MAX_VALUE],
    [MIN_VALUE, MAX_VALUE],
    [MIN_VALUE, MIN_VALUE],
  ],
];

/**
 * Renders the border pixels of the pixel space to help visualize the available space.
 */
export const PIXEL_GRID_OUTLINE_PATHS: Pixel[] = truncatePixels(
  centerPixels(
    Array.from({ length: PIXEL_COUNT_X })
      .flatMap((_, xIndex) => {
        return Array.from({ length: PIXEL_COUNT_Y }).map<Point>((_, yIndex) => {
          return [xIndex, yIndex];
        });
      })
      .filter(
        (point) =>
          point[0] === 0 ||
          point[0] === PIXEL_COUNT_X - 1 ||
          point[1] === 0 ||
          point[1] === PIXEL_COUNT_Y - 1,
      )
      .map((point) => {
        return [point];
      }),
  ),
);
