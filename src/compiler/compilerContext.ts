import { assertIsNotUndefined } from '../utils/assertIsNotUndefined';
import { IdentifierNode } from './nodes/references/identifierNode';

export type FloorIndex = number;

export type FloorRange = [inclusiveStart: FloorIndex, inclusiveEnd: FloorIndex];

export type FloorIndexKey = IdentifierNode['name'];

export enum RegisterKey {
  Accumulator = '$accumulator',
  Iterator = '$iterator',
  Quotient = '$quotient',
  Remainder = '$remainder',
}

const isRegisterKey = (value: string): value is RegisterKey => {
  return Object.values<string>(RegisterKey).includes(value);
};

const shorthandLengthByKey: Record<RegisterKey, number> = {
  [RegisterKey.Accumulator]: 4,
  [RegisterKey.Iterator]: 5,
  [RegisterKey.Quotient]: 5,
  [RegisterKey.Remainder]: 4,
};

const reservedWords = new Set([
  // -
  'floor',
  'let',
  'inbox',
  'outbox',
  'while',
  'if',
  'labeled',
  RegisterKey.Accumulator,
  RegisterKey.Iterator,
]);

class FloorSlot {
  isBound = false;

  constructor(
    public index: number,
    public isReserved: boolean,
  ) {}

  bind() {
    this.isBound = true;
  }
}

export type FloorBinding = {
  key: string;
  label: string;
  index: number;
};

export class CompilerContext {
  floor: FloorSlot[] | null = null;
  floorSlotByIndex = new Map<FloorIndex, FloorSlot>();
  floorBindingByKey = new Map<FloorIndexKey, FloorBinding>();

  anchorCount = 0;

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

  initFloor(floorSize: number, reservation: FloorRange[]): void {
    if (this.floor !== null) {
      throw new Error('Floor has already been initialized');
    }

    reservation.forEach(([start, end]) => {
      if (end < start) {
        throw new Error(`Invalid reservation range ${start}-${end}`);
      }
    });

    const reservedIndices = new Set(
      reservation.flatMap((range) => {
        return Array.from({ length: range[1] - range[0] + 1 }).map(
          (_, index) => {
            return range[0] + index;
          },
        );
      }),
    );

    this.floor = Array.from({ length: floorSize }).map((_, index) => {
      const isReserved = reservedIndices.has(index);
      const slot = new FloorSlot(index, isReserved);
      this.floorSlotByIndex.set(index, slot);
      return slot;
    });
  }

  private bindReservedRegisterKey(key: RegisterKey): FloorIndex {
    const existingBinding = this.floorBindingByKey.get(key);

    if (existingBinding !== undefined) {
      return existingBinding.index;
    }

    const label = key.substring(0, shorthandLengthByKey[key]);

    this.performBind(key, label, null);
    const index = this.getFloorIndex(key);

    return index;
  }

  private performBind(
    key: FloorIndexKey,
    label: string,
    index: FloorIndex | null,
  ) {
    if (this.floorBindingByKey.has(key)) {
      throw new Error(`Floor key "${key}" is already bound`);
    }

    let slot: FloorSlot;

    if (index === null) {
      const nextUnboundSlot = this.floor?.find(
        (slot) => !slot.isReserved && !slot.isBound,
      );

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
    this.floorBindingByKey.set(key, {
      key,
      label,
      index: slot.index,
    });
  }

  bindFloorSlot(
    key: FloorIndexKey,
    label: string,
    index: FloorIndex | null,
  ): void {
    if (reservedWords.has(key)) {
      throw new Error(`Invalid floor key: "${key}" is a reserved word`);
    }

    this.performBind(key, label, index);
  }

  getFloorIndex(key: FloorIndexKey): FloorIndex {
    if (isRegisterKey(key)) {
      return this.bindReservedRegisterKey(key);
    }

    const binding = this.floorBindingByKey.get(key);

    if (binding === undefined) {
      throw new Error(`Unknown ${typeof key} identifier: "${key.toString()}"`);
    }

    return binding.index;
  }

  createAnchorIdSuffix(): string {
    if (this.anchorCount >= 100) {
      throw new Error('Too many anchors!');
    }

    const suffix = this.anchorCount.toString().padStart(2, '0'); // String.fromCharCode(A_CHAR_CODE + this.jumpCount);

    this.anchorCount += 1;

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
