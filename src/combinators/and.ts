import type { Combinator, Arr, Obj, Resolve, And } from '../types';
import { TypeError, MergeError } from '../errors';
import { generator, combinator } from '../utils/combinator';
import { dispatcher } from '../utils/dispatcher';
import { map, condMap } from '../utils/map';
import { productArr, productObj } from '../algo/product';

/**
 * Merges two arrays or objects together, yielding all resolved combinations.
 * The second parameter is a function that receives each resolved value of the first
 * and returns the value to merge with it.
 * @param param1 - The base array or object (or combinator thereof)
 * @param param2 - Function receiving each resolved p1 value, returning the value to merge
 * @returns Combinator yielding each merged and resolved combination
 * @example and([1, 2], (t) => [3, 4]) => [1, 2, 3, 4]
 * @example and({ a: 1 }, (t) => ({ b: 2 })) => { a: 1, b: 2 }
 * @example and([one(1, 2)], (t) => [one(3, 4)]) => [1, 3] | [1, 4] | [2, 3] | [2, 4]
 */
export const and = <
  const P1 extends Combinator<Arr | Obj> | Arr | Obj,
  const R2 extends Combinator<Arr | Obj> | Arr | Obj,
  const R = And<Resolve<P1>, Resolve<R2>>,
>(
  param1: P1,
  param2: (f1: Resolve<P1>) => R2,
): Combinator<R> => {
  return combinator('and', function*() {
    yield* dispatcher(param2, {

      /* p2 must be a function */
      function: (p2Fn) => condMap(param1, (p1) => dispatcher(p1, {

        /* p1 is array */
        arr: (p1: Arr) => map(productArr(p1), (p1Resolved) => condMap(p2Fn(p1Resolved as Resolve<P1>), (p2) => dispatcher(p2, {
          undefined: () => generator(p1Resolved),
          arr: (p2: Arr) => map(productArr(p2), (p2Resolved) => generator([...p1Resolved, ...p2Resolved])),
          default: (p2) => { throw new MergeError('[...arr, ...obj]', p1, p2); },
        }) as Generator<R>)),

        /* p1 is object */
        obj: (p1: Obj) => map(productObj(p1), (p1Resolved) => condMap(p2Fn(p1Resolved as Resolve<P1>), (p2) => dispatcher(p2, {
          undefined: () => generator(p1Resolved),
          obj: (p2: Obj) => map(productObj(p2), (p2Resolved) => generator({...p1Resolved, ...p2Resolved})),
          default: (p2) => { throw new MergeError('{...obj, ...arr}', p1, p2); },
        }) as Generator<R>)),
        default: (p1) => { throw new TypeError('Combinator<Arr | Obj> | Arr | Obj', p1); },
      })),
      default: (p2Fn) => { throw new TypeError('Function', p2Fn); },
    });
  }) as Combinator<R>;
};