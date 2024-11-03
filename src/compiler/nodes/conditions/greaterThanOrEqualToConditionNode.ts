import { assertIsNotUndefined } from '../../../utils/assertIsNotUndefined';
import { Assembly } from '../../assembly';
import { Compiled } from '../../compiled';
import { CompilerContext } from '../../compilerContext';
import { assertIsNode, Node } from '../node';
import { ReadableReference } from '../references/readableReference';
import { ZeroLiteralNode } from '../zeroLiteralNode';
import { Comparable } from './comparable';
import { Condition, ConditionLabels } from './condition';

export class GreaterThanOrEqualToConditionNode
  extends Node
  implements Condition
{
  jumpsIfTrue = false;

  constructor(
    public left: ReadableReference,
    public right: Comparable,
  ) {
    super();
  }

  compileCondition(
    context: CompilerContext,
    { falseLabel }: ConditionLabels,
  ): Compiled {
    assertIsNotUndefined(falseLabel);
    context.bindReservedRegisterKey();

    const result = [];

    result.push(Assembly.DEBUG(context, this.className));
    if (this.right instanceof ZeroLiteralNode) {
      result.push(...this.left.compileRead(context));
      result.push(Assembly.DEBUG(context, 'compare 0'));
      result.push(Assembly.JUMPN(context, falseLabel));
    } else {
      throw new Error('Not implemented');
    }

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
