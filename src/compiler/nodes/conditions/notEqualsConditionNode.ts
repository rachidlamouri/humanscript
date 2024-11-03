import { assertIsNotUndefined } from '../../../utils/assertIsNotUndefined';
import { Assembly } from '../../assembly';
import { Compiled } from '../../compiled';
import { CompilerContext, RegisterKey } from '../../compilerContext';
import { Node } from '../node';
import { ReadableReference } from '../references/readableReference';
import { ZeroLiteralNode } from '../zeroLiteralNode';
import { Comparable } from './comparable';
import { Condition, ConditionLabels } from './condition';

export class NotEqualsConditionNode extends Node implements Condition {
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

    const result = [];

    result.push(Assembly.DEBUG(context, this.className));
    if (this.right instanceof ZeroLiteralNode) {
      result.push(...this.left.compileRead(context));
      result.push(Assembly.DEBUG(context, 'compare 0'));
      result.push(Assembly.JUMPZ(context, falseLabel));
    } else {
      result.push(...this.right.compileRead(context));
      result.push(Assembly.COPYTO(context, RegisterKey.Accumulator));
      result.push(...this.left.compileRead(context));
      result.push(Assembly.SUB(context, RegisterKey.Accumulator));
      result.push(Assembly.JUMPZ(context, falseLabel));
    }

    return result;
  }

  flatten(accumulator: Node[]): void {
    accumulator.push(this);
  }
}
