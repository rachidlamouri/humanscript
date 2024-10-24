import { Compiled } from './compilable';
import { CompilerContext } from '../compilerContext';

export type ReadableExpression = {
  compileExpression(context: CompilerContext): Compiled;
};
