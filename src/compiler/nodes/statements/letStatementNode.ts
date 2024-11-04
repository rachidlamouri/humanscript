import { Assembly } from '../../assembly';
import { Compiled } from '../../compiled';
import { CompilerContext, FloorIndex } from '../../compilerContext';
import { Node } from '../node';
import { IdentifierNode } from '../references/identifierNode';
import { Statement } from './statement';

export class LetStatementNode extends Node implements Statement {
  floorKey: string;
  label: string;

  constructor(
    public identifier: IdentifierNode,
    label: string | null,
    public floorIndex: FloorIndex | null,
  ) {
    super();

    const floorKey = identifier.name;

    this.floorKey = floorKey;
    this.label = label ?? floorKey;
  }

  compileStatement(context: CompilerContext): Compiled {
    context.bindFloorSlot(this.floorKey, this.label, this.floorIndex);

    const result: Compiled = [];
    result.push(Assembly.DEBUG(context, this.className));
    context.incrementDepth();
    result.push(Assembly.DEBUG_MAPPING(context, this.floorKey));
    context.decrementDepth();

    return result;
  }

  flatten(accumulator: Node[]): void {
    accumulator.push(this);

    this.identifier.flatten(accumulator);
  }
}
