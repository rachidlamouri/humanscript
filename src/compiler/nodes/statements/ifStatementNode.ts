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
    const ifJumpLabel = context.createJumpLabel();
    const elseJumpLabel = context.createJumpLabel();
    const endJumpLabel = context.createJumpLabel();
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
    let fallthroughDebugLabel: string;
    let jumpToDebugLabel: string;
    if (this.condition.jumpsIfTrue) {
      fallthroughLabel = elseJumpLabel;
      jumpToLabel = ifJumpLabel;
      fallthroughBlock = compiledElseBlock;
      jumpToBlock = compiledIfBlock;
      fallthroughDebugLabel = 'else';
      jumpToDebugLabel = 'if';
    } else {
      fallthroughLabel = ifJumpLabel;
      jumpToLabel = elseJumpLabel;
      fallthroughBlock = compiledIfBlock;
      jumpToBlock = compiledElseBlock;
      fallthroughDebugLabel = 'if';
      jumpToDebugLabel = 'else';
    }

    const result: Compiled = [];
    result.push(Assembly.DEBUG(context, this.className));
    context.incrementDepth();
    // condition
    result.push(Assembly.DEBUG(context, 'condition'));
    context.incrementDepth();
    result.push(...this.condition.compileCondition(context, labels));
    context.decrementDepth();
    // fallthrough
    result.push(Assembly.DEBUG(context, fallthroughDebugLabel));
    result.push(Assembly.LABEL(context, fallthroughLabel));
    context.incrementDepth();
    result.push(...fallthroughBlock);
    result.push(Assembly.JUMP(context, endJumpLabel));
    context.decrementDepth();
    // jump-to
    result.push(Assembly.DEBUG(context, jumpToDebugLabel));
    result.push(Assembly.LABEL(context, jumpToLabel));
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
  }
}
