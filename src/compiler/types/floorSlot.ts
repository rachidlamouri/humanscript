import { Compiled } from '../nodes/node';
import { CompilerContext } from '../compilerContext';
import { ReadableReference } from './readableReference';

export type FloorIndex = number;

export class FloorSlot implements ReadableReference {
  constructor(public index: FloorIndex) {}

  compileRead(_context: CompilerContext): Compiled {
    return [`COPYFROM ${this.index}`];
  }

  compileExpression(context: CompilerContext): Compiled {
    return this.compileRead(context);
  }
}
