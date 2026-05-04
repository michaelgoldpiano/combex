import type { Combinator, Arr, Obj, Resolve, Subset, NonEmpty } from '../types';
import { TypeError } from '../errors';
import { combinator } from '../utils/combinator';
import { dispatcher } from '../utils/dispatcher';
import { map } from '../utils/map';
import { powersetArr, powersetObj } from '../algo/powerset';
import { productArr, productObj } from '../algo/product';

/**
 * Yields all non-empty subsets of an array or object, resolving any combinators inside.
 * Equivalent to subset(input, 1, input.length).
 * @param input - The array or object to compute subsets of
 * @returns Combinator yielding each non-empty resolved subset
 * @example some([1, 2]) => [1] | [2] | [1, 2]
 * @example some({ a: 1, b: 2 }) => { a: 1 } | { b: 2 } | { a: 1, b: 2 }
 */
export const some = <
  const T extends Combinator<Arr | Obj> | Arr | Obj,
  const R extends NonEmpty<Subset<Resolve<T>>>,
>(
  input: T,
): Combinator<R> => {

  /* Must resolve to Arr | Obj */
  const resolve = function*(input: Arr | Obj): Generator<R> {
    yield* dispatcher(input, {
      arr: (arr) => map(powersetArr(arr, false), (powerset) => productArr(powerset as Arr)),
      obj: (obj) => map(powersetObj(obj, false), (powerset) => productObj(powerset as Obj)),
      default: (d) => { throw new TypeError('Arr | Obj', d); },
    }) as Generator<R>;
  };

  /* Potentially Combinator */
  return combinator('some', function*() {
    yield* dispatcher(input, {
      combinator: (vs) => map(vs, (v) => resolve(v as any)),
      default: (v) => resolve(v as any),
    });
  });
};