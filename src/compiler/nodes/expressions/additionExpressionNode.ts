import { Compiled, CompilerContext } from '../../compilerContext';
import { ReadableExpression } from './readableExpression';
import { ReadableReference } from '../references/readableReference';
import { Node } from '../node';

export class AdditionExpressionNode extends Node implements ReadableExpression {
  constructor(
    public left: ReadableReference,
    public right: ReadableReference,
  ) {
    super();
  }

  compileExpression(context: CompilerContext): Compiled {
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
}
