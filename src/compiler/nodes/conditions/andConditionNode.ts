import { Assembly } from '../../assembly';
import { Compiled } from '../../compiled';
import { CompilerContext } from '../../compilerContext';
import { assertIsNode, Node } from '../node';
import { Condition, ConditionContext } from './condition';

export class AndConditionNode extends Node implements Condition {
  constructor(
    public left: Condition,
    public right: Condition,
  ) {
    super();
  }

  compileCondition(
    context: CompilerContext,
    {
      trueAnchorId,
      falseAnchorId,
      anchorIdSuffix,
      anchorDepth,
    }: ConditionContext,
  ): Compiled {
    const subconditionSuffix = anchorDepth.toString().padStart(2, '0');
    const fallthroughAnchorId = `condition${anchorIdSuffix}sub${subconditionSuffix}`;

    return [
      ...this.left.compileCondition(context, {
        trueAnchorId: fallthroughAnchorId,
        falseAnchorId: falseAnchorId,
        anchorIdSuffix,
        anchorDepth: anchorDepth + 1,
      }),
      Assembly.ANCHOR(context, fallthroughAnchorId),
      ...this.right.compileCondition(context, {
        trueAnchorId,
        falseAnchorId,
        anchorIdSuffix,
        anchorDepth: anchorDepth + 1,
      }),
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
