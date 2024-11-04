import { Compiled } from '../../compiled';
import { CompilerContext } from '../../compilerContext';

export type ConditionAnchorIds = {
  trueAnchorId?: string | undefined;
  falseAnchorId?: string | undefined;
};

export type Condition = {
  compileCondition(
    context: CompilerContext,
    anchorIds: ConditionAnchorIds,
  ): Compiled;

  jumpsIfTrue: boolean;
};
