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
    // TODO: generate image from "text"
    const placeholder =
      `eJzt0iGvglAchnG2W9iIlrMZKcxoYkSTM5Iw2iTasBGJxhNp0ojSjNBszkR0JOOZ8e7e5/0OFinvnnK2
H/vXnudNP13g/W8UsjZh/ZQtcnYq2cyyQ8vGPduMf9sFvNcFdDWjqxmdzelsTkchHYX0e0G/F/SwpIcl
bRPaJvR+Re9XdLyh4w3tp7Sf0o8t/djSzY5udnSR00VOrw/0+kCbI22O9FTq/5XyV/JX8p/kP8lv5bfy
1/LX8p/lP8vfyt/Kf5H/Iv9V/qv8vfy9/Df5b/Lf5b/LP8o/yv+U/yn/S/6X/E5+x70Yx70Yx70Yx70Y
x70Yx70Yx70Yx70Yx3vf77PfL0wlpvU`.replaceAll('\n', '');

    return new CompiledPart(
      context,
      `DEFINE COMMENT ${index}\n${placeholder};`,
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
