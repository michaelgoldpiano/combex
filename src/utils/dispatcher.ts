import type { Combinator, Arr, Obj } from '../types';
import { COMBINATOR } from '../symbols';

const validate = {
  undefined: <const T>(v: unknown): v is Extract<T, undefined> => v === undefined,
  function: <const T>(v: unknown): v is Extract<T, Function> => typeof v === 'function',
  combinator: <T>(v: unknown): v is Extract<T, Combinator> => v !== null && typeof v === 'object' && COMBINATOR in v,
  arr: <const T>(v: unknown): v is Extract<T, Arr> => Array.isArray(v),
  obj: <const T>(v: unknown): v is Extract<T, Obj> => typeof v === 'object' && v !== null && Object.getPrototypeOf(v) === Object.prototype && !(COMBINATOR in v),
} as const;

export const dispatcher = <
  const T,
  const RU = never,
  const RF = never,
  const RC = never,
  const RA = never,
  const RO = never,
  const RD = never,
  const IU = RU extends never ? never : Extract<T, undefined>,
  const IF = RF extends never ? never : Extract<T, Function>,
  const IC = RC extends never ? never : Extract<T, Combinator>,
  const IA = RA extends never ? never : Extract<T, Arr>,
  const IO = RO extends never ? never : Extract<T, Obj>,
>(
  input: T,
  fns: {
    undefined?: (input: Extract<T, undefined>) => RU;
    function?: (input: Extract<T, Function>) => RF;
    combinator?: (input: Extract<T, Combinator>) => RC;
    arr?: (input: Extract<T, Arr>) => RA;
    obj?: (input: Extract<T, Obj>) => RO;
    default?: (input: Exclude<T, IU | IF | IC | IA | IO>) => RD;
  },
): RU | RF | RC | RA | RO | RD => {
  if (fns.undefined && validate.undefined<T>(input)) return fns.undefined(input) as RU;
  if (fns.function && validate.function<T>(input)) return fns.function(input) as RF;
  if (fns.combinator && validate.combinator<T>(input)) return fns.combinator(input) as RC;
  if (fns.arr && validate.arr<T>(input)) return fns.arr(input) as RA;
  if (fns.obj && validate.obj<T>(input)) return fns.obj(input) as RO;
  if (fns.default) return fns.default(input as any) as RD;
  throw new TypeError(`unexpected input: ${JSON.stringify(input)}`);
};