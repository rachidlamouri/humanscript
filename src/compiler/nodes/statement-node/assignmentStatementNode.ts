import { ReadableExpression } from '../interfaces/readableExpression';
import { WriteableReference } from '../interfaces/writeableReference';
import { Compiled } from '../interfaces/compilable';
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
