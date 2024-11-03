import { assertIsNotUndefined } from '../utils/assertIsNotUndefined';
import { IdentifierNode } from './nodes/references/identifierNode';
export type FloorIndex = number;

export type FloorIndexKey = IdentifierNode['name'];

export enum RegisterKey {
  Accumulator = 'accumulator',
  Iterator = 'iterator',
}

const reservedWords = new Set([
  // -
  'floor',
  'let',
  'inbox',
  'outbox',
  'while',
  'if',
  RegisterKey.Accumulator,
  RegisterKey.Iterator,
]);

class FloorSlot {
  isBound = false;

  constructor(public index: number) {}

  bind() {
    this.isBound = true;
  }
}

export class CompilerContext {
  floor: FloorSlot[] | null = null;
  floorSlotByIndex = new Map<FloorIndex, FloorSlot>();
  floorIndexByKey = new Map<FloorIndexKey, FloorIndex>();

  jumpCount = 0;

  commentIndexByKey = new Map<unknown, number>();

  outputDepth = 0;

  incrementDepth(): never[] {
    this.outputDepth += 1;
    return [];
  }

  decrementDepth(): never[] {
    this.outputDepth -= 1;
    return [];
  }

  get floorSize() {
    return this.floor?.length ?? 0;
  }

  initFloor(floorSize: number): void {
    if (this.floor !== null) {
      throw new Error('Floor has already been initialized');
    }

    this.floor = Array.from({ length: floorSize }).map((_, index) => {
      const slot = new FloorSlot(index);
      this.floorSlotByIndex.set(index, slot);
      return slot;
    });
  }

  bindReservedRegisterKey(key: RegisterKey): FloorIndex {
    const existingIndex = this.floorIndexByKey.get(key);

    if (existingIndex !== undefined) {
      return existingIndex;
    }

    this.performBind(key, null);
    const index = this.getFloorIndex(key);

    return index;
  }

  private performBind(key: FloorIndexKey, index: FloorIndex | null) {
    if (this.floorIndexByKey.has(key)) {
      throw new Error(`Floor key "${key}" is already bound`);
    }

    let slot: FloorSlot;

    if (index === null) {
      const nextUnboundSlot = this.floor?.find((slot) => !slot.isBound);

      if (nextUnboundSlot === undefined) {
        throw new Error(
          `Not enough floor to bind ${typeof key} key "${key.toString()}"`,
        );
      }

      slot = nextUnboundSlot;
    } else {
      const slotAtIndex = this.floorSlotByIndex.get(index);

      if (slotAtIndex === undefined) {
        throw new Error(
          `Invalid index "${index}" for floor size ${this.floorSize}`,
        );
      }

      slot = slotAtIndex;
    }

    slot.bind();
    this.floorIndexByKey.set(key, slot.index);
  }

  bindFloorSlot(key: FloorIndexKey, index: FloorIndex | null): void {
    if (reservedWords.has(key)) {
      throw new Error(`Invalid floor key: "${key}" is a reserved word`);
    }

    this.performBind(key, index);
  }

  getFloorIndex(key: FloorIndexKey): FloorIndex {
    const index = this.floorIndexByKey.get(key);

    if (index === undefined) {
      throw new Error(`Unknown ${typeof key} identifier: "${key.toString()}"`);
    }

    return index;
  }

  createJumpLabelSuffix(): string {
    if (this.jumpCount >= 100) {
      throw new Error('Too many jumps!');
    }

    const suffix = this.jumpCount.toString().padStart(2, '0'); // String.fromCharCode(A_CHAR_CODE + this.jumpCount);

    this.jumpCount += 1;

    return suffix;
  }

  createCommentIndex(key: unknown): number {
    const index = this.commentIndexByKey.size;

    this.commentIndexByKey.set(key, index);

    return index;
  }

  getCommentIndex(key: unknown): number {
    const index = this.commentIndexByKey.get(key);
    assertIsNotUndefined(index);
    return index;
  }
}
