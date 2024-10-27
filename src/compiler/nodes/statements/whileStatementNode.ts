import { CompilerContext } from '../../compilerContext';
import { Compiled } from '../../compiled';
import { Node } from '../node';
import { Statement } from './statement';
import { Assembly } from '../../assembly';
import { BlockNode } from './blockNode';

export class WhileStatementNode extends Node implements Statement {
  constructor(public block: BlockNode) {
    super();
  }

  compileStatement(context: CompilerContext): Compiled {
    const jumpLabel = context.createJumpLabel();

    const result: Compiled = [];
    result.push(Assembly.DEBUG(context, this.className));
    result.push(Assembly.LABEL(context, jumpLabel));
    context.incrementDepth();
    result.push(...this.block.compile(context));
    context.decrementDepth();
    result.push(Assembly.JUMP(context, jumpLabel));

    return result;
  }
}
