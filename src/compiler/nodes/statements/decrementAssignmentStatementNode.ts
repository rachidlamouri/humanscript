import { CompilerContext } from '../../compilerContext';
import { Compiled } from '../../compiled';
import { Node } from '../node';
import { Statement } from './statement';
import { Assembly } from '../../assembly';
import { IdentifierNode } from '../references/identifierNode';

export class DecrementAssignmentStatementNode
  extends Node
  implements Statement
{
  constructor(public identifier: IdentifierNode) {
    super();
  }

  compileStatement(context: CompilerContext): Compiled {
    const result: Compiled = [
      Assembly.DEBUG(context, this.className),
      Assembly.BUMP_DN(context, this.identifier.name),
    ];

    return result;
  }

  flatten(accumulator: Node[]): void {
    accumulator.push(this);

    this.identifier.flatten(accumulator);
  }
}
