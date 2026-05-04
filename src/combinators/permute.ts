import type { Combinator, Arr, Obj, Resolve, Permuted } from '../types';
import { TypeError } from '../errors';
import { combinator } from '../utils/combinator';
import { dispatcher } from '../utils/dispatcher';
import { map, condMap } from '../utils/map';
import { permutationArr, permutationObj } from '../algo/permutation';
import { productArr, productObj } from '../algo/product';

/**
 * Yields all permutations of an array or object. End changes fastest.
 * @param input - The array or object to permute
 * @returns Combinator yielding each permutation
 * @example permute([1, 2, 3]) => [1,2,3] | [1,3,2] | [2,1,3] | [2,3,1] | [3,1,2] | [3,2,1]
 * @example permute({ a: 1, b: 2 }) => { a: 1, b: 2 } | { b: 2, a: 1 }
 */
export const permute = <
  const T extends Combinator<Arr | Obj> | Arr | Obj,
  const R extends Permuted<Resolve<T>>,
>(
  input: T,
): Combinator<R> => {
  return combinator('permute', function*() {
    yield* condMap(input, (v) => dispatcher(v, {
      arr: (arr) => map(permutationArr(arr), (permuted) => productArr(permuted as Arr)),
      obj: (obj) => map(permutationObj(obj), (permuted) => productObj(permuted as Obj)),
      default: (d) => { throw new TypeError('Arr | Obj', d); },
    }) as Generator<R>);
  })
};