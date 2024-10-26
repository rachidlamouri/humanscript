import { IdentifierNode } from './nodes/references/identifierNode';
export type FloorIndex = number;

export type FloorIndexKey = IdentifierNode['name'];

const REGISTER_KEY = 'register';

const A_CHAR_CODE = 65;

const reservedWords = new Set([
  // -
  'floor',
  'let',
  'inbox',
  'outbox',
  'while',
  'if',
  'register',
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

  outputDepth = 0;

  registerKey = REGISTER_KEY;

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

  bindReservedRegisterKey(): FloorIndex {
    const existingIndex = this.floorIndexByKey.get(REGISTER_KEY);

    if (existingIndex !== undefined) {
      return existingIndex;
    }

    this.performBind(REGISTER_KEY, null);
    const index = this.getFloorIndex(REGISTER_KEY);

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

  createJumpLabel(): string {
    const label = String.fromCharCode(A_CHAR_CODE + this.jumpCount);

    this.jumpCount += 1;

    return label;
  }
}
