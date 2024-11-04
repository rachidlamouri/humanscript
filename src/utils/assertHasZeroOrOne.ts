import { hasZeroOrOne } from './hasZeroOrOne';

export function assertHasExactlyZeroOrOne<T>(
  list: T[],
): asserts list is [] | [T] {
  if (hasZeroOrOne(list)) {
    return;
  }

  throw new Error(
    `Expected list to have length of 0 or 1, but received: "${list.length}"`,
  );
}
