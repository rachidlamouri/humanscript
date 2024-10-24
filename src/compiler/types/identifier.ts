import { Compiled } from '../nodes/node';
import { CompilerContext } from '../compilerContext';
import { ReadableReference } from './readableReference';
import { WriteableReference } from './writeableReference';

export class Identifier implements ReadableReference, WriteableReference {
  constructor(public name: string) {}

  compileRead(context: CompilerContext): Compiled {
    const floorIndex = context.getFloorIndex(this.name);

    return [`COPYFROM ${floorIndex}`];
  }

  compileExpression(context: CompilerContext): Compiled {
    return this.compileRead(context);
  }

  compileWrite(context: CompilerContext): Compiled {
    const floorIndex = context.getFloorIndex(this.name);

    return [`COPYTO ${floorIndex}`];
  }
}
