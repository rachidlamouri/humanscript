import { Merge } from 'type-fest';
import { Compiled } from '../../compiled';
import { CompilerContext } from '../../compilerContext';
import { ReadableExpression } from './readableExpression';

export type DualResultExpression = Merge<
  ReadableExpression,
  {
    compiledSecondRead(context: CompilerContext): Compiled;
  }
>;
