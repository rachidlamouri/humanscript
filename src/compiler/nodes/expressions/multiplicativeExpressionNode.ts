import { Constructor } from 'type-fest';
import { FlooredDivisionExpressionNode } from './flooredDivisionExpressionNode';
import { ModuloExpressionNode } from './moduloExpressionNode';
import { MultiplicationExpressionNode } from './multiplicationExpressionNode';
import { FloorReferenceNode } from '../references/floorReferenceNode';

export type MultiplicativeExpressionNode =
  | MultiplicationExpressionNode
  | FlooredDivisionExpressionNode
  | ModuloExpressionNode;

export type MultiplicativeExpressionNodeConstructor = Constructor<
  MultiplicativeExpressionNode,
  [left: FloorReferenceNode, right: FloorReferenceNode]
>;
