import { IdentifierNode } from './nodes/references/identifierNode';

export type Compiled = string[];

export type FloorIndex = number;

const RESERVED_REGISTER_KEY = Symbol('reserved-register-key');

type FloorIndexKey = IdentifierNode['name'] | typeof RESERVED_REGISTER_KEY;

const A_CHAR_CODE = 65;

class FloorSlot {
  isBound = false;

  constructor(public index: number) {}

  bind() {
    this.isBound = true;
  }
}

export class CompilerContext {
  floor: FloorSlot[] = [];
  floorSlotByIndex = new Map<FloorIndex, FloorSlot>();
  floorIndexByKey = new Map<FloorIndexKey, FloorIndex>();

  jumpCount = 0;

  get floorSize() {
    return this.floor.length;
  }

  initFloor(floorSize: number): void {
    Array.from({ length: floorSize }).forEach((_, index) => {
      const slot = new FloorSlot(index);
      this.floor.push(slot);
      this.floorSlotByIndex.set(index, slot);
    });
  }

  bindReservedRegisterKey(): FloorIndex {
    const existingIndex = this.floorIndexByKey.get(RESERVED_REGISTER_KEY);

    if (existingIndex !== undefined) {
      return existingIndex;
    }

    this.bindFloorSlot(RESERVED_REGISTER_KEY, null);
    const index = this.getFloorIndex(RESERVED_REGISTER_KEY);

    return index;
  }

  bindFloorSlot(key: FloorIndexKey, index: FloorIndex | null): void {
    let slot: FloorSlot;

    if (index === null) {
      const nextUnboundSlot = this.floor.find((slot) => !slot.isBound);

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
