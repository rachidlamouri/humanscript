import { CompilerContext, Compiled } from '../../compilerContext';
import { Node } from '../node';
import { WriteableReference } from './writeableReference';

export class OutboxNode extends Node implements WriteableReference {
  compileWrite(_context: CompilerContext): Compiled {
    return ['OUTBOX'];
  }
}
