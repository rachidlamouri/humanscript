import { CompilerContext } from '../compilerContext';
import { Compiled } from '../types/compilable';
import { Node } from './node';

export class ConditionNode extends Node {
  constructor() {
    super();
  }

  compile(context: CompilerContext): Compiled {
   throw new Error('not implemented');
  }
}
