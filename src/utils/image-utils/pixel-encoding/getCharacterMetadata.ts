import { MIN_VALUE, Point } from '../buffer-encoding/bufferConstants';

export type CharacterMetadata = {
  points: Point[];
  letterWidth: number;
  letterHeight: number;
  descenderHeight: number;
  hasDescender: boolean;
};

/**
 * See uses for example input. Takes a character template and produces the
 * smallest 2d array needed to contain the entire character (ex: the question
 * mark character fits in a 4 by 7 array). Uses the 2d array to produce x and y coordinates for
 * each rendered point of the character. These points can be translated into a
 * larger coordinate space as needed.
 */
export const getCharacterMetadata = (
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
