import { CompilerContext } from '../compilerContext';
import { Compiled } from '../types/compilable';
import { Node } from './node';

export class FloorInitNode extends Node {
  constructor(public size: number) {
    super();
  }

  compile(context: CompilerContext): Compiled {
    context.setFloorSize(this.size);
    return [this.compiledDebugName];
  }
}
