import { CompilerContext } from '../compilerContext';
import { Compiled } from '../types/compilable';
import { ReadableExpression } from '../types/readableExpression';
import { ReadableReference } from '../types/readableReference';
import { Node } from './node';

export class AdditionNode extends Node implements ReadableExpression {
  constructor(
    public left: ReadableReference,
    public right: ReadableReference,
  ) {
    super();
  }

  compile(context: CompilerContext): Compiled {
    const mathTempIndex = context.bindMathTempKey();

    const result = [
      this.compiledDebugName,
      ...this.left.compileRead(context),
      `COPYTO ${mathTempIndex}`,
      ...this.right.compileRead(context),
      `ADD ${mathTempIndex}`,
    ];

    return result;
  }

  compileExpression(context: CompilerContext): Compiled {
    return this.compile(context);
  }
}
