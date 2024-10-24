import { FloorIndex } from '../types/floorSlot';
import { Identifier } from '../types/identifier';

export type Compiled = string[];

const MATH_TEMP_KEY = Symbol('math-temp-key');

type FloorIndexKey = Identifier['name'] | typeof MATH_TEMP_KEY;

const A_CHAR_CODE = 65;

export class CompilerContext {
  floorSize = 0;
  floorIndexByKey = new Map<FloorIndexKey, FloorIndex>();
  boundCount = 0;
  jumpCount = 0;

  setFloorSize(floorSize: number): void {
    this.floorSize = floorSize;
  }

  bindMathTempKey(): FloorIndex {
    const existingIndex = this.floorIndexByKey.get(MATH_TEMP_KEY);

    if (existingIndex !== undefined) {
      return existingIndex;
    }

    this.bindFloorIndexKey(MATH_TEMP_KEY);
    const index = this.getFloorIndex(MATH_TEMP_KEY);

    return index;
  }

  bindFloorIndexKey(identifier: FloorIndexKey): void {
    if (this.boundCount === this.floorSize) {
      throw new Error(`Not enough floor to bind ${identifier.toString()}`);
    }

    this.floorIndexByKey.set(identifier, this.boundCount);
    this.boundCount += 1;
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

export abstract class Node {
  abstract compile(context: CompilerContext): Compiled;

  get compiledDebugName(): string {
    return `-- ${this.constructor.name} --`;
  }
}
