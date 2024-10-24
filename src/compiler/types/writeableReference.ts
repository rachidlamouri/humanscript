import { Compiled } from '../nodes/node';
import { CompilerContext } from '../compilerContext';

export type WriteableReference = {
  compileWrite(context: CompilerContext): Compiled;
};
