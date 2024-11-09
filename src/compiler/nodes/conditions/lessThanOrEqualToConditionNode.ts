import { assertIsNotUndefined } from '../../../utils/assertIsNotUndefined';
import { Assembly } from '../../assembly';
import { Compiled } from '../../compiled';
import { CompilerContext, RegisterKey } from '../../compilerContext';
import { assertIsNode, Node } from '../node';
import { ZeroLiteralNode } from '../zeroLiteralNode';
import { LeftComparable, RightComparable } from './comparable';
import { Condition, ConditionAnchorIds } from './condition';

export class LessThanOrEqualToConditionNode extends Node implements Condition {
  jumpsIfTrue = true;

  constructor(
    public left: LeftComparable,
    public right: RightComparable,
  ) {
    super();
  }

  compileCondition(
    context: CompilerContext,
    { trueAnchorId }: ConditionAnchorIds,
  ): Compiled {
    assertIsNotUndefined(trueAnchorId);
    context.bindReservedRegisterKey(RegisterKey.Accumulator);

    const result = [];

    result.push(Assembly.DEBUG(context, this.className));
    if (this.right instanceof ZeroLiteralNode) {
      result.push(...this.left.compileRead(context));
      result.push(Assembly.DEBUG(context, 'compare 0'));
      result.push(Assembly.JUMPN(context, trueAnchorId));
      result.push(Assembly.JUMPZ(context, trueAnchorId));
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
