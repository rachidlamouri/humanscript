import { Merge } from 'type-fest';
import { ReadableExpression } from '../expressions/readableExpression';
import { Readable } from './readable';

export type ReadableReference = Merge<Readable, ReadableExpression>;
