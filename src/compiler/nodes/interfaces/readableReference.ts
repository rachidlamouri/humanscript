import { Merge } from 'type-fest';
import { Compiled } from './compilable';
import { CompilerContext } from '../../compilerContext';
import { ReadableExpression } from './readableExpression';

export type ReadableReference = Merge<
  ReadableExpression,
  {
    compileRead(context: CompilerContext): Compiled;
  }
>;
