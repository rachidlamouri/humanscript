import { encodeAsPixels } from '../utils/imageUtils';
import { CompiledPart } from './compiledPart';
import { CompilerContext, FloorIndexKey, RegisterKey } from './compilerContext';

type RegisterConfig = {
  useAccumulator: boolean;
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
      if (context.floorIndexByKey.has(key)) {
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
    const encodedImage = encodeAsPixels(text);

    const chunkSize = 60;
    const chunkCount = Math.ceil(encodedImage.length / chunkSize);

    const chunks = Array.from({ length: chunkCount }).map((_, index) => {
      const startIndex = index * chunkSize;
      return encodedImage.substring(startIndex, startIndex + chunkSize);
    });

    const serializedChunks = chunks.join('\n');

    return new CompiledPart(
      context,
      `DEFINE COMMENT ${index}\n${serializedChunks};`,
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

  static COPYTO(context: CompilerContext, key: FloorIndexKey) {
    const index = context.getFloorIndex(key);
    return new CompiledPart(context, `COPYTO ${index} --$${key}`);
  }

  static ADD(context: CompilerContext, key: RegisterKey) {
    const index = context.bindReservedRegisterKey(key);
    return new CompiledPart(context, `ADD ${index} --$${key}`);
  }

  static SUB(context: CompilerContext, key: RegisterKey) {
    const index = context.bindReservedRegisterKey(key);
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

  static LABEL(context: CompilerContext, label: string) {
    return new CompiledPart(context, `${label}:`);
  }

  static JUMP(context: CompilerContext, label: string) {
    return new CompiledPart(context, `JUMP ${label}`);
  }

  static JUMPZ(context: CompilerContext, label: string) {
    return new CompiledPart(context, `JUMPZ ${label}`);
  }

  static JUMPN(context: CompilerContext, label: string) {
    return new CompiledPart(context, `JUMPN ${label}`);
  }
}
