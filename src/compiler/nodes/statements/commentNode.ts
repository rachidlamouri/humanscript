import { CompilerContext } from '../../compilerContext';
import { Compiled } from '../../compiled';
import { Statement } from './statement';
import { Assembly } from '../../assembly';

export class CommentNode implements Statement {
  constructor(public text: string) {}

  compileStatement(context: CompilerContext): Compiled {
    return [Assembly.COMMENT(context, this.text)];
  }
}
