import { CompilerContext, RegisterKey } from '../../compilerContext';
import { Compiled } from '../../compiled';
import { ReadableExpression } from './readableExpression';
import { assertIsNode, Node } from '../node';
import { Assembly } from '../../assembly';
import {
  AccumulatorNode,
  IdentifierNode,
  IteratorNode,
} from '../references/identifierNode';
import { WhileStatementNode } from '../statements/whileStatementNode';
import { GreaterThanConditionNode } from '../conditions/greaterThanConditionNode';
import { ZeroLiteralNode } from '../zeroLiteralNode';
import { BlockNode } from '../statements/blockNode';
import { DecrementAssignmentStatementNode } from '../statements/decrementAssignmentStatementNode';
import { AdditionExpressionNode } from './additionExpressionNode';
import { AssignmentStatementNode } from '../statements/assignmentStatementNode';

export class MultiplicationExpressionNode
  extends Node
  implements ReadableExpression
{
  constructor(
    public multiplicand: IdentifierNode,
    public multiplier: IdentifierNode,
  ) {
    super();
  }

  compileExpression(context: CompilerContext): Compiled {
    const iterator = new IteratorNode();
    const accumulator = new AccumulatorNode();

    const multiplication = new WhileStatementNode(
      new GreaterThanConditionNode(iterator, new ZeroLiteralNode()),
      new BlockNode([
        // -
        new AssignmentStatementNode(
          accumulator,
          new AdditionExpressionNode(accumulator, this.multiplicand),
        ),
        new DecrementAssignmentStatementNode(iterator),
      ]),
    );

    const result: Compiled = [];
    result.push(Assembly.DEBUG(context, this.className));
    context.incrementDepth();
    result.push(Assembly.DEBUG(context, 'zero the accumulator'));
    result.push(...this.multiplicand.compileRead(context));
    result.push(Assembly.COPYTO(context, RegisterKey.Accumulator));
    result.push(Assembly.SUB(context, RegisterKey.Accumulator));
    result.push(Assembly.COPYTO(context, RegisterKey.Accumulator));
    result.push(Assembly.DEBUG(context, 'set the iterator'));
    result.push(...this.multiplier.compileRead(context));
    result.push(Assembly.COPYTO(context, RegisterKey.Iterator));
    result.push(Assembly.DEBUG(context, 'multiply'));
    result.push(...multiplication.compileStatement(context));
    result.push(Assembly.COPYFROM(context, RegisterKey.Accumulator));
    context.decrementDepth();

    return result;
  }

  flatten(accumulator: Node[]): void {
    accumulator.push(this);

    assertIsNode(this.multiplicand);
    assertIsNode(this.multiplier);

    this.multiplicand.flatten(accumulator);
    this.multiplier.flatten(accumulator);
  }
}
