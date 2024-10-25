export abstract class Node {
  get compiledDebugName(): string {
    return `-- ${this.constructor.name} --`;
  }
}
