import { CompilerContext } from '../../compilerContext';
import { Compiled } from '../interfaces/compilable';
import { Node } from '../node';

export abstract class ReferenceNode extends Node {
  compile(_context: CompilerContext): Compiled {
    // use interfaces like ReadableReference and WriteableReference instead
    throw new Error('Not implemented');
  }
}
