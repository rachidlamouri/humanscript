import { CompilerContext } from '../../compilerContext';
import { Compiled } from '../../compiled';
import { assertIsNode, Node } from '../node';
import { ReadableReference } from '../references/readableReference';
import { ReadableExpression } from './readableExpression';
import { Assembly } from '../../assembly';

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
    context.bindReservedRegisterKey();

    const result = [
      Assembly.DEBUG(context, this.className),
      ...this.right.compileRead(context),
      Assembly.COPYTO(context, context.registerKey),
      ...this.left.compileRead(context),
      Assembly.SUB(context),
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
