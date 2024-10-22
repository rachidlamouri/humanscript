import { WriteableReference, ReadableReference } from '../types/compoundTypes';
import { FloorSlot } from '../types/floorSlot';
import { Inbox, Outbox } from '../types/primitiveTypes';
import { Compiled, CompilerContext } from './node';
import { StatementNode } from './statementNode';

export class AssignmentStatementNode extends StatementNode {
  constructor(
    public writeable: WriteableReference,
    public readable: ReadableReference,
  ) {
    super();
  }

  // TODO: make interfaces for readable/writeable and encapsulate compilation
  compile(context: CompilerContext): Compiled {
    const result: string[] = [this.compiledDebugName];

    if (this.readable === Inbox) {
      result.push('INBOX');
    }

    if (this.readable instanceof FloorSlot) {
      result.push(`COPYFROM ${this.readable.index}`);
    }

    if (typeof this.readable === 'string') {
      const floorIndex = context.getFloorIndex(this.readable);
      result.push(`COPYFROM ${floorIndex}`);
    }

    if (this.writeable === Outbox) {
      result.push('OUTBOX');
    }

    if (typeof this.writeable === 'string') {
      const floorIndex = context.getFloorIndex(this.writeable);
      result.push(`COPYTO ${floorIndex}`);
    }

    return result;
  }
}
