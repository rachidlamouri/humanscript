import zlib from 'zlib';

const HUMAN_RESOURCE_MACHINE_IMAGE_BUFFER_LENGTH = 1028;

const U_INT_32_BYTE_COUNT = 4 as const;
const U_INT_16_BYTE_COUNT = 2 as const;

const LENGTH_LENGTH = U_INT_32_BYTE_COUNT;
const VALUE_LENGTH = U_INT_16_BYTE_COUNT;
const POINT_LENGTH = U_INT_32_BYTE_COUNT;

// note: 0,0 is reserved for path delimiters
const MIN_VALUE = 1;

const MAX_VALUE = 2 ** 16 - 1;

type Point = [x: number, y: number];
type Path = Point[];

export const decode = (base64Encoded: string) => {
  const zippedBuffer = Buffer.from(base64Encoded, 'base64');

  const unzippedBuffer = zlib.inflateSync(zippedBuffer);
  const length = unzippedBuffer.readUint32LE(0);

  const points = Array.from({ length }).map((_, index) => {
    const firstOffset = LENGTH_LENGTH + index * POINT_LENGTH;
    const secondOffset = firstOffset + VALUE_LENGTH;

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

export const encode = (paths: Path[]) => {
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
    const secondOffset = firstOffset + VALUE_LENGTH;

    if (firstOffset < HUMAN_RESOURCE_MACHINE_IMAGE_BUFFER_LENGTH) {
      unzippedBuffer.writeUInt16LE(point[0], firstOffset);
      unzippedBuffer.writeUInt16LE(point[1], secondOffset);
    }
  });

  const zippedBuffer = zlib.deflateSync(unzippedBuffer);
  const base64Encoded = zippedBuffer.toString('base64');
  const encoded = base64Encoded.replaceAll('=', '+');

  return encoded;
};
