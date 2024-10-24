import { ReadableExpression } from '../../types/readableExpression';
import { WriteableReference } from '../../types/writeableReference';
import { Compiled } from '../../types/compilable';
import { CompilerContext } from '../../compilerContext';
import { StatementNode } from './statementNode';

export class AssignmentStatementNode extends StatementNode {
  constructor(
    public writeable: WriteableReference,
    public readable: ReadableExpression,
  ) {
    super();
  }

  compile(context: CompilerContext): Compiled {
    const result: Compiled = [
      this.compiledDebugName,
      ...this.readable.compileExpression(context),
      ...this.writeable.compileWrite(context),
    ];

    return result;
  }
}