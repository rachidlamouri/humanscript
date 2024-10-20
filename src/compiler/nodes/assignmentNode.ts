import {
  Inbox,
  Outbox,
  ReadableReference,
  WriteableReference,
} from '../primitiveTypes';
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

    if (this.writeable === Outbox) {
      result.push('OUTBOX');
    }

    return result;
  }
}
