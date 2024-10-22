import { Identifier } from 'typescript';
import { AssignmentNode } from '../nodes/assignmentNode';
import { Inbox, Hand, Outbox } from './primitiveTypes';
import { FloorSlot } from './floorSlot';

export type ReadableReference =
  | typeof Inbox
  | typeof Hand
  | Identifier
  | FloorSlot;

export type WriteableReference = typeof Outbox | typeof Hand | Identifier;

export type Statement = AssignmentNode;
