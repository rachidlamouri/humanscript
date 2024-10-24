import { Merge } from 'type-fest';
import { Compiled, CompilerContext } from '../nodes/node';
import { ReadableExpression } from './readableExpression';

export type ReadableReference = Merge<
  ReadableExpression,
  {
    compileRead(context: CompilerContext): Compiled;
  }
>;
