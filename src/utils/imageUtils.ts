import zlib from 'zlib';
import c from 'chalk';

type Point = [x: number, y: number];
type Path = Point[];
type Pixel = [Point];

const HUMAN_RESOURCE_MACHINE_IMAGE_BUFFER_LENGTH = 1028;

const U_INT_32_BYTE_COUNT = 4 as const;
const U_INT_16_BYTE_COUNT = 2 as const;

const LENGTH_LENGTH = U_INT_32_BYTE_COUNT;
const VALUE_LENGTH = U_INT_16_BYTE_COUNT;
const POINT_LENGTH = U_INT_32_BYTE_COUNT;

// note: 0,0 is reserved for path delimiters
const MIN_VALUE = 1;

const MAX_VALUE = 2 ** 16 - 1;

const BRUSH_WIDTH = 2000;
const BRUSH_HEIGHT = 6000;

const PIXEL_COUNT_X = Math.floor((MAX_VALUE + 1) / BRUSH_WIDTH);
const PIXEL_COUNT_Y = Math.floor((MAX_VALUE + 1) / BRUSH_HEIGHT);

const PIXEL_GRID_WHITESPACE_X = MAX_VALUE - PIXEL_COUNT_X * BRUSH_WIDTH;
const PIXEL_GRID_LEFT_MARGIN = BRUSH_WIDTH / 2 + PIXEL_GRID_WHITESPACE_X / 2;
const PIXEL_GRID_WHITESPACE_Y = MAX_VALUE - PIXEL_COUNT_Y * BRUSH_HEIGHT;
const PIXEL_GRID_TOP_MARGIN = BRUSH_HEIGHT / 2 + PIXEL_GRID_WHITESPACE_Y / 2;
const PIXEL_GRID_CAP_HEIGHT = 7;
const PIXEL_GRID_DESCENDER_HEIGHT = 3;

const CORNER_DOT_PATHS: Pixel[] = [
  [[MIN_VALUE, MIN_VALUE]],
  [[MAX_VALUE, MIN_VALUE]],
  [[MAX_VALUE, MAX_VALUE]],
  [[MIN_VALUE, MAX_VALUE]],
];

