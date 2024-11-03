import { assertIsNotUndefined } from '../../../utils/assertIsNotUndefined';
import { Assembly } from '../../assembly';
import { Compiled } from '../../compiled';
import { CompilerContext } from '../../compilerContext';
import { Node } from '../node';
import { ReadableReference } from '../references/readableReference';
import { ZeroLiteralNode } from '../zeroLiteralNode';
import { Comparable } from './comparable';
import { Condition, ConditionLabels } from './condition';

export class EqualsConditionNode extends Node implements Condition {
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
    context.bindReservedRegisterKey();

    const result = [];

    result.push(Assembly.DEBUG(context, this.className));
    if (this.right instanceof ZeroLiteralNode) {
      result.push(...this.left.compileRead(context));
      result.push(Assembly.DEBUG(context, 'compare 0'));
      result.push(Assembly.JUMPZ(context, trueLabel));
    } else {
      result.push(...this.right.compileRead(context));
      result.push(Assembly.COPYTO(context, context.registerKey));
      result.push(...this.left.compileRead(context));
      result.push(Assembly.SUB(context));
      result.push(Assembly.JUMPZ(context, trueLabel));
    }

    return result;
  }

  flatten(accumulator: Node[]): void {
    accumulator.push(this);
  }
}
