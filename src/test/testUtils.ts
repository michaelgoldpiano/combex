import { expect } from 'vitest';
import type { Combinator, Arr, Obj } from '../types';
import { COMBINATOR } from '../symbols';
import { combinator } from '../utils/combinator';

const isCombinator = (v: unknown): v is Combinator => v !== null && typeof v === 'object' && COMBINATOR in v;
const isFunction = (v: unknown): v is Function => typeof v === 'function';
const isArr = (v: unknown): v is Arr => Array.isArray(v);
const isObj = (v: unknown): v is Obj => v != null && typeof v === 'object';

const normalize = (a: unknown, b: unknown): [unknown, unknown] => {
  if (isFunction(a) && isFunction(b)) {
    return [expect.any(Function), expect.any(Function)];
  }
  if (isCombinator(a) && isCombinator(b)) {
    return normalize([...a], [...b]);
  }
  if (isArr(a) && isArr(b)) {
    const len = Math.max(a.length, b.length);
    const pairs = Array.from({ length: len }, (_, i) => normalize(a[i], b[i]));
    return [pairs.map(p => p[0]), pairs.map(p => p[1])];
  }
  if (isObj(a) && isObj(b)) {
    const keys = [...new Set([...Object.keys(a), ...Object.keys(b as object)])];
    const pairs = Object.fromEntries(keys.map(k => [k, normalize((a as any)[k], (b as any)[k])]));
    return [
      Object.fromEntries(Object.entries(pairs).map(([k, v]) => [k, v[0]])),
      Object.fromEntries(Object.entries(pairs).map(([k, v]) => [k, v[1]])),
    ];
  }
  return [a, b];
};

type StrictEqual<A, B> = (
  [A] extends [never] ? [B] extends [never] ? true : false :
  [B] extends [never] ? false :
  A extends B ? B extends A ? true : false : false
);

type Mismatch<A, B> = { actual: A; expected: B };

export const success = <const A, const B>(
  actual: () => A,
  expected: StrictEqual<A, B> extends true ? () => B : Mismatch<A, B>,
) => {
  expect(actual).not.toThrow();
  const [a, e] = normalize(actual(), (expected as () => B)());
  expect(a).toEqual(e);
};

export const error = (fn: () => unknown, e: () => Error) => {
  expect(() => {
    const result = fn();
    if (isCombinator(result)) Array.from(result);
  }).toThrow(e());
};

export const gen = function*<
  const T extends readonly unknown[],
>(
  ...values: T
): Generator<T[number]> {
  for (const v of values) {
    yield v;
  }
};

export const combo = <
  const T extends readonly unknown[],
>(
  ...values: T
): Combinator<T[number]> => {
  return combinator('testLiteral', function*() {
    for (const v of values) {
      yield v;
    }
  });
};

export const comboNonLiteral = <
  const U,
>(
  t: Combinator<U>,
): Combinator<U> => {
  return combinator('testNonLiteral', function*() {
    yield* t;
  });
};