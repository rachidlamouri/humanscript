import { AdditionExpressionNode } from './additionExpressionNode';
import { SubtractionExpressionNode } from './subtractionExpressionNode';

export type BinaryMathExpressionNode =
  | AdditionExpressionNode
  | SubtractionExpressionNode;
