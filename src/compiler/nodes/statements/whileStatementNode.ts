import { CompilerContext } from '../../compilerContext';
import { Compiled } from '../../compiled';
import { Node } from '../node';
import { Statement } from './statement';
import { Assembly } from '../../assembly';
import { BlockNode } from './blockNode';
import { Condition } from '../conditions/condition';

export class WhileStatementNode extends Node implements Statement {
  constructor(
    public condition: Condition,
    public block: BlockNode,
  ) {
    super();
  }

  compileStatement(context: CompilerContext): Compiled {
    const trueLabel = context.createJumpLabel();

    const result: Compiled = [];
    result.push(Assembly.DEBUG(context, this.className));
    result.push(Assembly.LABEL(context, trueLabel));
    context.incrementDepth();
    result.push(...this.block.compile(context));
    context.decrementDepth();
    result.push(...this.condition.compileCondition(context, { trueLabel }));

    return result;
  }

  flatten(accumulator: Node[]): void {
    accumulator.push(this.block);

    this.block.flatten(accumulator);
  }
}
