// import zlib from 'zlib';

// const HUMAN_RESOURCE_MACHINE_IMAGE_BUFFER_LENGTH = 1028;

// const U_INT_32_BYTE_COUNT = 4 as const;
// const U_INT_16_BYTE_COUNT = 2 as const;

// const LENGTH_LENGTH = U_INT_32_BYTE_COUNT;
// const VALUE_LENGTH = U_INT_16_BYTE_COUNT;
// const POINT_LENGTH = U_INT_32_BYTE_COUNT;

// const MAX_VALUE = 2 ** 16 - 1;

// type Point = [x: number, y: number];
// type Path = Point[];

// const decode = (base64Encoded: string) => {
//   const zippedBuffer = Buffer.from(base64Encoded, 'base64');

//   const unzippedBuffer = zlib.inflateSync(zippedBuffer);
//   const length = unzippedBuffer.readUint32LE(0);

//   const points = Array.from({ length }).map((_, index) => {
//     const firstOffset = LENGTH_LENGTH + index * POINT_LENGTH;
//     const secondOffset = firstOffset + VALUE_LENGTH;

//     const point: Point = [
//       unzippedBuffer.readUint16LE(firstOffset),
//       unzippedBuffer.readUint16LE(secondOffset),
//     ];

//     return point;
//   });

//   const chunkRanges = points
//     .map((point, pointIndex) => {
//       return point.every((value) => value === 0) ? pointIndex : null;
//     })
//     .filter((pointIndex): pointIndex is number => pointIndex !== null)
//     .map((zeroPointIndex, listIndex, list) => {
//       const previousListIndex = listIndex - 1;
//       const previousZeroPointIndex =
//         list[previousListIndex] !== undefined ? list[previousListIndex] + 1 : 0;

//       return [previousZeroPointIndex, zeroPointIndex];
//     });

//   const paths = chunkRanges.map(([start, end]) => points.slice(start, end));

//   return paths;
// };

// const encode = (paths: Path[]) => {
//   const outputPoints = paths.flatMap<Point>((path) => {
//     return [...path, [0, 0]];
//   });

//   // const totalPointLength = outputPoints.length * POINT_LENGTH;
//   // const outputLength = LENGTH_LENGTH + totalPointLength;

//   const unzippedBuffer = Buffer.alloc(
//     HUMAN_RESOURCE_MACHINE_IMAGE_BUFFER_LENGTH,
//     0,
//   );
//   unzippedBuffer.writeUInt32LE(outputPoints.length);
//   outputPoints.forEach((point, index) => {
//     const firstOffset = LENGTH_LENGTH + index * POINT_LENGTH;
//     const secondOffset = firstOffset + VALUE_LENGTH;

//     if (firstOffset < HUMAN_RESOURCE_MACHINE_IMAGE_BUFFER_LENGTH) {
//       unzippedBuffer.writeUInt16LE(point[0], firstOffset);
//       unzippedBuffer.writeUInt16LE(point[1], secondOffset);
//     }
//   });

//   const zippedBuffer = zlib.deflateSync(unzippedBuffer);
//   const base64Encoded = zippedBuffer.toString('base64');
//   const encoded = base64Encoded.replaceAll('=', '+');

//   return encoded;
// };

// // const x = [
// //   'eJxjYmBgsGfy4mAYBaNgFIxIAABXfACW',
// //   'eJxjYmBgyGHz+cQwCkbBKBiRAADI8gGz',
// //   'eJxjYmBg0P97mZthFIyCUTAiAQAxwAIN',
// //   'eJxjYmBgkPxt9ZphFIyCUTAiAQDsVAI8',
// // ];

// // x.forEach((q) => {
// //   const n = decode(q);
// //   n.forEach((path) => {
// //     path.forEach((point) => {
// //       console.log(point[0].toString(16), point[1].toString(16));
// //     });
// //   });
// // });

// // const decoded = decode(
// //   'eJxjY2BgCIoTqC+pXFY7a3pVQ+vSZbWh6/6VM4yCUTAKRgQAAK4HCkY',
// // );
// // console.log('DEC', decoded);
// // const encoded = encode(decoded);
// // console.log('ENC', encoded);
// // const redecoded = decode(encoded);
// // console.log('OOF', redecoded);

// // const x = [
// //   []
// // ]

// // -- HUMAN RESOURCE MACHINE PROGRAM --

// //     COMMENT  0
// //     COMMENT  1
// //     COMMENT  2
// //     COMMENT  3

// // DEFINE COMMENT 0
// // eJxjYmBgsGfy4mAYBaNgFIxIAABXfACW;

// // DEFINE COMMENT 1
// // eJxjYmBgyGHz+cQwCkbBKBiRAADI8gGz;

// // DEFINE COMMENT 2
// // eJxjYmBg0P97mZthFIyCUTAiAQAxwAIN;

// // DEFINE COMMENT 3
// // eJxjYmBgkPxt9ZphFIyCUTAiAQDsVAI8;

// console.log(decode('eJzjYGBgmM9wkAVIMaQwxP0E0RH/hH+BaK7/zQyjYBSMguENAPlFBxc'));

// // const x = encode([[[1, 0]], [[MAX_VALUE, 0]], [[MAX_VALUE, MAX_VALUE]]]);
// const BRUSH_WIDTH = 700;
// const n = BRUSH_WIDTH;
// const q = MAX_VALUE - BRUSH_WIDTH / 2;

// const bx = 2000;
// const by = 6000;

// const pixelX = Math.floor((MAX_VALUE + 1) / bx);
// const pixelY = Math.floor((MAX_VALUE + 1) / by);
// console.log({
//   MAX_VALUE,
//   pixelX,
//   pixelY,
// });

// const w: Record<string, Path[]> = {
//   A: [],
//   B: [],
//   C: [],
//   D: [],
//   E: [],
//   F: [],
//   G: [],
//   H: [],
//   I: [],
//   J: [],
//   K: [],
//   L: [],
//   M: [],
//   N: [],
//   O: [],
//   P: [],
//   Q: [],
//   R: [],
//   S: [],
//   T: [],
//   U: [],
//   V: [],
//   A: [],
//   A: [],
// };

// const poonts = Array.from({ length: pixelX })
//   .map((_, index) => index + 1)
//   .flatMap((xIndex) => {
//     // const point: Point = [xIndex * bx, by];
//     // const path: Path = [point];
//     // return path;
//     return Array.from({ length: pixelY })
//       .map((_, index) => index + 1)
//       .map((yIndex) => {
//         const isOnXEdge = xIndex === 1 || xIndex === pixelX;
//         const isOnYEdge = yIndex === 1 || yIndex === pixelY;

//         if (!isOnXEdge && !isOnYEdge) {
//           return null;
//         }

//         const point: Point = [xIndex * bx - bx / 2, yIndex * by - by / 2];
//         const path: Path = [point];
//         return path;
//       });
//   })
//   .filter((x) => x != null);

// console.log(poonts);

// const x = encode(poonts);

// const x = encode([
//   // [[1, by]],
//   // [[1, 1]],
//   [[1, 1]],
//   [[2000, 1]],
//   [[1, 6000]],
//   // [[1, 1]],
//   // [[MAX_VALUE, MAX_VALUE]],
//   // [
//   //   [n, n],
//   //   [q, n],
//   //   [q, q],
//   //   [n, q],
//   //   [n, n],
//   // ],
// ]);

// const y = `
//   COMMENT 0

// DEFINE COMMENT 0
// ${x};
// `;

// console.log(y);
