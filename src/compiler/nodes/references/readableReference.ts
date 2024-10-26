import { Merge } from 'type-fest';
import { CompilerContext } from '../../compilerContext';
import { Compiled } from '../../compiled';
import { ReadableExpression } from '../expressions/readableExpression';

export type ReadableReference = Merge<
  ReadableExpression,
  {
    compileRead(context: CompilerContext): Compiled;
  }
>;
