import {
  CompilerContext,
  FloorRange,
  RegisterKey,
} from '../../compilerContext';
import { Compiled } from '../../compiled';
import { Node } from '../node';
import { Statement } from './statement';
import { Assembly } from '../../assembly';

export class FloorInitNode extends Node implements Statement {
  constructor(
    public size: number,
    public reservation: FloorRange[],
  ) {
    super();
  }

  compileStatement(context: CompilerContext): Compiled {
    context.initFloor(this.size, this.reservation);

    const result: Compiled = [];
    result.push(Assembly.DEBUG(context, this.className));
    context.incrementDepth();
    result.push(Assembly.DEBUG_MAPPING(context, RegisterKey.Accumulator));
    result.push(Assembly.DEBUG_MAPPING(context, RegisterKey.Iterator));
    context.decrementDepth();

    return result;
  }

  flatten(accumulator: Node[]): void {
    accumulator.push(this);
  }
}
