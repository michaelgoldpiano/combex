import type { Combinator, Arr, Obj, Resolve, Subset } from '../types';
import { TypeError } from '../errors';
import { combinator } from '../utils/combinator';
import { dispatcher } from '../utils/dispatcher';
import { map } from '../utils/map';
import { powersetArr, powersetObj } from '../algo/powerset';
import { productArr, productObj } from '../algo/product';

/**
 * Yields all subsets (powerset) of an array or object, resolving any combinators inside.
 * Equivalent to subset(input, 0, input.length).
 * @param input - The array or object to compute subsets of
 * @returns Combinator yielding each resolved subset
 * @example any([1, 2]) => [] | [1] | [2] | [1, 2]
 * @example any({ a: 1, b: 2 }) => {} | { a: 1 } | { b: 2 } | { a: 1, b: 2 }
 */
export const any = <
  const T extends Combinator<Arr | Obj> | Arr | Obj,
  const R extends Subset<Resolve<T>>,
>(
  input: T,
): Combinator<R> => {

  /* Must resolve to Arr | Obj */
  const resolve = function*(input: Arr | Obj): Generator<R> {
    yield* dispatcher(input, {
      arr: (arr) => map(powersetArr(arr, true), (powerset) => productArr(powerset as Arr)),
      obj: (obj) => map(powersetObj(obj, true), (powerset) => productObj(powerset as Obj)),
      default: (d) => { throw new TypeError('Arr | Obj', d); },
    }) as Generator<R>;
  };

  /* Potentially Combinator */
  return combinator('any', function*() {
    yield* dispatcher(input, {
      combinator: (vs) => map(vs, (v) => resolve(v as any)),
      default: (v) => resolve(v as any),
    });
  });
};