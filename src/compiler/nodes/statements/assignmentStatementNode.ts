import { ReadableExpression } from '../expressions/readableExpression';
import { WriteableReference } from '../references/writeableReference';
import { CompilerContext } from '../../compilerContext';
import { Compiled } from '../../compiled';
import { assertIsNode, Node } from '../node';
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
