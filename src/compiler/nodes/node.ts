import { CompilerContext } from '../compilerContext';

export type Compiled = string[];

export abstract class Node {
  abstract compile(context: CompilerContext): Compiled;

  get compiledDebugName(): string {
    return `-- ${this.constructor.name} --`;
  }
}
