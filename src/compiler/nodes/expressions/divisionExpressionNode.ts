import { Assembly } from '../../assembly';
import { Compiled } from '../../compiled';
import { CompilerContext, RegisterKey } from '../../compilerContext';
import { GreaterThanOrEqualToConditionNode } from '../conditions/greaterThanOrEqualToConditionNode';
import { assertIsNode, Node } from '../node';
import { FloorReferenceNode } from '../references/floorReferenceNode';
import {
  IdentifierNode,
  QuotientNode,
  RemainderNode,
} from '../references/identifierNode';
import { AssignmentStatementNode } from '../statements/assignmentStatementNode';
import { BlockNode } from '../statements/blockNode';
import { IncrementAssignmentStatementNode } from '../statements/incrementAssignmentStatementNode';
import { WhileStatementNode } from '../statements/whileStatementNode';
import { ZeroLiteralNode } from '../zeroLiteralNode';
import { ReadableExpression } from './readableExpression';
import { SubtractionExpressionNode } from './subtractionExpressionNode';

export abstract class DivisionExpressionNode
  extends Node
  implements ReadableExpression
{
  constructor(
    public dividend: FloorReferenceNode,
    public divisor: FloorReferenceNode,
  ) {
    super();
  }

  compileExpression(context: CompilerContext): Compiled {
    const remainder = new RemainderNode();
    const flooredQuotient = new QuotientNode();

    const division = new BlockNode([
      new WhileStatementNode(
        new GreaterThanOrEqualToConditionNode(remainder, new ZeroLiteralNode()),
        new BlockNode([
          new AssignmentStatementNode(
            remainder,
            new SubtractionExpressionNode(remainder, this.divisor),
          ),
          new IncrementAssignmentStatementNode(flooredQuotient),
        ]),
      ),
    ]);

    const result: Compiled = [];
    result.push(Assembly.DEBUG(context, this.className));
    context.incrementDepth();

    result.push(Assembly.DEBUG(context, 'set the remainder'));
    result.push(...this.dividend.compileRead(context));
    result.push(Assembly.COPYTO(context, RegisterKey.Remainder));

    result.push(Assembly.DEBUG(context, 'zero the floored quotient'));
    result.push(...this.dividend.compileRead(context));
    result.push(Assembly.COPYTO(context, RegisterKey.Quotient));
    result.push(Assembly.SUB(context, RegisterKey.Quotient));
    result.push(Assembly.COPYTO(context, RegisterKey.Quotient));

    result.push(Assembly.DEBUG(context, 'divide'));
    result.push(...division.compile(context));

    result.push(Assembly.DEBUG(context, 'adjust quotient'));
    result.push(Assembly.BUMP_DN(context, RegisterKey.Quotient));

    result.push(Assembly.DEBUG(context, 'adjust remainder'));
    result.push(...this.divisor.compileRead(context));
    result.push(Assembly.ADD(context, RegisterKey.Remainder));
    result.push(Assembly.COPYTO(context, RegisterKey.Remainder));

    return result;
  }

  flatten(accumulator: Node[]): void {
    accumulator.push(this);

    assertIsNode(this.dividend);
    assertIsNode(this.divisor);

    this.dividend.flatten(accumulator);
    this.divisor.flatten(accumulator);
  }
}
