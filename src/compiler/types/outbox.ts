import { Compiled } from '../nodes/node';
import { CompilerContext } from '../compilerContext';
import { WriteableReference } from './writeableReference';

export class Outbox implements WriteableReference {
  compileWrite(_context: CompilerContext): Compiled {
    return ['OUTBOX'];
  }
}
