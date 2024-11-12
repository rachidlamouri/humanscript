import c from 'chalk';
import { encodeImage } from '../buffer-encoding/encodeImage';
import { getPhraseMetadata } from '../pixel-encoding/getPhraseMetadata';
import { getPhrasePixels } from './getPhrasePixels';
import { CORNER_PATHS } from '../pixel-encoding/pathPresets';
import { centerPixels, truncatePixels } from '../pixel-encoding/pixel';
import { PixelImageAlignment } from './pixelImageAlignment';

/**
 * Abstracts encoding text from the rest of the project. Outputs a warning if
 * the pixel image was truncated, but doesn't error.
 */
export const encodePhraseAsPixels = (
  phrase: string,
  alignment: PixelImageAlignment,
) => {
  const textMetadata = getPhraseMetadata(phrase);
  const uncenteredPixels = getPhrasePixels(textMetadata, alignment);
  const centeredPixels = centerPixels(uncenteredPixels);
  const truncatedPixels = truncatePixels(centeredPixels);

  if (truncatedPixels.length !== centeredPixels.length) {
    console.warn(c.yellow(`Comment "${phrase}" was truncated`));
  }

  const image = encodeImage([...CORNER_PATHS, ...truncatedPixels]);

  return image;
};
