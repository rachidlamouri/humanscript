import { Constructor } from 'type-fest';
import { FlooredDivisionExpressionNode } from './flooredDivisionExpressionNode';
import { ModuloExpressionNode } from './moduloExpressionNode';
import { MultiplicationExpressionNode } from './multiplicationExpressionNode';

export type MultiplicativeExpressionNode =
  | MultiplicationExpressionNode
  | FlooredDivisionExpressionNode
  | ModuloExpressionNode;

export type MultiplicativeExpressionNodeConstructor =
  Constructor<MultiplicativeExpressionNode>;
