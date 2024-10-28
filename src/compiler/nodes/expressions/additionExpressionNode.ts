import { CompilerContext } from '../../compilerContext';
import { Compiled } from '../../compiled';
import { ReadableExpression } from './readableExpression';
import { ReadableReference } from '../references/readableReference';
import { assertIsNode, Node } from '../node';
import { Assembly } from '../../assembly';

export class AdditionExpressionNode extends Node implements ReadableExpression {
  constructor(
    public left: ReadableReference,
    public right: ReadableReference,
  ) {
    super();
  }

  compileExpression(context: CompilerContext): Compiled {
    context.bindReservedRegisterKey();

    const result = [
      Assembly.DEBUG(context, this.className),
      ...this.left.compileRead(context),
      Assembly.COPYTO(context, context.registerKey),
      ...this.right.compileRead(context),
      Assembly.ADD(context),
    ];

    return result;
  }

  flatten(accumulator: Node[]): void {
    accumulator.push(this);

    assertIsNode(this.left);
    assertIsNode(this.right);

    this.left.flatten(accumulator);
    this.right.flatten(accumulator);
  }
}
