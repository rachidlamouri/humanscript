import { Compiled, CompilerContext } from '../../compilerContext';

export type ReadableExpression = {
  compileExpression(context: CompilerContext): Compiled;
};
