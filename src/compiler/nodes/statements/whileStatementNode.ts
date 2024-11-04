import { CompilerContext } from '../../compilerContext';
import { Compiled } from '../../compiled';
import { Node } from '../node';
import { Statement } from './statement';
import { Assembly } from '../../assembly';
import { BlockNode } from './blockNode';
import { Condition, ConditionAnchorIds } from '../conditions/condition';

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
    const anchors: ConditionAnchorIds = {
      trueAnchorId: continueAnchorId,
      falseAnchorId: breakAnchorId,
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
    if (!this.condition.jumpsIfTrue) {
      result.push(Assembly.JUMP(context, continueAnchorId));
    }
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
