import type { Combinator } from '../types';
import { combinator } from '../utils/combinator';

/**
 * Yields a single value as-is, without resolving combinators inside.
 * Use when you want to treat a combinator (or anything else) as a literal value.
 * @param value - The value to yield
 * @returns Combinator yielding the value once
 * @example literal([1, 2]) => [1, 2]  (the array itself, not its elements)
 * @example literal(combo(1, 2)) => Combinator<1|2>  (the combinator itself as a value)
 */
export const literal = <const T>(value: T): Combinator<T> => {
  return combinator('literal', function*() {
    yield value;
  });
};