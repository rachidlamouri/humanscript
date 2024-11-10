import { ReadableExpression } from '../expressions/readableExpression';
import { WriteableReference } from '../references/writeableReference';
import { CompilerContext } from '../../compilerContext';
import { Compiled } from '../../compiled';
import { assertIsNode, Node } from '../node';
import { Statement } from './statement';
import { Assembly } from '../../assembly';
import { Readable } from '../references/readable';
import { DualResultExpression } from '../expressions/dualResultExpression';

export class AssignmentStatementNode extends Node implements Statement {
  constructor(
    public writeable: WriteableReference,
    public readable: ReadableExpression,
  ) {
    super();
  }

  compileStatement(context: CompilerContext): Compiled {
    const result: Compiled = [];
    result.push(Assembly.DEBUG(context, this.className));
    context.incrementDepth();
    result.push(Assembly.DEBUG(context, 'read'));
    result.push(...this.readable.compileExpression(context));
    result.push(Assembly.DEBUG(context, 'write'));
    result.push(...this.writeable.compileWrite(context));
    context.decrementDepth();

    return result;
  }

  flatten(accumulator: Node[]): void {
    accumulator.push(this);

    assertIsNode(this.writeable);
    assertIsNode(this.readable);

    this.writeable.flatten(accumulator);
    this.readable.flatten(accumulator);
  }
}

export class ReadableAssignmentExpressionNode
  extends AssignmentStatementNode
  implements Readable
{
  compileRead(context: CompilerContext): Compiled {
    return this.compileStatement(context);
  }
}

export class DualAssignmentStatementNode extends AssignmentStatementNode {
  constructor(
    public firstWriteable: WriteableReference,
    public secondWriteable: WriteableReference,
    public dualReadable: DualResultExpression,
  ) {
    super(firstWriteable, dualReadable);
  }

  compileStatement(context: CompilerContext): Compiled {
    const result: Compiled = [];

    result.push(...super.compileStatement(context));
    context.incrementDepth();
    result.push(Assembly.DEBUG(context, 'second read'));
    result.push(...this.dualReadable.compiledSecondRead(context));
    result.push(Assembly.DEBUG(context, 'second write'));
    result.push(...this.secondWriteable.compileWrite(context));
    context.decrementDepth();

    return result;
  }
}
