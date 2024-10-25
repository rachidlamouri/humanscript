import { Merge } from 'type-fest';
import { CompilerContext, Compiled } from '../../compilerContext';
import { ReadableExpression } from '../expressions/readableExpression';

export type ReadableReference = Merge<
  ReadableExpression,
  {
    compileRead(context: CompilerContext): Compiled;
  }
>;
