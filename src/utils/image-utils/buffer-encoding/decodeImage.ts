import zlib from 'zlib';
import {
  LENGTH_LENGTH,
  POINT_LENGTH,
  COORDINATE_LENGTH,
  Point,
} from './bufferConstants';

/**
 * Images are encoded as a base64 deflated buffer (ie. a series of bytes). The first
 * four bytes indicate the number of points in the image. A point consists of a 16
 * bit x coordinate and a 16 bit y coordinate. Points are then grouped into
 * paths by delimiting the flattened point array by any point containing the
 * coordinate 0,0.
 */
export const decodeImage = (base64Encoded: string) => {
  const zippedBuffer = Buffer.from(base64Encoded, 'base64');

  const unzippedBuffer = zlib.inflateSync(zippedBuffer);
  const length = unzippedBuffer.readUint32LE(0);

  const points = Array.from({ length }).map((_, index) => {
    const firstOffset = LENGTH_LENGTH + index * POINT_LENGTH;
    const secondOffset = firstOffset + COORDINATE_LENGTH;

    const point: Point = [
      unzippedBuffer.readUint16LE(firstOffset),
      unzippedBuffer.readUint16LE(secondOffset),
    ];

    return point;
  });

  const chunkRanges = points
    .map((point, pointIndex) => {
      return point.every((value) => value === 0) ? pointIndex : null;
    })
    .filter((pointIndex): pointIndex is number => pointIndex !== null)
    .map((zeroPointIndex, listIndex, list) => {
      const previousListIndex = listIndex - 1;
      const previousZeroPointIndex =
        list[previousListIndex] !== undefined ? list[previousListIndex] + 1 : 0;

      return [previousZeroPointIndex, zeroPointIndex];
    });

  const paths = chunkRanges.map(([start, end]) => points.slice(start, end));

  return paths;
};
