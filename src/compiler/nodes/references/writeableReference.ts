import { CompilerContext, Compiled } from '../../compilerContext';

export type WriteableReference = {
  compileWrite(context: CompilerContext): Compiled;
};
