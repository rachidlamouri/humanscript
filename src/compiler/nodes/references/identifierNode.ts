import { CompilerContext, RegisterKey } from '../../compilerContext';
import { Compiled } from '../../compiled';
import { ReadableReference } from './readableReference';
import { WriteableReference } from './writeableReference';
import { Node } from '../node';
import { Assembly } from '../../assembly';

export class IdentifierNode
  extends Node
  implements ReadableReference, WriteableReference
{
  constructor(public name: string) {
    super();
  }

  compileRead(context: CompilerContext): Compiled {
    return [Assembly.COPYFROM(context, this.name)];
  }

  compileExpression(context: CompilerContext): Compiled {
    return this.compileRead(context);
  }

  compileWrite(context: CompilerContext): Compiled {
    return [Assembly.COPYTO(context, this.name)];
  }

  flatten(accumulator: Node[]): void {
    accumulator.push(this);
  }
}

export class AccumulatorNode extends IdentifierNode {
  constructor() {
    super(RegisterKey.Accumulator);
  }
}

export class IteratorNode extends IdentifierNode {
  constructor() {
    super(RegisterKey.Iterator);
  }
}
