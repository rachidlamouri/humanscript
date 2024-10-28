import { Assembly } from '../../assembly';
import { Compiled } from '../../compiled';
import { CompilerContext, FloorIndex } from '../../compilerContext';
import { Node } from '../node';
import { IdentifierNode } from '../references/identifierNode';
import { Statement } from './statement';

export class LetStatementNode extends Node implements Statement {
  constructor(
    public identifier: IdentifierNode,
    public floorIndex: FloorIndex | null,
  ) {
    super();
  }

  compileStatement(context: CompilerContext): Compiled {
    const floorKey = this.identifier.name;
    context.bindFloorSlot(floorKey, this.floorIndex);

    const result: Compiled = [];
    result.push(Assembly.DEBUG(context, this.className));
    context.incrementDepth();
    result.push(Assembly.DEBUG_MAPPING(context, floorKey));
    context.decrementDepth();

    return result;
  }

  flatten(accumulator: Node[]): void {
    accumulator.push(this);

    this.identifier.flatten(accumulator);
  }
}
