import { Identifier } from '../types/identifier';
import { CompilerContext, Compiled } from './node';
import { StatementNode } from './statementNode';

export class LetStatementNode extends StatementNode {
  constructor(public identifier: Identifier) {
    super();
  }

  compile(context: CompilerContext): Compiled {
    context.bindFloorIndexKey(this.identifier.name);
    return [this.compiledDebugName];
  }
}
