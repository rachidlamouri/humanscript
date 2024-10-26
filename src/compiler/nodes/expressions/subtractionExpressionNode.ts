import { CompilerContext, Compiled } from '../../compilerContext';
import { Node } from '../node';
import { ReadableReference } from '../references/readableReference';
import { ReadableExpression } from './readableExpression';

export class SubtractionExpressionNode
  extends Node
  implements ReadableExpression
{
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
      ...this.right.compileRead(context),
      `COPYTO ${register}`,
      ...this.left.compileRead(context),
      `SUB ${register}`,
    ];

    return result;
  }
}
