import { WriteableReference, ReadableReference } from '../types/compoundTypes';
import { FloorSlot } from '../types/floorSlot';
import { Inbox, Outbox } from '../types/primitiveTypes';
import { Compiled } from './node';
import { StatementNode } from './statementNode';

export class AssignmentNode extends StatementNode {
  constructor(
    public writeable: WriteableReference,
    public readable: ReadableReference,
  ) {
    super();
  }

  compile(): Compiled {
    const result: string[] = ['-- AssignmentNode --'];

    if (this.readable === Inbox) {
      result.push('INBOX');
    }

    if (this.readable instanceof FloorSlot) {
      result.push(`COPYFROM ${this.readable.index}`);
    }

    if (this.writeable === Outbox) {
      result.push('OUTBOX');
    }

    return result;
  }
}
