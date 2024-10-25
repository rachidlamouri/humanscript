import { CompilerContext, Compiled } from '../../compilerContext';
import { Node } from '../node';
import { Statement } from './statement';

export class WhileStatementNode extends Node implements Statement {
  constructor(public block: Statement[]) {
    super();
  }

  compileStatement(context: CompilerContext): Compiled {
    const jumpLabel = context.createJumpLabel();

    const compiledBlock = this.block.flatMap((statement) => {
      return statement.compileStatement(context);
    });

    const result = [
      // -
      this.compiledDebugName,
      `${jumpLabel}:`,
      ...compiledBlock.map((line) => `  ${line}`),
      `  JUMP ${jumpLabel}`,
    ];

    return result;
  }
}
