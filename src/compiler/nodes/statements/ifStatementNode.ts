import { Compiled, CompilerContext } from '../../compilerContext';
import { Node } from '../node';
import { ReadableReference } from '../references/readableReference';
import { Statement } from './statement';

export class IfStatementNode extends Node implements Statement {
  constructor(
    public reference: ReadableReference,
    public block: Statement[],
  ) {
    super();
  }

  compileStatement(context: CompilerContext): Compiled {
    const jumpLabel = context.createJumpLabel();

    const compiledBlock = this.block.flatMap((statement) => {
      return statement.compileStatement(context);
    });

    // TODO: support more than "ref != 0"
    const result = [
      // -
      this.compiledDebugName,
      ...this.reference.compileRead(context).map((line) => `  ${line}`),
      `  JUMPZ ${jumpLabel}`,
      ...compiledBlock.map((line) => `  ${line}`),
      `${jumpLabel}:`,
    ];

    return result;
  }
}
