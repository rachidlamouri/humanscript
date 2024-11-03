import { CompilerContext, RegisterKey } from '../../compilerContext';
import { Compiled } from '../../compiled';
import { ReadableExpression } from './readableExpression';
import { ReadableReference } from '../references/readableReference';
import { assertIsNode, Node } from '../node';
import { Assembly } from '../../assembly';

export class NegationExpressionNode extends Node implements ReadableExpression {
  constructor(public reference: ReadableReference) {
    super();
  }

  compileExpression(context: CompilerContext): Compiled {
    context.bindReservedRegisterKey(RegisterKey.Accumulator);

    const result = [
      Assembly.DEBUG(context, this.className),
      ...this.reference.compileRead(context),
      Assembly.COPYTO(context, RegisterKey.Accumulator),
      Assembly.SUB(context, RegisterKey.Accumulator),
      Assembly.SUB(context, RegisterKey.Accumulator),
    ];

    return result;
  }

  flatten(accumulator: Node[]): void {
    accumulator.push(this);

    assertIsNode(this.reference);
    this.reference.flatten(accumulator);
  }
}
