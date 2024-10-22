import { FloorIndex } from '../types/floorSlot';
import { Identifier } from '../types/primitiveTypes';

export type Compiled = string[];

const A_CHAR_CODE = 65;

export class CompilerContext {
  floorIndexByIdentifier = new Map<Identifier, FloorIndex>();
  boundCount = 0;
  jumpCount = 0;

  bindIdentifier(identifier: Identifier): void {
    this.floorIndexByIdentifier.set(identifier, this.boundCount);
    this.boundCount += 1;
  }

  getFloorIndex(identifier: Identifier): FloorIndex {
    const index = this.floorIndexByIdentifier.get(identifier);

    if (index === undefined) {
      throw new Error(`Unknown identifier: "${identifier}"`);
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
