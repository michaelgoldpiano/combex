import type { Combinator } from '../types';
import { COMBINATOR } from '../symbols';

export const generator = function*<
  const T,
>(
  ...values: T[]
): Generator<T> {
  for (const v of values) {
    yield v;
  }
};

export function combinator<
  const T,
>(
  name: string,
  fn: () => Generator<T>,
  original?: unknown,
): Combinator<T> {
  return {
    name: name,
    [COMBINATOR]: true,
    *[Symbol.iterator]() {
      yield* fn();
    }
  };
}