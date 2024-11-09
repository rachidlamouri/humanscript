import { Compiled } from '../../compiled';
import { CompilerContext } from '../../compilerContext';

export type Readable = {
  compileRead(context: CompilerContext): Compiled;
};
