import { Constructor } from 'type-fest';
import { ReadableReference } from '../references/readableReference';
import { ZeroLiteralNode } from '../zeroLiteralNode';
import { Condition } from './condition';
import { Readable } from '../references/readable';

export type LeftComparable = Readable;

export type RightComparable = ReadableReference | ZeroLiteralNode;

export type BinaryComparisonConstructor = Constructor<
  Condition,
  [left: LeftComparable, right: RightComparable]
>;
