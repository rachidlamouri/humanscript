import { CompilerContext } from '../../compilerContext';
import { Compiled } from '../../compiled';

export type ReadableExpression = {
  compileExpression(context: CompilerContext): Compiled;
};
