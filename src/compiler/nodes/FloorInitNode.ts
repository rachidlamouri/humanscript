import { CompilerContext } from '../compilerContext';
import { Compiled } from './interfaces/compilable';
import { Node } from './node';

export class FloorInitNode extends Node {
  constructor(public size: number) {
    super();
  }

  compile(context: CompilerContext): Compiled {
    context.initFloor(this.size);
    return [this.compiledDebugName];
  }
}
