import { CompilerContext, Compiled } from '../../compilerContext';
import { Node } from '../node';
import { Statement } from './statement';

export class FloorInitNode extends Node implements Statement {
  constructor(public size: number) {
    super();
  }

  compileStatement(context: CompilerContext): Compiled {
    context.initFloor(this.size);
    return [this.compiledDebugName];
  }
}
