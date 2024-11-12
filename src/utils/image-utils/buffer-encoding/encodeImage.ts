import zlib from 'zlib';
import {
  Point,
  LENGTH_LENGTH,
  POINT_LENGTH,
  COORDINATE_LENGTH,
  Path,
  HUMAN_RESOURCE_MACHINE_IMAGE_BUFFER_LENGTH,
} from './bufferConstants';

/**
 * See "decodeImage" since this just does the reverse.
 */
export const encodeImage = (paths: Path[]) => {
  const outputPoints = paths.flatMap<Point>((path) => {
    return [...path, [0, 0]];
  });

  const unzippedBuffer = Buffer.alloc(
    HUMAN_RESOURCE_MACHINE_IMAGE_BUFFER_LENGTH,
    0,
  );
  unzippedBuffer.writeUInt32LE(outputPoints.length);
  outputPoints.forEach((point, index) => {
    const firstOffset = LENGTH_LENGTH + index * POINT_LENGTH;
    const secondOffset = firstOffset + COORDINATE_LENGTH;

    if (firstOffset < HUMAN_RESOURCE_MACHINE_IMAGE_BUFFER_LENGTH) {
      unzippedBuffer.writeUInt16LE(point[0], firstOffset);
      unzippedBuffer.writeUInt16LE(point[1], secondOffset);
    }
  });

  const zippedBuffer = zlib.deflateSync(unzippedBuffer);
  const base64Encoded = zippedBuffer.toString('base64');

  // I'm not actually sure why this is needed
  const encoded = base64Encoded.replaceAll('=', '+');

  return encoded;
};
