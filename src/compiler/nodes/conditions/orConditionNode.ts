import { Assembly } from '../../assembly';
import { Compiled } from '../../compiled';
import { CompilerContext } from '../../compilerContext';
import { assertIsNode, Node } from '../node';
import { Condition, ConditionContext } from './condition';

export class OrConditionNode extends Node implements Condition {
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

    const result: Compiled = [];
    result.push(Assembly.DEBUG(context, this.className));
    context.incrementDepth();
    result.push(Assembly.DEBUG(context, 'left'));
    result.push(
      ...this.left.compileCondition(context, {
        trueAnchorId,
        falseAnchorId: fallthroughAnchorId,
        anchorIdSuffix: anchorIdSuffix + 'left',
        anchorDepth: anchorDepth + 1,
      }),
    );
    context.decrementDepth();
    result.push(Assembly.ANCHOR(context, fallthroughAnchorId));
    context.incrementDepth();
    result.push(Assembly.DEBUG(context, 'right'));
    result.push(
      ...this.right.compileCondition(context, {
        trueAnchorId,
        falseAnchorId,
        anchorIdSuffix: anchorIdSuffix + 'right',
        anchorDepth: anchorDepth + 1,
      }),
    );
    context.decrementDepth();
    result.push(Assembly.DEBUG(context, `/${this.className}`));

    return result;
  }

  flatten(accumulator: Node[]): void {
    accumulator.push(this);

    assertIsNode(this.left);
    assertIsNode(this.right);

    accumulator.push(this.left);
    accumulator.push(this.right);
  }
}
