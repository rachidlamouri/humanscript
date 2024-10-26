import { CompilerContext } from '../../compilerContext';
import { Compiled } from '../../compiled';

export type Statement = {
  compileStatement(context: CompilerContext): Compiled;
};

export function assertIsStatement(value: unknown): asserts value is Statement {
  if (
    typeof value === 'object' &&
    value !== null &&
    'compileStatement' in value
  ) {
    return;
  }

  throw new Error('Expected a Statement');
}
