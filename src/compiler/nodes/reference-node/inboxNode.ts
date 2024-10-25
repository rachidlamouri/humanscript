import { Compiled } from '../interfaces/compilable';
import { CompilerContext } from '../../compilerContext';
import { ReadableReference } from '../interfaces/readableReference';
import { ReferenceNode } from './referenceNode';

export class InboxNode extends ReferenceNode implements ReadableReference {
  compileRead(_context: CompilerContext): Compiled {
    return ['INBOX'];
  }

  compileExpression(context: CompilerContext): Compiled {
    return this.compileRead(context);
  }
}
