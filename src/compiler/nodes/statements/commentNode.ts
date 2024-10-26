import { CompilerContext, Compiled } from '../../compilerContext';
import { Statement } from './statement';

export class CommentNode implements Statement {
  constructor(public text: string) {}

  compileStatement(_context: CompilerContext): Compiled {
    return [`-- # ${this.text} --`];
  }
}
