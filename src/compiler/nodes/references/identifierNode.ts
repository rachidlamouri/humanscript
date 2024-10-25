import { Compiled, CompilerContext } from '../../compilerContext';
import { ReadableReference } from './readableReference';
import { WriteableReference } from './writeableReference';
import { Node } from '../node';

export class IdentifierNode
  extends Node
  implements ReadableReference, WriteableReference
{
  constructor(public name: string) {
    super();
  }

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
