export abstract class Node {
  get className(): string {
    return this.constructor.name;
  }
}
