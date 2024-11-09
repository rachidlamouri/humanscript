import { CompilerContext } from '../../compilerContext';
import { Compiled } from '../../compiled';
import { assertIsNode, Node } from '../node';
import { Statement } from './statement';
import { Assembly } from '../../assembly';
import { BlockNode } from './blockNode';
import { Condition, ConditionAnchorIds } from '../conditions/condition';

export class IfStatementNode extends Node implements Statement {
  constructor(
    public condition: Condition,
    public ifBlock: BlockNode,
    public elseBlock: BlockNode,
  ) {
    super();
  }

  compileStatement(context: CompilerContext): Compiled {
    const anchorIdSuffix = context.createAnchorIdSuffix();
    const ifAnchorId = `if${anchorIdSuffix}`;
    const elseAnchorId = `else${anchorIdSuffix}`;
    const endAnchorId = `end${anchorIdSuffix}`;
    const anchors: ConditionAnchorIds = {
      trueAnchorId: ifAnchorId,
      falseAnchorId: elseAnchorId,
    };

    context.incrementDepth();
    context.incrementDepth();
    const compiledIfBlock = this.ifBlock.compile(context);
    const compiledElseBlock = this.elseBlock.compile(context);
    context.decrementDepth();
    context.decrementDepth();

    let fallthroughAnchorId: string;
    let jumpToAnchorId: string;
    let fallthroughBlock: Compiled;
    let jumpToBlock: Compiled;
    if (this.condition.jumpsIfTrue) {
      fallthroughAnchorId = elseAnchorId;
      jumpToAnchorId = ifAnchorId;
      fallthroughBlock = compiledElseBlock;
      jumpToBlock = compiledIfBlock;
    } else {
      fallthroughAnchorId = ifAnchorId;
      jumpToAnchorId = elseAnchorId;
      fallthroughBlock = compiledIfBlock;
      jumpToBlock = compiledElseBlock;
    }

    const result: Compiled = [];
    result.push(Assembly.DEBUG(context, this.className));
    result.push(Assembly.DEBUG(context, anchorIdSuffix));
    context.incrementDepth();
    // condition
    result.push(Assembly.DEBUG(context, 'condition'));
    context.incrementDepth();
    result.push(...this.condition.compileCondition(context, anchors));
    context.decrementDepth();
    // fallthrough
    result.push(Assembly.ANCHOR(context, fallthroughAnchorId));
    context.incrementDepth();
    result.push(Assembly.DEBUG(context, 'block'));
    context.decrementDepth();
    result.push(...fallthroughBlock);
    context.incrementDepth();
    result.push(Assembly.JUMP(context, endAnchorId));
    context.decrementDepth();
    // jump-to
    result.push(Assembly.ANCHOR(context, jumpToAnchorId));
    context.incrementDepth();
    result.push(Assembly.DEBUG(context, 'block'));
    context.decrementDepth();
    result.push(...jumpToBlock);
    context.decrementDepth();
    // end
    result.push(Assembly.ANCHOR(context, endAnchorId));

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
