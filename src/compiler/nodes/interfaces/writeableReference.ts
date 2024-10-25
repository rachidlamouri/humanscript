import { Compiled } from './compilable';
import { CompilerContext } from '../../compilerContext';

export type WriteableReference = {
  compileWrite(context: CompilerContext): Compiled;
};
