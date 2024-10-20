export type Compiled = string[];

const A_CHAR_CODE = 65;

export class CompilerContext {
  jumpCount = 0;

  createJumpLabel(): string {
    const label = String.fromCharCode(A_CHAR_CODE + this.jumpCount);

    this.jumpCount += 1;

    return label;
  }
}

export abstract class Node {
  abstract compile(context: CompilerContext): Compiled;
}
