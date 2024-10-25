import { CompilerContext } from '../../compilerContext';
import { Compiled } from '../../types/compilable';
import { StatementNode } from './statementNode';

export class IfStatementNode extends StatementNode {
  constructor(public block: StatementNode[]) {
    super();
  }

  compile(context: CompilerContext): Compiled {
    throw new Error('not implemented');
  }
}
/*
A:
    INBOX
    COPYTO 0

    COPYFROM 0
    JUMPZ B
    
    COPYFROM 0
    OUTBOX
B:
    JUMP A

*/
