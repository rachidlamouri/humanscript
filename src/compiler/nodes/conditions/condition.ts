import { Compiled } from '../../compiled';
import { CompilerContext } from '../../compilerContext';

export type ConditionLabels = {
  trueLabel?: string | undefined;
  falseLabel?: string | undefined;
};

export type Condition = {
  compileCondition(context: CompilerContext, labels: ConditionLabels): Compiled;

  jumpsIfTrue: boolean;
};
