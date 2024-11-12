import { CHARACTER_METADATA } from './characterEncoding';
import { CharacterMetadata } from './getCharacterMetadata';

/**
 * Gets metadata for each character of a phrase. If any metadata is missing (ie.
 * a character doesn't have an encoding) then an error is thrown detailing all
 * missing characters
 */
export const getPhraseMetadata = (phrase: string): CharacterMetadata[] => {
  const characterStrings = phrase.split('');

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
