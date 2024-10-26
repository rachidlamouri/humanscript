import { CompilerContext } from './compilerContext';

/**
 * Abstracts output indentation
 */
export class CompiledPart {
  depth: number;

  constructor(
    public context: CompilerContext,
    public textGetter: string | (() => string),
  ) {
    this.depth = context.outputDepth;
  }

  get text() {
    return typeof this.textGetter === 'string'
      ? this.textGetter
      : this.textGetter();
  }

  get serialized() {
    const indent = this.depth * 2;
    const padding = ' '.repeat(indent);
    return `${padding}${this.text}`;
  }
}
