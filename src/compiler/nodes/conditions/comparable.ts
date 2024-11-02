import { Constructor } from 'type-fest';
import { ReadableReference } from '../references/readableReference';
import { ZeroLiteralNode } from '../zeroLiteralNode';
import { Condition } from './condition';

export type Comparable = ReadableReference | ZeroLiteralNode;

export type BinaryComparisonConstructor = Constructor<
  Condition,
  [left: ReadableReference, right: Comparable]
>;
