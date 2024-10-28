import { CompilerContext } from '../../compilerContext';
import { Compiled } from '../../compiled';
import { Node } from '../node';
import { WriteableReference } from './writeableReference';
import { Assembly } from '../../assembly';

export class OutboxNode extends Node implements WriteableReference {
  compileWrite(context: CompilerContext): Compiled {
    return [Assembly.OUTBOX(context)];
  }

  flatten(accumulator: Node[]): void {
    accumulator.push(this);
  }
}
