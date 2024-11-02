import { assertIsNotUndefined } from '../../../utils/assertIsNotUndefined';
import { Assembly } from '../../assembly';
import { Compiled } from '../../compiled';
import { CompilerContext } from '../../compilerContext';
import { Node } from '../node';
import { Condition, ConditionLabels } from './condition';

export class TrueConditionNode extends Node implements Condition {
  jumpsIfTrue = true;

  compileCondition(
    context: CompilerContext,
    { trueLabel }: ConditionLabels,
  ): Compiled {
    assertIsNotUndefined(trueLabel);

    return [Assembly.JUMP(context, trueLabel)];
  }

  flatten(accumulator: Node[]): void {
    accumulator.push(this);
  }
}
