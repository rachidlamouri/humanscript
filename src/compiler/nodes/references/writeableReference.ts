import { CompilerContext } from '../../compilerContext';
import { Compiled } from '../../compiled';

export type WriteableReference = {
  compileWrite(context: CompilerContext): Compiled;
};
