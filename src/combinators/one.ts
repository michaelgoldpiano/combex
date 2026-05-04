import type { Combinator, Resolve } from '../types';
import { generator, combinator } from '../utils/combinator';
import { dispatcher } from '../utils/dispatcher';
import { productArr, productObj } from '../algo/product';

/**
 * Yields each value one at a time, resolving combinators, arrays, and objects.
 * @param values - The values to yield
 * @returns Combinator yielding each resolved value
 * @example one(1, 2, 3) => 1 | 2 | 3
 * @example one([1, 2], [3, 4]) => [1, 2] | [3, 4]
 * @example one(combo(1, 2), 3) => 1 | 2 | 3
 */
export const one = <
  const T,
  const R extends Resolve<T>,
>(
  ...values: T[]
): Combinator<R> => {
  return combinator('one', function*() {
    for (const v of values) {
      yield* dispatcher(v, {
        combinator: (vs) => vs,
        arr: (v) => productArr(v),
        obj: (v) => productObj(v),
        default: (d) => generator(d),
      }) as Generator<R>;
    }
  });
};