import { Assembly } from '../../assembly';
import { Compiled } from '../../compiled';
import { CompilerContext, FloorBinding } from '../../compilerContext';
import { Node } from '../node';
import { Statement } from './statement';

export class LabelDefinitionNode extends Node implements Statement {
  constructor(public binding: FloorBinding) {
    super();
  }

  compileStatement(context: CompilerContext): Compiled {
    return [
      Assembly.LINE_FEED(context),
      Assembly.DEFINE_LABEL(context, this.binding),
    ];
  }

  flatten(accumulator: Node[]): void {
    accumulator.push(this);
  }
}
