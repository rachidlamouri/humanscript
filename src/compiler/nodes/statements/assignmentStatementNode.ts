import { ReadableExpression } from '../expressions/readableExpression';
import { WriteableReference } from '../references/writeableReference';
import { CompilerContext } from '../../compilerContext';
import { Compiled } from '../../compiled';
import { Node } from '../node';
import { Statement } from './statement';
import { Assembly } from '../../assembly';

export class AssignmentStatementNode extends Node implements Statement {
  constructor(
    public writeable: WriteableReference,
    public readable: ReadableExpression,
  ) {
    super();
  }

  compileStatement(context: CompilerContext): Compiled {
    const result: Compiled = [
      Assembly.DEBUG(context, this.className),
      ...this.readable.compileExpression(context),
      ...this.writeable.compileWrite(context),
      Assembly.LINE_FEED(context),
    ];

    return result;
  }
}
