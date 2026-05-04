import type { Combinator, Arr, Obj, Resolve } from '../types';
import { TypeError } from '../errors';
import { combinator } from '../utils/combinator';
import { dispatcher } from '../utils/dispatcher';
import { map } from '../utils/map';
import { productArr, productObj } from '../algo/product';

/**
 * Resolves all elements of an array or object, yielding the cartesian product.
 * Equivalent resolution to an array or object within a combinator,
 * but itself as a combinator, for clarity and for top-level resolution.
 * @param input - The array or object to resolve
 * @returns Combinator yielding each fully resolved combination
 * @example all([one(1, 2), one(3, 4)]) => [1, 3] | [1, 4] | [2, 3] | [2, 4]
 * @example all({ a: one(1, 2), b: one(3, 4) }) => { a: 1, b: 3 } | { a: 1, b: 4 } | { a: 2, b: 3 } | { a: 2, b: 4 }
 */
export const all = <
  const T extends Combinator<Arr | Obj> | Arr | Obj,
  const R extends Resolve<T>,
>(
  input: T,
): Combinator<R> => {

  /* Must resolve to Arr | Obj */
  const resolve = function*(input: Arr | Obj): Generator<R> {
    yield* dispatcher(input, {
      arr: (arr) => productArr(arr),
      obj: (obj) => productObj(obj),
      default: (d) => { throw new TypeError('Arr | Obj', d); },
    }) as Generator<R>;
  };

  /* Potentially Combinator */
  return combinator('all', function*() {
    yield* dispatcher(input, {
      combinator: (vs) => map(vs, (v) => resolve(v as any)),
      default: (v) => resolve(v as any),
    });
  });
};