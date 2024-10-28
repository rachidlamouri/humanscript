export abstract class Node {
  get className(): string {
    return this.constructor.name;
  }

  abstract flatten(accumulator: Node[]): void;
}

export function assertIsNode(value: unknown): asserts value is Node {
  if (value instanceof Node) {
    return;
  }

  throw Error('Expected a Node');
}
