import { encodeAsPixels } from '../utils/imageUtils';
import { CompiledPart } from './compiledPart';
import { CompilerContext, FloorIndexKey } from './compilerContext';

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

  static COMMENT(context: CompilerContext, index: number) {
    return new CompiledPart(context, `COMMENT ${index}`);
  }

  static DEFINE_COMMENT(context: CompilerContext, index: number, text: string) {
    const image = encodeAsPixels(text);

    return new CompiledPart(context, `DEFINE COMMENT ${index}\n${image};`);
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

  static ADD(context: CompilerContext) {
    const index = context.bindReservedRegisterKey();
    return new CompiledPart(context, `ADD ${index} --$${context.registerKey}`);
  }

  static SUB(context: CompilerContext) {
    const index = context.bindReservedRegisterKey();
    return new CompiledPart(context, `SUB ${index} --$${context.registerKey}`);
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
