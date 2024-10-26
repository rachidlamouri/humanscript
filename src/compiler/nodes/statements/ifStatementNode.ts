import { Compiled, CompilerContext } from '../../compilerContext';
import { Node } from '../node';
import { ReadableReference } from '../references/readableReference';
import { Statement } from './statement';

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

    const compiledBlock = this.block.flatMap((statement) => {
      return statement.compileStatement(context);
    });

    const formattedBLock = compiledBlock.map((line) => `  ${line}`);
    const ifBlock = this.isEqualToZero ? formattedBLock : [];
    const elseBlock = this.isEqualToZero ? [] : formattedBLock;

    const result = [
      this.compiledDebugName,
      // condition
      `  -- condition --`,
      ...this.reference.compileRead(context).map((line) => `  ${line}`),
      `  JUMPZ ${ifJumpLabel}`,
      // else
      `  -- else --`,
      ...elseBlock,
      `  JUMP ${endJumpLabel}`,
      // if
      `  -- if --`,
      `${ifJumpLabel}:`,
      ...ifBlock,
      // end
      `${endJumpLabel}:`,
    ];

    return result;
  }
}
