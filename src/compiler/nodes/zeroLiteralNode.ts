import { Node } from './node';

export class ZeroLiteralNode extends Node {
  flatten(accumulator: Node[]): void {
    accumulator.push(this);
  }
}
