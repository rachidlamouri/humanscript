import { AdditionExpressionNode } from './additionExpressionNode';
import { SubtractionExpressionNode } from './subtractionExpressionNode';

export type AdditiveExpressionNode =
  | AdditionExpressionNode
  | SubtractionExpressionNode;
