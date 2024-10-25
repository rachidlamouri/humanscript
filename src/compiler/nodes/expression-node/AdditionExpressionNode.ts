import { CompilerContext } from '../../compilerContext';
import { Compiled } from '../interfaces/compilable';
import { ReadableExpression } from '../interfaces/readableExpression';
import { ReadableReference } from '../interfaces/readableReference';
4;
import { Node } from '../node';

export class AdditionExpressionNode extends Node implements ReadableExpression {
  constructor(
    public left: ReadableReference,
    public right: ReadableReference,
  ) {
    super();
  }

  compile(context: CompilerContext): Compiled {
    const register = context.bindReservedRegisterKey();

    const result = [
      this.compiledDebugName,
      ...this.left.compileRead(context),
      `COPYTO ${register}`,
      ...this.right.compileRead(context),
      `ADD ${register}`,
    ];

    return result;
  }

  compileExpression(context: CompilerContext): Compiled {
    return this.compile(context);
  }
}
