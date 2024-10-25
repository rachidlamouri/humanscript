import { ReadableExpression } from '../expression-node/readableExpression';
import { WriteableReference } from '../reference-node/writeableReference';
import { CompilerContext, Compiled } from '../../compilerContext';
import { Node } from '../node';
import { Statement } from './statement';

export class AssignmentStatementNode extends Node implements Statement {
  constructor(
    public writeable: WriteableReference,
    public readable: ReadableExpression,
  ) {
    super();
  }

  compileStatement(context: CompilerContext): Compiled {
    const result: Compiled = [
      this.compiledDebugName,
      ...this.readable.compileExpression(context),
      ...this.writeable.compileWrite(context),
    ];

    return result;
  }
}
