import { Compiled, CompilerContext } from '../nodes/node';

export type WriteableReference = {
  compileWrite(context: CompilerContext): Compiled;
};
