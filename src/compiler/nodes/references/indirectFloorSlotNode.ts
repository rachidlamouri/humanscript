import { Assembly } from '../../assembly';
import { Compiled } from '../../compiled';
import { CompilerContext } from '../../compilerContext';
import { Node } from '../node';
import { IdentifierNode } from './identifierNode';
import { ReadableReference } from './readableReference';

export class IndirectFloorSlotNode extends Node implements ReadableReference {
  constructor(public identifier: IdentifierNode) {
    super();
  }

  compileRead(context: CompilerContext): Compiled {
    return [Assembly.COPYFROM_REF(context, this.identifier.name)];
  }

  compileExpression(context: CompilerContext): Compiled {
    return this.compileRead(context);
  }

  flatten(accumulator: Node[]): void {
    accumulator.push(this);
  }
}
