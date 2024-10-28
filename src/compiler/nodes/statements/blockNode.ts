import { Assembly } from '../../assembly';
import { Compiled } from '../../compiled';
import { CompilerContext } from '../../compilerContext';
import { assertIsNode, Node } from '../node';
import { HumanscriptCommentNode } from './humanScriptCommentNode';
import { Statement } from './statement';

export class BlockNode extends Node {
  constructor(public statements: Statement[]) {
    super();
  }

  compile(context: CompilerContext): Compiled {
    const lineFeedIndices = new Set<number>();
    this.statements.forEach((statement, index) => {
      const isCommentNode = statement instanceof HumanscriptCommentNode;
      const isNextCommentNode =
        this.statements[index + 1] instanceof HumanscriptCommentNode;

      if (!isCommentNode || !isNextCommentNode) {
        lineFeedIndices.add(index);
      }
    });

    const compiledBlock: Compiled = this.statements.flatMap(
      (statement, index) => {
        const compiledStatement = statement.compileStatement(context);

        const lineFeed =
          lineFeedIndices.has(index) && index < this.statements.length - 1
            ? [Assembly.LINE_FEED(context)]
            : [];

        return [...compiledStatement, ...lineFeed];
      },
    );

    return compiledBlock;
  }

  flatten(accumulator: Node[]): void {
    accumulator.push(this);

    this.statements.forEach((statement) => {
      assertIsNode(statement);
      statement.flatten(accumulator);
    });
  }
}
