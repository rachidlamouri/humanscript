import { CompilerContext } from '../../compilerContext';
import { Compiled } from '../../compiled';
import { Node } from '../node';
import { ReadableReference } from '../references/readableReference';
import { Statement } from './statement';
import { Assembly } from '../../assembly';

export class IfStatementNode extends Node implements Statement {
  constructor(
    public isEqualToZero: boolean,
    public reference: ReadableReference,
    public block: Statement[],
  ) {
    super();
  }

  compileStatement(context: CompilerContext): Compiled {
    const ifJumpLabel = context.createJumpLabel();
    const endJumpLabel = context.createJumpLabel();

    context.incrementDepth();
    context.incrementDepth();
    const compiledBlock = this.block.flatMap((statement) => {
      return statement.compileStatement(context);
    });
    context.decrementDepth();
    context.decrementDepth();

    const ifBlock = this.isEqualToZero ? compiledBlock : [];
    const elseBlock = this.isEqualToZero ? [] : compiledBlock;

    const result: Compiled = [];
    result.push(Assembly.DEBUG(context, this.className));
    context.incrementDepth();
    // condition
    result.push(Assembly.DEBUG(context, 'condition'));
    context.incrementDepth();
    result.push(...this.reference.compileRead(context));
    result.push(Assembly.JUMPZ(context, ifJumpLabel));
    context.decrementDepth();
    // else
    result.push(Assembly.DEBUG(context, 'else'));
    context.incrementDepth();
    result.push(...elseBlock);
    result.push(Assembly.JUMP(context, endJumpLabel));
    context.decrementDepth();
    // if
    result.push(Assembly.DEBUG(context, 'if'));
    context.decrementDepth();
    result.push(Assembly.LABEL(context, ifJumpLabel));
    result.push(...ifBlock);
    // end
    result.push(Assembly.LABEL(context, endJumpLabel));

    return result;
  }
}
