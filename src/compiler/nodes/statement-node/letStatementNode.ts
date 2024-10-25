import { CompilerContext, FloorIndex } from '../../compilerContext';
import { Compiled } from '../interfaces/compilable';
import { IdentifierNode } from '../reference-node/identifierNode';
import { StatementNode } from './statementNode';

export class LetStatementNode extends StatementNode {
  constructor(
    public identifier: IdentifierNode,
    public floorIndex: FloorIndex | null,
  ) {
    super();
  }

  compile(context: CompilerContext): Compiled {
    context.bindFloorSlot(this.identifier.name, this.floorIndex);

    return [this.compiledDebugName];
  }
}
