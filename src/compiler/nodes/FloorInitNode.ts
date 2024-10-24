import { CompilerContext } from '../compilerContext';
import { Compiled, Node } from './node';

export class FloorInitNode extends Node {
  constructor(public size: number) {
    super();
  }

  compile(context: CompilerContext): Compiled {
    context.setFloorSize(this.size);
    return [];
  }
}
