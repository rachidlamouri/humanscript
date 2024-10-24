import { Compiled } from '../nodes/node';
import { CompilerContext } from '../compilerContext';

export type ReadableExpression = {
  compileExpression(context: CompilerContext): Compiled;
};
