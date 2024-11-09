import { Compiled } from '../../compiled';
import { CompilerContext } from '../../compilerContext';
import { assertIsNode, Node } from '../node';
import { Condition, ConditionAnchorIds } from './condition';

export class AndConditionNode extends Node implements Condition {
  jumpsIfTrue = true;

  constructor(
    public left: Condition,
    public right: Condition,
  ) {
    super();
  }

  compileCondition(
    context: CompilerContext,
    anchorIds: ConditionAnchorIds,
  ): Compiled {
    return [
      ...this.left.compileCondition(context, anchorIds),
      ...this.right.compileCondition(context, anchorIds),
    ];
  }

  flatten(accumulator: Node[]): void {
    accumulator.push(this);

    assertIsNode(this.left);
    assertIsNode(this.right);

    accumulator.push(this.left);
    accumulator.push(this.right);
  }
}
