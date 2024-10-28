import { CompilerContext } from '../../compilerContext';
import { Compiled } from '../../compiled';
import { Statement } from './statement';
import { Assembly } from '../../assembly';
import { Node } from '../node';

export class HumanscriptCommentNode extends Node implements Statement {
  constructor(public text: string) {
    super();
  }

  compileStatement(context: CompilerContext): Compiled {
    return [Assembly.HUMANSCRIPT_COMMENT(context, this.text)];
  }

  flatten(accumulator: Node[]): void {
    accumulator.push(this);
  }
}
