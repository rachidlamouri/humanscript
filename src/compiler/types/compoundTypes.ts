import { Inbox, Hand, Outbox, Identifier } from './primitiveTypes';
import { FloorSlot } from './floorSlot';

export type ReadableReference =
  | typeof Inbox
  | typeof Hand
  | Identifier
  | FloorSlot;

export type WriteableReference = typeof Outbox | typeof Hand | Identifier;
