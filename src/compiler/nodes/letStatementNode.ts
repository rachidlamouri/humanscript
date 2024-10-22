import { Identifier } from '../types/primitiveTypes';
import { CompilerContext, Compiled } from './node';
import { StatementNode } from './statementNode';

export class LetStatementNode extends StatementNode {
  constructor(public identifier: Identifier) {
    super();
  }

  compile(context: CompilerContext): Compiled {
    context.bindIdentifier(this.identifier);
    return [this.compiledDebugName];
  }
}
