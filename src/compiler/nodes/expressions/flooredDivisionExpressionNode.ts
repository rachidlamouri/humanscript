import { CompilerContext, RegisterKey } from '../../compilerContext';
import { Compiled } from '../../compiled';
import { Assembly } from '../../assembly';
import { DivisionExpressionNode } from './divisionExpressionNode';

export class FlooredDivisionExpressionNode extends DivisionExpressionNode {
  compileExpression(context: CompilerContext): Compiled {
    const result: Compiled = [];
    result.push(...super.compileExpression(context));
    result.push(Assembly.DEBUG(context, 'read quotient'));
    result.push(Assembly.COPYFROM(context, RegisterKey.Quotient));
    context.decrementDepth();

    return result;
  }
}
