import { assertIsNotUndefined } from '../../../utils/assertIsNotUndefined';
import { Assembly } from '../../assembly';
import { Compiled } from '../../compiled';
import { CompilerContext, RegisterKey } from '../../compilerContext';
import { assertIsNode, Node } from '../node';
import { ReadableReference } from '../references/readableReference';
import { ZeroLiteralNode } from '../zeroLiteralNode';
import { Comparable } from './comparable';
import { Condition, ConditionLabels } from './condition';

export class LessThanConditionNode extends Node implements Condition {
  jumpsIfTrue = true;

  constructor(
    public left: ReadableReference,
    public right: Comparable,
  ) {
    super();
  }

  compileCondition(
    context: CompilerContext,
    { trueLabel }: ConditionLabels,
  ): Compiled {
    assertIsNotUndefined(trueLabel);
    context.bindReservedRegisterKey(RegisterKey.Accumulator);

    const result = [];

    result.push(Assembly.DEBUG(context, this.className));
    if (this.right instanceof ZeroLiteralNode) {
      result.push(...this.left.compileRead(context));
      result.push(Assembly.DEBUG(context, 'compare 0'));
      result.push(Assembly.JUMPN(context, trueLabel));
    } else {
      result.push(...this.right.compileRead(context));
      result.push(Assembly.COPYTO(context, RegisterKey.Accumulator));
      result.push(...this.left.compileRead(context));
      result.push(Assembly.SUB(context, RegisterKey.Accumulator));
      result.push(Assembly.JUMPN(context, trueLabel));
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
