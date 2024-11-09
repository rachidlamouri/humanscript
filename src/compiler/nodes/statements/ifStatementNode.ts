import { CompilerContext } from '../../compilerContext';
import { Compiled } from '../../compiled';
import { assertIsNode, Node } from '../node';
import { Statement } from './statement';
import { Assembly } from '../../assembly';
import { BlockNode } from './blockNode';
import { Condition, ConditionContext } from '../conditions/condition';

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
    const anchors: ConditionContext = {
      trueAnchorId: ifAnchorId,
      falseAnchorId: elseAnchorId,
      anchorIdSuffix,
      anchorDepth: 0,
    };

    const result: Compiled = [];
    result.push(Assembly.DEBUG(context, this.className));
    result.push(Assembly.DEBUG(context, `start${anchorIdSuffix}`));
    context.incrementDepth();
    // condition
    result.push(Assembly.DEBUG(context, `condition${anchorIdSuffix}`));
    context.incrementDepth();
    result.push(...this.condition.compileCondition(context, anchors));
    context.decrementDepth();
    // if
    result.push(Assembly.ANCHOR(context, ifAnchorId));
    context.incrementDepth();
    result.push(Assembly.DEBUG(context, 'block'));
    result.push(...this.ifBlock.compile(context));
    result.push(Assembly.JUMP(context, endAnchorId));
    context.decrementDepth();
    // else
    result.push(Assembly.ANCHOR(context, elseAnchorId));
    context.incrementDepth();
    result.push(Assembly.DEBUG(context, 'block'));
    result.push(...this.elseBlock.compile(context));
    context.decrementDepth();
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
