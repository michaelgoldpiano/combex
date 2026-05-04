import type { Arr, Obj, NonEmpty, Subset } from '../types';
import { maskToArr } from '../utils/mask';

/**
 * Yields all subsets of an array (the powerset).
 * @param arr - The array to compute the powerset of
 * @param includeEmpty - Whether to include the empty subset
 * @returns Combinator yielding each subset
 * @example powersetArr([1, one(2, 3)], true) => [] | [1] | one(2, 3) | [1, one(2, 3)]
 */
export const powersetArr = function*<
  const T extends Arr,
  const IncludeEmpty extends boolean,
  const R extends IncludeEmpty extends true ? Subset<T> : NonEmpty<Subset<T>>,
>(
  arr: T,
  includeEmpty: IncludeEmpty,
): Generator<R> {
  for (let mask = includeEmpty ? 0 : 1; mask < (1 << arr.length); mask++) {
    yield maskToArr(arr, mask) as unknown as R;
  }
};

/**
 * Yields all subsets of an object (the powerset).
 * @param input - The object to compute the powerset of
 * @param includeEmpty - Whether to include the empty subset
 * @returns Combinator yielding each subset
 * @example powersetObj({a: 1, b: one(2, 3)}, true) => {} | {a: 1} | {b: one(2, 3)} | {a: 1, b: one(2, 3)}
 */
export const powersetObj = function*<
  const T extends Obj,
  const IncludeEmpty extends boolean,
  const R extends IncludeEmpty extends true ? Subset<T> : NonEmpty<Subset<T>>,
>(
  obj: T,
  includeEmpty: IncludeEmpty,
): Generator<R> {
  const entries = Object.entries(obj);
  for (let mask = includeEmpty ? 0 : 1; mask < (1 << entries.length); mask++) {
    yield Object.fromEntries(maskToArr(entries, mask) as [string, unknown][]) as R;
  }
};