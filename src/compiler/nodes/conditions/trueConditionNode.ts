import { assertIsNotUndefined } from '../../../utils/assertIsNotUndefined';
import { Assembly } from '../../assembly';
import { Compiled } from '../../compiled';
import { CompilerContext } from '../../compilerContext';
import { Node } from '../node';
import { Condition, ConditionContext } from './condition';

export class TrueConditionNode extends Node implements Condition {
  compileCondition(
    context: CompilerContext,
    { trueAnchorId }: ConditionContext,
  ): Compiled {
    return [Assembly.JUMP(context, trueAnchorId)];
  }

  flatten(accumulator: Node[]): void {
    accumulator.push(this);
  }
}
