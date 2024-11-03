import { CompilerContext } from '../../compilerContext';
import { Compiled } from '../../compiled';
import { Node } from '../node';
import { Statement } from './statement';
import { Assembly } from '../../assembly';
import { BlockNode } from './blockNode';
import { Condition, ConditionLabels } from '../conditions/condition';

export class WhileStatementNode extends Node implements Statement {
  constructor(
    public condition: Condition,
    public block: BlockNode,
  ) {
    super();
  }

  compileStatement(context: CompilerContext): Compiled {
    const labelSuffix = context.createJumpLabelSuffix();
    const continueLabel = `loop${labelSuffix}`;
    const breakLabel = `break${labelSuffix}`;
    const labels: ConditionLabels = {
      trueLabel: continueLabel,
      falseLabel: breakLabel,
    };

    const result: Compiled = [];
    result.push(Assembly.DEBUG(context, this.className));
    // continue
    result.push(Assembly.LABEL(context, continueLabel));
    context.incrementDepth();
    result.push(Assembly.DEBUG(context, 'continue'));
    result.push(...this.block.compile(context));
    result.push(Assembly.LINE_FEED(context));
    // condition
    result.push(Assembly.DEBUG(context, 'condition'));
    result.push(...this.condition.compileCondition(context, labels));
    if (!this.condition.jumpsIfTrue) {
      result.push(Assembly.JUMP(context, continueLabel));
    }
    context.decrementDepth();
    // break
    result.push(Assembly.LABEL(context, breakLabel));

    return result;
  }

  flatten(accumulator: Node[]): void {
    accumulator.push(this.block);

    this.block.flatten(accumulator);
  }
}
