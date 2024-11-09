import { CompilerContext } from '../../compilerContext';
import { Compiled } from '../../compiled';
import { Node } from '../node';
import { Statement } from './statement';
import { Assembly } from '../../assembly';
import { IdentifierNode } from '../references/identifierNode';
import { Readable } from '../references/readable';

export class IncrementAssignmentStatementNode
  extends Node
  implements Statement
{
  constructor(public identifier: IdentifierNode) {
    super();
  }

  compileStatement(context: CompilerContext): Compiled {
    const result: Compiled = [
      Assembly.DEBUG(context, this.className),
      Assembly.BUMP_UP(context, this.identifier.name),
    ];

    return result;
  }

  flatten(accumulator: Node[]): void {
    accumulator.push(this);

    this.identifier.flatten(accumulator);
  }
}

export class IncrementAssignmentExpressionNode
  extends IncrementAssignmentStatementNode
  implements Readable
{
  compileRead(context: CompilerContext): Compiled {
    return this.compileStatement(context);
  }
}
