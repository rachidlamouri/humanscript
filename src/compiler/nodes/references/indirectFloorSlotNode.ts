import { Assembly } from '../../assembly';
import { Compiled } from '../../compiled';
import { CompilerContext } from '../../compilerContext';
import { Node } from '../node';
import { ReadableReference } from './readableReference';
import { WriteableReference } from './writeableReference';

export class IndirectFloorSlotNode
  extends Node
  implements ReadableReference, WriteableReference
{
  constructor(public key: string) {
    super();
  }

  compileRead(context: CompilerContext): Compiled {
    return [Assembly.COPYFROM_REF(context, this.key)];
  }

  compileExpression(context: CompilerContext): Compiled {
    return this.compileRead(context);
  }

  compileWrite(context: CompilerContext): Compiled {
    return [Assembly.COPYTO_REF(context, this.key)];
  }

  flatten(accumulator: Node[]): void {
    accumulator.push(this);
  }
}
