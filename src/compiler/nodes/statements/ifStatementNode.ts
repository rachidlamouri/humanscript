import { CompilerContext } from '../../compilerContext';
import { Compiled } from '../../compiled';
import { assertIsNode, Node } from '../node';
import { Statement } from './statement';
import { Assembly } from '../../assembly';
import { BlockNode } from './blockNode';
import { Condition, ConditionLabels } from '../conditions/condition';

export class IfStatementNode extends Node implements Statement {
  constructor(
    public condition: Condition,
    public ifBlock: BlockNode,
    public elseBlock: BlockNode,
  ) {
    super();
  }

  compileStatement(context: CompilerContext): Compiled {
    const labelSuffix = context.createJumpLabelSuffix();
    const ifJumpLabel = `if${labelSuffix}`;
    const elseJumpLabel = `else${labelSuffix}`;
    const endJumpLabel = `end${labelSuffix}`;
    const labels: ConditionLabels = {
      trueLabel: ifJumpLabel,
      falseLabel: elseJumpLabel,
    };

    context.incrementDepth();
    context.incrementDepth();
    const compiledIfBlock = this.ifBlock.compile(context);
    const compiledElseBlock = this.elseBlock.compile(context);
    context.decrementDepth();
    context.decrementDepth();

    let fallthroughLabel: string;
    let jumpToLabel: string;
    let fallthroughBlock: Compiled;
    let jumpToBlock: Compiled;
    if (this.condition.jumpsIfTrue) {
      fallthroughLabel = elseJumpLabel;
      jumpToLabel = ifJumpLabel;
      fallthroughBlock = compiledElseBlock;
      jumpToBlock = compiledIfBlock;
    } else {
      fallthroughLabel = ifJumpLabel;
      jumpToLabel = elseJumpLabel;
      fallthroughBlock = compiledIfBlock;
      jumpToBlock = compiledElseBlock;
    }

    const result: Compiled = [];
    result.push(Assembly.DEBUG(context, this.className));
    result.push(Assembly.DEBUG(context, labelSuffix));
    context.incrementDepth();
    // condition
    result.push(Assembly.DEBUG(context, 'condition'));
    context.incrementDepth();
    result.push(...this.condition.compileCondition(context, labels));
    context.decrementDepth();
    // fallthrough
    result.push(Assembly.LABEL(context, fallthroughLabel));
    context.incrementDepth();
    result.push(Assembly.DEBUG(context, 'block'));
    context.decrementDepth();
    result.push(...fallthroughBlock);
    result.push(Assembly.JUMP(context, endJumpLabel));
    // jump-to
    result.push(Assembly.LABEL(context, jumpToLabel));
    context.incrementDepth();
    result.push(Assembly.DEBUG(context, 'block'));
    context.decrementDepth();
    result.push(...jumpToBlock);
    context.decrementDepth();
    // end
    result.push(Assembly.LABEL(context, endJumpLabel));

    return result;
  }

  flatten(accumulator: Node[]): void {
    accumulator.push(this);

    assertIsNode(this.condition);

    this.condition.flatten(accumulator);
    this.ifBlock.flatten(accumulator);
    this.elseBlock.flatten(accumulator);
  }
}
