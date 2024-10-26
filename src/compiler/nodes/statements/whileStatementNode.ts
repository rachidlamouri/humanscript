import { CompilerContext } from '../../compilerContext';
import { Compiled } from '../../compiled';
import { Node } from '../node';
import { Statement } from './statement';
import { Assembly } from '../../assembly';

export class WhileStatementNode extends Node implements Statement {
  constructor(public block: Statement[]) {
    super();
  }

  compileStatement(context: CompilerContext): Compiled {
    const jumpLabel = context.createJumpLabel();

    context.incrementDepth();
    const compiledBlock = this.block.flatMap((statement) => {
      return statement.compileStatement(context);
    });
    context.decrementDepth();

    const result: Compiled = [];
    result.push(Assembly.DEBUG(context, this.className));
    result.push(Assembly.LABEL(context, jumpLabel));
    result.push(...compiledBlock);
    result.push(Assembly.JUMP(context, jumpLabel));

    return result;
  }
}
