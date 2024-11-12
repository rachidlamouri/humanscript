import {
  encodePhraseAsPixels,
  PixelImageAlignment,
} from '../utils/image-utils';
import { CompiledPart } from './compiledPart';
import {
  CompilerContext,
  FloorBinding,
  FloorIndexKey,
  RegisterKey,
} from './compilerContext';

const formatImage = (encodedImage: string) => {
  const chunkSize = 60;
  const chunkCount = Math.ceil(encodedImage.length / chunkSize);

  const chunks = Array.from({ length: chunkCount }).map((_, index) => {
    const startIndex = index * chunkSize;
    return encodedImage.substring(startIndex, startIndex + chunkSize);
  });

  const serializedChunks = chunks.join('\n');

  return serializedChunks;
};

/**
 * Abstracts output formatting
 */
export class Assembly {
  static DEBUG(context: CompilerContext, text: string) {
    return new CompiledPart(context, `-- ${text}`);
  }

  static DEBUG_MAPPING(context: CompilerContext, key: FloorIndexKey) {
    return new CompiledPart(context, () => {
      let destination: string;
      if (context.floorBindingByKey.has(key)) {
        const index = context.getFloorIndex(key);
        destination = `floor[${index}]`;
      } else {
        destination = 'null';
      }

      return `-- ${key} -> ${destination}`;
    });
  }

  static HUMANSCRIPT_COMMENT(context: CompilerContext, text: string) {
    return new CompiledPart(context, `-- # ${text}`);
  }

  static COMMENT(context: CompilerContext, text: string, index: number) {
    return new CompiledPart(context, `COMMENT ${index} -- ## ${text}`);
  }

  static DEFINE_COMMENT(context: CompilerContext, index: number, text: string) {
    const encodedImage = encodePhraseAsPixels(text, PixelImageAlignment.Left);
    const serializedChunks = formatImage(encodedImage);

    return new CompiledPart(
      context,
      `-- ${text}\nDEFINE COMMENT ${index}\n${serializedChunks};`,
    );
  }

  static DEFINE_LABEL(context: CompilerContext, binding: FloorBinding) {
    const encodedImage = encodePhraseAsPixels(
      binding.label,
      PixelImageAlignment.Center,
    );
    const serializedChunks = formatImage(encodedImage);

    const description =
      binding.label === binding.key
        ? binding.label
        : `${binding.key} as ${binding.label}`;

    return new CompiledPart(
      context,
      `-- ${description}\nDEFINE LABEL ${binding.index}\n${serializedChunks};`,
    );
  }

  static LINE_FEED(context: CompilerContext) {
    return new CompiledPart(context, '');
  }

  static INBOX(context: CompilerContext) {
    return new CompiledPart(context, 'INBOX');
  }

  static OUTBOX(context: CompilerContext) {
    return new CompiledPart(context, 'OUTBOX');
  }

  static COPYFROM(context: CompilerContext, key: FloorIndexKey) {
    const index = context.getFloorIndex(key);
    return new CompiledPart(context, `COPYFROM ${index} --$${key}`);
  }

  static COPYFROM_REF(context: CompilerContext, key: FloorIndexKey) {
    const index = context.getFloorIndex(key);
    return new CompiledPart(context, `COPYFROM [${index}] --$floor[$${key}]`);
  }

  static COPYTO(context: CompilerContext, key: FloorIndexKey) {
    const index = context.getFloorIndex(key);
    return new CompiledPart(context, `COPYTO ${index} --$${key}`);
  }

  static COPYTO_REF(context: CompilerContext, key: FloorIndexKey) {
    const index = context.getFloorIndex(key);
    return new CompiledPart(context, `COPYTO [${index}] --$${key}`);
  }

  static ADD(context: CompilerContext, key: RegisterKey) {
    const index = context.getFloorIndex(key);
    return new CompiledPart(context, `ADD ${index} --$${key}`);
  }

  static SUB(context: CompilerContext, key: RegisterKey) {
    const index = context.getFloorIndex(key);
    return new CompiledPart(context, `SUB ${index} --$${key}`);
  }

  static BUMP_UP(context: CompilerContext, key: FloorIndexKey) {
    const index = context.getFloorIndex(key);
    return new CompiledPart(context, `BUMPUP ${index} --$${key}`);
  }

  static BUMP_DN(context: CompilerContext, key: FloorIndexKey) {
    const index = context.getFloorIndex(key);
    return new CompiledPart(context, `BUMPDN ${index} --$${key}`);
  }

  static ANCHOR(context: CompilerContext, anchorId: string) {
    return new CompiledPart(context, `${anchorId}:`);
  }

  static JUMP(context: CompilerContext, anchorId: string) {
    return new CompiledPart(context, `JUMP ${anchorId}`);
  }

  static JUMPZ(context: CompilerContext, anchorId: string) {
    return new CompiledPart(context, `JUMPZ ${anchorId}`);
  }

  static JUMPN(context: CompilerContext, anchorId: string) {
    return new CompiledPart(context, `JUMPN ${anchorId}`);
  }
}
