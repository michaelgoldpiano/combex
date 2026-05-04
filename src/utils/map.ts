import { dispatcher } from './dispatcher';

/**
 * Map over an iterable, yielding the results of each call to fn.
 * @param input - The iterable to map over
 * @param fn - The function to apply to each value
 * @returns Generator yelding each mapped value
 * @example map([1, 2, 3], (t) => [t * 2]) => 2 | 4 | 6
 */
export const map = function*<
  const T,
  const R,
>(
  input: Iterable<T>,
  fn: (t: T) => Iterable<R>,
): Generator<R> {
  for (const t of input) {
    yield* fn(t);
  }
};

/**
 * Same as map, but "conditionally" works on both plain values and combinators.
 * If input is a Combinator, maps over each yielded value.
 * If input is a plain value, calls fn once with that value.
 * @param input - The value or iterable to map over
 * @param fn - The function to apply to each value
 * @returns Generator yielding each mapped value
 * @example condMap(combo(1, 2, 3), (t) => [t * 2]) => 2 | 4 | 6
 * @example condMap(3, (t) => [t * 2]) => 6
 */
export const condMap = function*<
  const T,
  const R,
>(
  input: Iterable<T> | T,
  fn: (t: T) => Iterable<R>,
): Generator<R> {
  yield* dispatcher(input, {
    combinator: (vs) => map(vs as Iterable<T>, (v) => fn(v)),
    default: (v) => fn(v as T),
  }) as Generator<R>;
};