const CORNER_PATHS: Path[] = [
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

const BORDER_PATHS: Path[] = [
  [
    [MIN_VALUE, MIN_VALUE],
    [MAX_VALUE, MIN_VALUE],
    [MAX_VALUE, MAX_VALUE],
    [MIN_VALUE, MAX_VALUE],
    [MIN_VALUE, MIN_VALUE],
  ],
];

const centerPixels = (pixels: Pixel[]): Pixel[] => {
  return pixels.map(([point]) => {
    return [
      [PIXEL_GRID_LEFT_MARGIN + point[0], PIXEL_GRID_TOP_MARGIN + point[1]],
    ];
  });
};

const truncatePixels = (pixels: Pixel[]): Pixel[] => {
  return pixels.filter(([point]) => {
    return point[0] <= MAX_VALUE && point[1] <= MAX_VALUE;
  });
};

const PIXEL_GRID_OUTLINE_PATHS: Pixel[] = truncatePixels(
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

type CharacterMetadata = {
  points: Point[];
  letterWidth: number;
  letterHeight: number;
  descenderHeight: number;
  hasDescender: boolean;
};

/**
 * See uses for example input. Takes a character template and produces the
 * smallest 2d array needed to hold the character template and surrounding empty
 * space. Uses the 2d array to produce x and y coordinates for each rendered
 * point of the character. These can be translated into a larger coordinate
 * space as needed.
 */
const getCharacterMetadata = (
  strings: TemplateStringsArray,
): CharacterMetadata => {
  const rawLines = strings.join('').split('\n');

  // trim leading lines
  rawLines.reverse();
  while (rawLines.at(-1)?.trim() === '') {
    rawLines.pop();
  }

  // trim trailing lines
  rawLines.reverse();
  while (rawLines.at(-1)?.trim() === '') {
    rawLines.pop();
  }

  const lines = [...rawLines];
  const nonEmptyLines = lines.filter((line) => line.trim() !== '');

  const startIndex = Math.min(
    ...nonEmptyLines.map((line) => {
      const leadingWhitespace = line.match(/^(\s*)/)?.[1] ?? '';
      return leadingWhitespace.length;
    }),
  );

  const letterWidth = Math.max(
    ...nonEmptyLines.map((line) => {
      return line.substring(startIndex).length;
    }),
  );

  const fullHeight = lines.length;
  const descenderIndex = lines.findIndex((line) => line.includes('_')) + 1;
  const hasDescender = descenderIndex > 0;
  const letterHeight = hasDescender ? descenderIndex : fullHeight;
  const descenderHeight = fullHeight - letterHeight;

  const normalizedLines = lines.map((line) => {
    const substring = line.substring(startIndex, startIndex + letterWidth);
    return substring.padEnd(letterWidth, ' ').split('');
  });

  const points = normalizedLines.flatMap((line, row) => {
    return line
      .map<Point | null>((cell, column) => {
        if (cell === ' ') {
          return null;
        }

        if (cell !== 'X' && cell !== '_') {
          throw new Error(`Unexpected character "${cell}"`);
        }

        const point: Point = [MIN_VALUE + column, MIN_VALUE + row];
        return point;
      })
      .filter((point): point is Point => point !== null);
  });

  return {
    points,
    letterWidth,
    letterHeight,
    descenderHeight,
    hasDescender,
  };
};

const cm = getCharacterMetadata;

const CHARACTER_METADATA: Record<string, CharacterMetadata> = {
  1: cm`
    X
   XX
    X
    X
    X
    X
   XXX
  `,
  2: cm`
    XX
   X  X
      X
     X
    X
   X
   XXXX
  `,
  ' ': {
    points: [],
    letterWidth: 1,
    letterHeight: 0,
    descenderHeight: 0,
    hasDescender: false,
  },
  '?': cm`
     XX
    X  X
       X
      X
     X

     X
  `,
  $: cm`
      X
     XXXX
    X X
     XXX
      X X
    ____
      X
  `,
  a: cm`

    XX
      X
    XXX
   X  X
   X  X
    XXX
  `,
  b: cm`
   X
   X
   X
   XXX
   X  X
   X  X
   XXX
  `,
  c: cm`
    XX
   X  X
   X
   X  X
    XX
  `,
  d: cm`
      X
      X
      X
    XXX
   X  X
   X  X
    XXX
  `,
  e: cm`
    XX
   X  X
   XXXX
   X
    XXX
  `,
  f: cm`
    XX
   X  X
   X
   XXX
   X
   X
   X
  `,
  g: cm`
    XXX
   X  X
   X  X
    XXX
      _
      X
    XX
  `,
  i: cm`
    X


    X
    X
    X
  `,
  o: cm`
    XX
   X  X
   X  X
   X  X
    XX
  `,
  p: cm`
    XX
   X  X
   X  X
   XXX
   _
   X
   X
  `,
  l: cm`
   X
   X
   X
   X
   X
   X
    X

  `,
  m: cm`
    XXXX
    X X X
    X X X
    X X X
    X X X
  `,
  n: cm`
    XXX
    X  X
    X  X
    X  X
    X  X
  `,
  q: cm`
    XX
   X  X
   X  X
   X  X
    ___
      X
      X
  `,
  r: cm`
    X XX
    XX
    X
    X
    X
  `,
  s: cm`
    XXX
   X
    XX
      X
   XXX
  `,
  t: cm`
     X
     X
    XXXX
     X
     X X
      X
  `,
  u: cm`
    X  X
    X  X
    X  X
    X  X
     XXX
  `,
  v: cm`
    X   X
    X   X
    X   X
     X X
      X
  `,
  z: cm`
    XXXX
       X
     XX
    X
    XXXX
  `,
};

const getTextMetadata = (text: string): CharacterMetadata[] => {
  const characterStrings = text.split('');

  const characters: CharacterMetadata[] = [];
  const missingCharacters: string[] = [];

  characterStrings.forEach((character) => {
    const localPoints = CHARACTER_METADATA[character];

    if (localPoints !== undefined) {
      characters.push(localPoints);
    } else {
      missingCharacters.push(character);
    }

    return localPoints;
  });

  if (missingCharacters.length > 0) {
    const uniqueSortedCharacters = [...new Set(missingCharacters)].sort();
    throw new Error(
      `Some character images are not implemented: ${uniqueSortedCharacters.join(',')}`,
    );
  }

  return characters;
};

export enum PixelImageAlignment {
  Left = 'Left',
  Center = 'Center',
}

const getCharacterPixels = (
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

export const encodeAsPixels = (
  text: string,
  alignment: PixelImageAlignment,
) => {
  const textMetadata = getTextMetadata(text);
  const uncenteredPixels = getCharacterPixels(textMetadata, alignment);
  const centeredPixels = centerPixels(uncenteredPixels);
  const truncatedPixels = truncatePixels(centeredPixels);

  if (truncatedPixels.length !== centeredPixels.length) {
    console.warn(c.yellow(`Comment "${text}" was truncated`));
  }

  const image = encode([...CORNER_PATHS, ...truncatedPixels]);

  return image;
};
