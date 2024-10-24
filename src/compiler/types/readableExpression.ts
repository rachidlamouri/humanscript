import { Compiled, CompilerContext } from '../nodes/node';

export type ReadableExpression = {
  compileExpression(context: CompilerContext): Compiled;
};
