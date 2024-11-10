import { CompilerContext, RegisterKey } from '../../compilerContext';
import { Compiled } from '../../compiled';
import { Assembly } from '../../assembly';
import { DivisionExpressionNode } from './divisionExpressionNode';
import { DualResultExpression } from './dualResultExpression';

export class FlooredDivisionExpressionNode
  extends DivisionExpressionNode
  implements DualResultExpression
{
  compileExpression(context: CompilerContext): Compiled {
    const result: Compiled = [];
    result.push(...super.compileExpression(context));
    result.push(Assembly.DEBUG(context, 'read quotient'));
    result.push(Assembly.COPYFROM(context, RegisterKey.Quotient));
    context.decrementDepth();

    return result;
  }

  compiledSecondRead(context: CompilerContext): Compiled {
    return [
      // -
      Assembly.DEBUG(context, 'read remainder'),
      Assembly.COPYFROM(context, RegisterKey.Remainder),
    ];
  }
}
