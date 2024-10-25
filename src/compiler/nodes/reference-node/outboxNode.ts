import { Compiled } from '../interfaces/compilable';
import { CompilerContext } from '../../compilerContext';
import { WriteableReference } from '../interfaces/writeableReference';

export class OutboxNode implements WriteableReference {
  compileWrite(_context: CompilerContext): Compiled {
    return ['OUTBOX'];
  }
}
