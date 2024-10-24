import { CompilerContext } from '../../compilerContext';
import { Compiled } from '../../types/compilable';
import { StatementNode } from './statementNode';

export class WhileStatementNode extends StatementNode {
  constructor(public block: StatementNode[]) {
    super();
  }

  compile(context: CompilerContext): Compiled {
    const jumpLabel = context.createJumpLabel();

    const compiledBlock = this.block.flatMap((statement) => {
      return statement.compile(context);
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
