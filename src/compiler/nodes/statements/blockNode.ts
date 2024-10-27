import { Assembly } from '../../assembly';
import { Compiled } from '../../compiled';
import { CompilerContext } from '../../compilerContext';
import { Node } from '../node';
import { CommentNode } from './commentNode';
import { Statement } from './statement';

export class BlockNode extends Node {
  constructor(public statements: Statement[]) {
    super();
  }

  compile(context: CompilerContext): Compiled {
    const lineFeedIndices = new Set<number>();
    this.statements.forEach((statement, index) => {
      const isCommentNode = statement instanceof CommentNode;
      const isNextCommentNode =
        this.statements[index + 1] instanceof CommentNode;

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
}
