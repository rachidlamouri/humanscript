import { CompilerContext } from '../compilerContext';
import { Compilable, Compiled } from './interfaces/compilable';

export abstract class Node implements Compilable {
  abstract compile(context: CompilerContext): Compiled;

  get compiledDebugName(): string {
    return `-- ${this.constructor.name} --`;
  }
}
