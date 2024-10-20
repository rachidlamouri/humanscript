import { Compiled, CompilerContext } from './node';
import { StatementNode } from './statementNode';

export class WhileLoopNode extends StatementNode {
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
      '-- WHILE NODE --',
      `${jumpLabel}:`,
      ...compiledBlock.map((line) => `  ${line}`),
      `  JUMP ${jumpLabel}`,
    ];

    return result;
  }
}
