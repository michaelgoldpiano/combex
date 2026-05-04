import type { Arr, Obj, Permuted } from '../types';
import { generator } from '../utils/combinator';

/**
 * Yields all permutations of an array. End changes fastest.
 * @param arr - The array to permute
 * @returns Combinator yielding each permutation
 * @example permutationsArr([1, 2, 3]) => [1,2,3] | [1,3,2] | [2,1,3] | [2,3,1] | [3,1,2] | [3,2,1]
 */
export const permutationArr = <
  const T extends Arr,
  const R extends Permuted<T>,
>(
  arr: T,
): Generator<R> => {

  /* Inner helper */
  const resolve = function*(
    current: unknown[],
    left: number,
    right: number,
  ): Generator<R> {

    /* Reached end of array */
    if (left === arr.length - 1) {
      yield current as R;
      return;
    }

    /* Recurse past the current "left" */
    yield* resolve(current, left + 1, left + 2);

    /* Recurse for each possible swap at "left" */
    if (right < arr.length) {
      const next = [...current];
      [next[left], next[right]] = [next[right], next[left]];
      yield* resolve(next, left, right + 1);
    }
  };

  /* Empty array */
  if (arr.length === 0) {
    return generator([] as unknown as R);
  }

  /* Recursive permutation builder */
  return resolve([...arr], 0, 1);
};

/**
 * Yields all permutations of an object's entries. End changes fastest.
 * @param obj - The object to permute
 * @returns Combinator yielding each permutation as an object
 * @example permutationsObj({ a: 1, b: 2 }) => { a: 1, b: 2 } | { b: 2, a: 1 }
 */
export const permutationObj = <
  const T extends Obj,
  const R extends Permuted<T>,
>(
  obj: T,
): Generator<R> => {
  const entries = Object.entries(obj);

  /* Inner helper */
  const resolve = function*(
    current: unknown[],
    left: number,
    right: number,
  ): Generator<R> {

    /* Reached end of array */
    if (left === entries.length - 1) {
      yield Object.fromEntries(current as [string, unknown][]) as R;
      return;
    }

    /* Recurse past the current "left" */
    yield* resolve(current, left + 1, left + 2);

    /* Recurse for each possible swap between "left" and "right" */
    if (right < entries.length) {
      const next = [...current];
      [next[left], next[right]] = [next[right], next[left]];
      yield* resolve(next, left, right + 1);
    }
  };
    
  /* Empty object */
  if (entries.length === 0) {
    return generator({} as R);
  }

  /* Recursive permutation builder */
  return resolve([...entries], 0, 1);
};