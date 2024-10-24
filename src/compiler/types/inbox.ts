import { CompilerContext, Compiled } from '../nodes/node';
import { ReadableReference } from './readableReference';

export class Inbox implements ReadableReference {
  compileRead(_context: CompilerContext): Compiled {
    return ['INBOX'];
  }

  compileExpression(context: CompilerContext): Compiled {
    return this.compileRead(context);
  }
}
