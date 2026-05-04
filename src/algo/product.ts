import type { Arr, Obj, Resolve } from '../types';
import { map } from '../utils/map';
import { dispatcher } from '../utils/dispatcher';

/**
 * Cartesian product of an array. Resolves nested combinators, arrays, objects.
 * @param arr - The array to resolve
 * @param current - Internal accumulator, do not pass
 * @returns Combinator yielding each resolved array
 * @example productArr([one(1, 2), one(3, 4)]) => [1, 3] | [1, 4] | [2, 3] | [2, 4]
 */
export const productArr = <
  const E,
  const T extends Arr<E>,
  const R extends Resolve<T>,
>(
  arr: T,
): Generator<R> => {

  /* Inner helper */
  const resolve = function*(current: Arr): Generator<R> {
    
    /* Reached end of array */
    if (current.length === arr.length) {
      yield current as R;
      return;
    }

    /* Resolve the expression and recurse */
    yield* dispatcher(arr[current.length], {
      combinator: (c) => map(c, (v) => resolve([...current, v])),
      arr: (inner) => map(productArr(inner as Arr), (v) => resolve([...current, v])),
      obj: (inner) => map(productObj(inner as Obj), (v) => resolve([...current, v])),
      default: (v) => resolve([...current, v]),
    });
  };

  return resolve([]);
};

/**
 * Cartesian product of an object. Resolves nested combinators, arrays, objects.
 * @param obj - The object to resolve
 * @param current - Internal accumulator, do not pass
 * @returns Combinator yielding each resolved object
 * @example productObj({ a: one(1, 2), b: one(3, 4) }) => { a: 1, b: 3 } | { a: 1, b: 4 } | { a: 2, b: 3 } | { a: 2, b: 4 }
 */
export const productObj = <
  const E,
  const T extends Obj<E>,
  const R extends Resolve<T>,
>(
  obj: T,
): Generator<R> => {
  
  const objKeys = Object.keys(obj);

  /* Inner helper */
  const resolve = function*(current: Obj): Generator<R> {
    const currKeys = Object.keys(current);

    /* Reached end of object */
    if (currKeys.length === objKeys.length) {
      yield current as R;
      return;
    }

    const k = objKeys[currKeys.length] as string;

    /* Resolve the expression and recurse */
    yield* dispatcher(obj[k], {
      combinator: (c) => map(c, (v) => resolve({ ...current, [k]: v })),
      arr: (inner) => map(productArr(inner as Arr), (v) => resolve({ ...current, [k]: v })),
      obj: (inner) => map(productObj(inner as Obj), (v) => resolve({ ...current, [k]: v })),
      default: (v) => resolve({ ...current, [k]: v }),
    });
  };

  return resolve({});
};