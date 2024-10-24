import { CompilerContext, Compiled } from '../nodes/node';
import { WriteableReference } from './writeableReference';

export class Outbox implements WriteableReference {
  compileWrite(_context: CompilerContext): Compiled {
    return ['OUTBOX'];
  }
}
