import { CompilerContext } from '../../compilerContext';
import { Compiled } from '../../compiled';
import { Node } from '../node';
import { Statement } from './statement';
import { Assembly } from '../../assembly';
import { BlockNode } from './blockNode';
import { Condition, ConditionContext } from '../conditions/condition';

export class WhileStatementNode extends Node implements Statement {
  constructor(
    public condition: Condition,
    public block: BlockNode,
  ) {
    super();
  }

  compileStatement(context: CompilerContext): Compiled {
    const anchorIdSuffix = context.createAnchorIdSuffix();
    const continueAnchorId = `loop${anchorIdSuffix}`;
    const conditionAnchorId = `condition${anchorIdSuffix}`;
    const breakAnchorId = `break${anchorIdSuffix}`;
    const anchors: ConditionContext = {
      trueAnchorId: continueAnchorId,
      falseAnchorId: breakAnchorId,
      anchorIdSuffix,
      anchorDepth: 0,
    };

    const result: Compiled = [];
    result.push(Assembly.DEBUG(context, this.className));
    result.push(Assembly.JUMP(context, conditionAnchorId));
    // continue
    result.push(Assembly.ANCHOR(context, continueAnchorId));
    context.incrementDepth();
    result.push(...this.block.compile(context));
    result.push(Assembly.LINE_FEED(context));
    // condition
    result.push(Assembly.ANCHOR(context, conditionAnchorId));
    result.push(...this.condition.compileCondition(context, anchors));
    context.decrementDepth();
    // break
    result.push(Assembly.ANCHOR(context, breakAnchorId));

    return result;
  }

  flatten(accumulator: Node[]): void {
    accumulator.push(this.block);

    this.block.flatten(accumulator);
  }
}
