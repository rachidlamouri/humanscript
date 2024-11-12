/**
 * Label and comment images are encoded as a list of x,y coordinates delimited by
 * points containing the coordinates 0,0.
 */
export type Point = [xCoordinate: number, yCoordinate: number];

/**
 * The 0,0 points in an encoded image delimit paths. Each path represents a stroke
 * through a series of one or more points. An empty path is not rendered.
 */
export type Path = Point[];

export const HUMAN_RESOURCE_MACHINE_IMAGE_BUFFER_LENGTH = 1028;

const U_INT_32_BYTE_COUNT = 4 as const;
const U_INT_16_BYTE_COUNT = 2 as const;

/**
 * The first four bytes of an image buffer describe the "length" of the image
 * (ie. the number of points)
 */
export const LENGTH_LENGTH = U_INT_32_BYTE_COUNT;
export const COORDINATE_LENGTH = U_INT_16_BYTE_COUNT;
export const POINT_LENGTH = U_INT_32_BYTE_COUNT;

/** @note 0,0 is reserved for path delimiters */
export const MIN_VALUE = 1;

/** Coordinates are 16 bits */
export const MAX_VALUE = 2 ** 16 - 1;
