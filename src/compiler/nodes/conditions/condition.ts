import { Compiled } from '../../compiled';
import { CompilerContext } from '../../compilerContext';

export type ConditionContext = {
  trueAnchorId: string;
  falseAnchorId: string;
  anchorIdSuffix: string;
  anchorDepth: number;
};

export type Condition = {
  compileCondition(
    context: CompilerContext,
    anchorIds: ConditionContext,
  ): Compiled;
};
