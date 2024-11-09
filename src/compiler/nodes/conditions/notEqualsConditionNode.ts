import { assertIsNotUndefined } from '../../../utils/assertIsNotUndefined';
import { Assembly } from '../../assembly';
import { Compiled } from '../../compiled';
import { CompilerContext, RegisterKey } from '../../compilerContext';
import { Node } from '../node';
import { ZeroLiteralNode } from '../zeroLiteralNode';
import { LeftComparable, RightComparable } from './comparable';
import { Condition, ConditionAnchorIds } from './condition';

export class NotEqualsConditionNode extends Node implements Condition {
  jumpsIfTrue = false;

  constructor(
    public left: LeftComparable,
    public right: RightComparable,
  ) {
    super();
  }

  compileCondition(
    context: CompilerContext,
    { falseAnchorId }: ConditionAnchorIds,
  ): Compiled {
    assertIsNotUndefined(falseAnchorId);

    const result = [];

    result.push(Assembly.DEBUG(context, this.className));
    if (this.right instanceof ZeroLiteralNode) {
      result.push(...this.left.compileRead(context));
      result.push(Assembly.DEBUG(context, 'compare 0'));
      result.push(Assembly.JUMPZ(context, falseAnchorId));
    } else {
      result.push(...this.right.compileRead(context));
      result.push(Assembly.COPYTO(context, RegisterKey.Accumulator));
      result.push(...this.left.compileRead(context));
      result.push(Assembly.SUB(context, RegisterKey.Accumulator));
      result.push(Assembly.JUMPZ(context, falseAnchorId));
    }

    return result;
  }

  flatten(accumulator: Node[]): void {
    accumulator.push(this);
  }
}
