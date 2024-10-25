import { CompilerContext, Compiled, FloorIndex } from '../../compilerContext';
import { Node } from '../node';
import { IdentifierNode } from '../references/identifierNode';
import { Statement } from './statement';

export class LetStatementNode extends Node implements Statement {
  constructor(
    public identifier: IdentifierNode,
    public floorIndex: FloorIndex | null,
  ) {
    super();
  }

  compileStatement(context: CompilerContext): Compiled {
    context.bindFloorSlot(this.identifier.name, this.floorIndex);

    return [this.compiledDebugName];
  }
}
