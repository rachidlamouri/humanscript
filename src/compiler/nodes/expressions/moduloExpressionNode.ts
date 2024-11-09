import { CompilerContext, RegisterKey } from '../../compilerContext';
import { Compiled } from '../../compiled';
import { Assembly } from '../../assembly';
import { DivisionExpressionNode } from './divisionExpressionNode';

export class ModuloExpressionNode extends DivisionExpressionNode {
  compileExpression(context: CompilerContext): Compiled {
    const result: Compiled = [];
    result.push(...super.compileExpression(context));
    result.push(Assembly.DEBUG(context, 'read remainder'));
    result.push(Assembly.COPYFROM(context, RegisterKey.Remainder));
    context.decrementDepth();

    return result;
  }
}
