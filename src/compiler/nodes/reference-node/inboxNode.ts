import { CompilerContext, Compiled } from '../../compilerContext';
import { Node } from '../node';
import { ReadableReference } from './readableReference';

export class InboxNode extends Node implements ReadableReference {
  compileRead(_context: CompilerContext): Compiled {
    return ['INBOX'];
  }

  compileExpression(context: CompilerContext): Compiled {
    return this.compileRead(context);
  }
}
