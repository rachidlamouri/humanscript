import { CompilerContext } from '../compilerContext';

export type Compiled = string[];

export type Compilable = {
  compile: (context: CompilerContext) => Compiled;
};
