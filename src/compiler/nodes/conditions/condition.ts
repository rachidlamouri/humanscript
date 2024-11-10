import { Constructor } from 'type-fest';
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

export type CompoundConditionConstructor = Constructor<
  Condition,
  [left: Condition, right: Condition]
>;

export const isCondition = (value: unknown): value is Condition => {
  return (
    typeof value === 'object' && value !== null && 'compileCondition' in value
  );
};
