import { Assembly } from '../../../assembly';
import { Compiled } from '../../../compiled';
import { CompilerContext } from '../../../compilerContext';
import { Node } from '../../node';
import { Statement } from '../statement';

export class AssemblyCommentReferenceNode extends Node implements Statement {
  constructor(public text: string) {
    super();
  }

  compileStatement(context: CompilerContext): Compiled {
    const index = context.createCommentIndex(this);
    const result = [Assembly.COMMENT(context, index)];

    return result;
  }

  flatten(accumulator: Node[]): void {
    accumulator.push(this);
  }
}
