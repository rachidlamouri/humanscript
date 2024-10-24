import { CompilerContext, FloorIndex } from '../../compilerContext';
import { Compiled } from '../../types/compilable';
import { Identifier } from '../../types/identifier';
import { StatementNode } from './statementNode';

export class LetStatementNode extends StatementNode {
  constructor(
    public identifier: Identifier,
    public floorIndex: FloorIndex | null,
  ) {
    super();
  }

  compile(context: CompilerContext): Compiled {
    context.bindFloorSlot(this.identifier.name, this.floorIndex);

    return [this.compiledDebugName];
  }
}
