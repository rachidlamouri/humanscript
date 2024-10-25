import { Compiled } from '../interfaces/compilable';
import { CompilerContext } from '../../compilerContext';
import { ReadableReference } from '../interfaces/readableReference';
import { WriteableReference } from '../interfaces/writeableReference';
import { ReferenceNode } from './referenceNode';

export class IdentifierNode
  extends ReferenceNode
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
