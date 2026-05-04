import type { Combinator, Arr, Obj, Resolve, Subset } from '../types';
import { TypeError } from '../errors';
import { combinator } from '../utils/combinator';
import { dispatcher } from '../utils/dispatcher';
import { map } from '../utils/map';
import { subsetRangeArr, subsetRangeObj } from '../algo/subsetRange';
import { productArr, productObj } from '../algo/product';

/**
 * Yields all subsets of an array or object with between `min` and `max` elements (inclusive).
 * @param input - The array or object to compute subsets of
 * @param min - Minimum subset size
 * @param max - Maximum subset size
 * @returns Combinator yielding each resolved subset
 * @example subset([1, 2, 3], 1, 2) => [1] | [2] | [3] | [1, 2] | [1, 3] | [2, 3]
 * @example subset({ a: 1, b: 2 }, 0, 1) => {} | { a: 1 } | { b: 2 }
 */
export const subset = <
  const T extends Combinator<Arr | Obj> | Arr | Obj,
  const R extends Subset<Resolve<T>>,
>(
  input: T,
  min: number,
  max: number,
): Combinator<R> => {

  /* Must resolve to Arr | Obj */
  const resolve = function*(input: Arr | Obj): Generator<R> {
    yield* dispatcher(input, {
      arr: (arr) => map(subsetRangeArr(arr, min, max), (subset) => productArr(subset as Arr)),
      obj: (obj) => map(subsetRangeObj(obj, min, max), (subset) => productObj(subset as Obj)),
      default: (d) => { throw new TypeError('Arr | Obj', d); },
    }) as Generator<R>;
  };

  /* Potentially Combinator */
  return combinator('subset', function*() {
    yield* dispatcher(input, {
      combinator: (vs) => map(vs, (v) => resolve(v as any)),
      default: (v) => resolve(v as any),
    });
  });
};