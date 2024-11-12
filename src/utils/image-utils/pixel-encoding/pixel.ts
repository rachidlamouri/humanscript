import { MAX_VALUE, Point } from '../buffer-encoding/bufferConstants';

/**
 * A "path" containing a single "point". See path and point types for more
 * details.
 */
export type Pixel = [Point];

/**
 * The approximate width of a single pixel. The full range of encoded width
 * values is 1 to MAX_VALUE. The image width is longer than the image height so
 * this value is smaller than BRUSH_HEIGHT.
 */
export const BRUSH_WIDTH = 2000;

/**
 * The approximate height of a single pixel. The full range of encoded height
 * values is 1 to MAX_VALUE (the same range as the image width). The image width
 * is longer than the image height so this value is larger than BRUSH_WIDTH.
 */
export const BRUSH_HEIGHT = 6000;

/**
 * 32
 */
export const PIXEL_COUNT_X = Math.floor((MAX_VALUE + 1) / BRUSH_WIDTH);

/**
 * 10
 */
export const PIXEL_COUNT_Y = Math.floor((MAX_VALUE + 1) / BRUSH_HEIGHT);

const PIXEL_GRID_WHITESPACE_X = MAX_VALUE - PIXEL_COUNT_X * BRUSH_WIDTH;
const PIXEL_GRID_LEFT_MARGIN = BRUSH_WIDTH / 2 + PIXEL_GRID_WHITESPACE_X / 2;
const PIXEL_GRID_WHITESPACE_Y = MAX_VALUE - PIXEL_COUNT_Y * BRUSH_HEIGHT;
const PIXEL_GRID_TOP_MARGIN = BRUSH_HEIGHT / 2 + PIXEL_GRID_WHITESPACE_Y / 2;

/** Cap height is a typography concept */
export const PIXEL_GRID_CAP_HEIGHT = 7;

/** Descender height is a typography concept */
const PIXEL_GRID_DESCENDER_HEIGHT = 3;

/**
 * Adjusts the pixel space to be centered in the image, since the image canvas
 * size isn't a perfect multiple of the number of pixels.
 */
export const centerPixels = (pixels: Pixel[]): Pixel[] => {
  return pixels.map(([point]) => {
    return [
      [PIXEL_GRID_LEFT_MARGIN + point[0], PIXEL_GRID_TOP_MARGIN + point[1]],
    ];
  });
};

/**
 * Removes points whose coordinates fall outside of the pixel space allowing an
 * image to be rendered without erroring. "encodePhraseAsPixels" is responsible
 * for reporting when an image is truncated.
 */
export const truncatePixels = (pixels: Pixel[]): Pixel[] => {
  return pixels.filter(([point]) => {
    return point[0] <= MAX_VALUE && point[1] <= MAX_VALUE;
  });
};
