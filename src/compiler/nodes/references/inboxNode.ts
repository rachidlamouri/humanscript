import { CompilerContext } from '../../compilerContext';
import { Compiled } from '../../compiled';
import { Node } from '../node';
import { ReadableReference } from './readableReference';
import { Assembly } from '../../assembly';

export class InboxNode extends Node implements ReadableReference {
  compileRead(context: CompilerContext): Compiled {
    return [Assembly.INBOX(context)];
  }

  compileExpression(context: CompilerContext): Compiled {
    return this.compileRead(context);
  }

  flatten(accumulator: Node[]): void {
    accumulator.push(this);
  }
}
