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
    const continueLabel = context.createJumpLabel();
    const breakLabel = context.createJumpLabel();
    const labels: ConditionLabels = {
      trueLabel: continueLabel,
      falseLabel: breakLabel,
    };

    let fallthroughLabel: string;
    let jumpBackLabel: string;
    if (this.condition.jumpsIfTrue) {
      jumpBackLabel = continueLabel;
      fallthroughLabel = breakLabel;
    } else {
      jumpBackLabel = breakLabel;
      fallthroughLabel = continueLabel;
    }

    const result: Compiled = [];
    result.push(Assembly.DEBUG(context, this.className));
    // jump-back
    result.push(Assembly.LABEL(context, jumpBackLabel));
    context.incrementDepth();
    result.push(Assembly.DEBUG(context, 'block'));
    // context.incrementDepth();
    result.push(...this.block.compile(context));
    result.push(Assembly.LINE_FEED(context));
    // context.decrementDepth();
    // condition
    result.push(Assembly.DEBUG(context, 'condition'));
    // context.incrementDepth();
    result.push(...this.condition.compileCondition(context, labels));
    // if (!this.condition.jumpsIfTrue) {
    //   result.push(Assembly.JUMP(context, jumpBackLabel));
    // }
    // context.decrementDepth();
    context.decrementDepth();
    // fallthrough
    result.push(Assembly.LABEL(context, fallthroughLabel));

    // const result: Compiled = [];
    // result.push(Assembly.DEBUG(context, this.className));
    // result.push(Assembly.LABEL(context, continueLabel));
    // context.incrementDepth();
    // result.push(...this.block.compile(context));
    // context.decrementDepth();
    // // condition
    // result.push(Assembly.DEBUG(context, 'condition'));
    // context.incrementDepth();
    // result.push(...this.condition.compileCondition(context, labels));
    // context.decrementDepth();
    // result.push(Assembly.LABEL(context, fallthroughLabel));

    return result;
  }

  flatten(accumulator: Node[]): void {
    accumulator.push(this.block);

    this.block.flatten(accumulator);
  }
}
