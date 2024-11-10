import { Assembly } from '../../assembly';
import { Compiled } from '../../compiled';
import { CompilerContext, RegisterKey } from '../../compilerContext';
import { Node } from '../node';
import { Statement } from './statement';
import { FloorReferenceNode } from '../references/floorReferenceNode';

export class SwapStatementNode extends Node implements Statement {
  constructor(
    public left: FloorReferenceNode,
    public right: FloorReferenceNode,
  ) {
    super();
  }

  compileStatement(context: CompilerContext): Compiled {
    const result: Compiled = [];

    result.push(...this.left.compileRead(context));
    result.push(Assembly.COPYTO(context, RegisterKey.Accumulator));
    result.push(...this.right.compileRead(context));
    result.push(...this.left.compileWrite(context));
    result.push(Assembly.COPYFROM(context, RegisterKey.Accumulator));
    result.push(...this.right.compileWrite(context));

    return result;
  }

  flatten(accumulator: Node[]): void {
    accumulator.push(this);

    accumulator.push(this.left);
    accumulator.push(this.right);
  }
}
