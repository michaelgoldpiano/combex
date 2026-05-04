import type { Arr, Obj, Subset } from '../types';
import { maskRange, maskToArr } from '../utils/mask';

/**
 * Yields all subsets of an array with between `min` and `max` elements (inclusive).
 * @param arr - The array to compute subsets of
 * @param min - Minimum subset size
 * @param max - Maximum subset size
 * @returns Combinator yielding each subset
 * @example subsetArr([1, 2, 3], 1, 2) => [1] | [2] | [3] | [1, 2] | [1, 3] | [2, 3]
 */
export const subsetRangeArr = function*<
  const T extends Arr,
  const R extends Subset<T>,
>(
  arr: T,
  min: number,
  max: number,
): Generator<R> {
  for (const mask of maskRange(arr.length, min, max)) {
    yield maskToArr(arr, mask) as unknown as R;
  }
};

/**
 * Yields all subsets of an object with between `min` and `max` elements (inclusive).
 * @param obj - The object to compute subsets of
 * @param min - Minimum subset size
 * @param max - Maximum subset size
 * @returns Combinator yielding each subset
 * @example subsetObj({ a: 1, b: 2 }, 0, 1) => {} | { a: 1 } | { b: 2 }
 */
export const subsetRangeObj = function*<
  const T extends Obj,
  const R extends Subset<T>,
>(
  obj: T,
  min: number,
  max: number,
): Generator<R> {
  const entries = Object.entries(obj);
  for (const mask of maskRange(entries.length, min, max)) {
    yield Object.fromEntries(maskToArr(entries, mask) as [string, unknown][]) as R;
  }
};