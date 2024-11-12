import {
  CharacterMetadata,
  getCharacterMetadata as cm,
} from './getCharacterMetadata';

/**
 * @important Add character pixel encoding information here!
 *
 * See "getCharacterMetadata" for
 * more info on how character templates are parsed. Underscores denote where the
 * baseline of the character should be rendered. The baseline defaults to the
 * bottom of the character.
 *
 * @note Pull requests are welcome for missing character encodings!
 */
export const CHARACTER_METADATA: Record<string, CharacterMetadata> = {
  0: cm`
     XXX
    X   X
    X  XX
    X X X
    XX  X
    X   X
     XXX
  `,
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
  8: cm`
    XX
   X  X
   X  X
    XX
   X  X
   X  X
    XX
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
  '!': cm`
    X
    X
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
  h: cm`
    X
    X
    X
    XXX
    X  X
    X  X
  `,
  i: cm`
    X


    X
    X
    X
  `,
  j: cm`
      X

      X
      X
      X
      X
    X X
     X
  `,
  k: cm`
    X
    X  X
    X  X
    XXX
    X  X
    X  X
    X  X
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
  w: cm`
    X   X
    X   X
    X X X
    X X X
     X X
  `,
  x: cm`
    X  X
    X  X
     XX
    X  X
    X  X
  `,
  y: cm`
    X  X
    X  X
    X  X
     XXX
       X
       X
     XX
  `,
  z: cm`
    XXXX
       X
     XX
    X
    XXXX
  `,
};
