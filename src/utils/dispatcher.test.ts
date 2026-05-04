import { describe, it, expectTypeOf } from 'vitest';
import { success, error, combo } from '../test/testUtils';
import type { Combinator, Arr, Obj } from '../types';
import { dispatcher } from './dispatcher';

const input = {
  undefined: () => undefined,
  function: () => () => 'f1' as const,
  combinator: () => combo(['y1', 'y2'] as const),
  arr: () => ['a1', 'a2'] as const,
  obj: () => ({ o1: 'o1', o2: 'o2' }) as const,
  default: () => 'd1' as const,
};

const fns = {
  undefined: (_v: undefined) => 'undefined' as const,
  function: (_v: Function) => 'function' as const,
  combinator: (_v: Combinator) => 'combinator' as const,
  arr: (_v: Arr) => 'arr' as const,
  obj: (_v: Obj) => 'obj' as const,
  default: (_v: any) => 'default' as const,
  error: (_v: any) => { throw new Error('error') },
};

type allTypes = 'undefined' | 'function' | 'combinator' | 'arr' | 'obj' | 'default';

const out = {
  undefined: () => 'undefined' as const,
  undefinedAll: () => 'undefined' as 'undefined' | 'function' | 'combinator' | 'arr' | 'obj' | 'default',
  function: () => 'function' as const,
  functionAll: () => 'function' as allTypes,
  combinator: () => 'combinator' as const,
  combinatorAll: () => 'combinator' as allTypes,
  arr: () => 'arr' as const,
  arrAll: () => 'arr' as allTypes,
  obj: () => 'obj' as const,
  objAll: () => 'obj' as allTypes,
  default: () => 'default' as const,
  defaultAll: () => 'default' as allTypes,
  error: () => new Error('error'),
  fallthroughError: (f: any) => () => new TypeError(`unexpected input: ${JSON.stringify(f)}`)
};

type UndefinedType = ReturnType<typeof input.undefined>;
type FunctionType = ReturnType<typeof input.function>;
type CombinatorType = ReturnType<typeof input.combinator>;
type ArrType = ReturnType<typeof input.arr>;
type ObjType = ReturnType<typeof input.obj>;
type DefaultType = ReturnType<typeof input.default>;
type FullType = UndefinedType | FunctionType | CombinatorType | ArrType | ObjType | DefaultType;

describe('dispatcher', () => {
  describe('undefined input', () => {
    it('all routes', () => success(() => dispatcher(input.undefined(), fns), out.undefined as any));
    it('undefined route', () => success(() => dispatcher(input.undefined(), { undefined: fns.undefined }), out.undefined));
    it('function route', () => error(() => dispatcher(input.undefined(), { function: fns.function }), out.fallthroughError(input.undefined())));
    it('combinator route', () => error(() => dispatcher(input.undefined(), { combinator: fns.combinator }), out.fallthroughError(input.undefined())));
    it('arr route', () => error(() => dispatcher(input.undefined(), { arr: fns.arr }), out.fallthroughError(input.undefined())));
    it('obj route', () => error(() => dispatcher(input.undefined(), { obj: fns.obj }), out.fallthroughError(input.undefined())));
    it('default route', () => success(() => dispatcher(input.undefined(), { default: fns.default }), out.default));
    it('default error route', () => error(() => dispatcher(input.undefined(), { default: fns.error }), out.error));
  });
  describe('function', () => {
    it('all routes', () => success(() => dispatcher(input.function(), fns), out.function as any));
    it('undefined route', () => error(() => dispatcher(input.function(), { undefined: fns.undefined }), out.fallthroughError(input.function())));
    it('function route', () => success(() => dispatcher(input.function(), { function: fns.function }), out.function));
    it('combinator route', () => error(() => dispatcher(input.function(), { combinator: fns.combinator }), out.fallthroughError(input.function())));
    it('arr route', () => error(() => dispatcher(input.function(), { arr: fns.arr }), out.fallthroughError(input.function())));
    it('obj route', () => error(() => dispatcher(input.function(), { obj: fns.obj }), out.fallthroughError(input.function())));
    it('default route', () => success(() => dispatcher(input.function(), { default: fns.default }), out.default));
    it('default error route', () => error(() => dispatcher(input.function(), { default: fns.error }), out.error));
  });
  describe('combinator', () => {
    it('all routes', () => success(() => dispatcher(input.combinator(), fns), out.combinator as any));
    it('undefined route', () => error(() => dispatcher(input.combinator(), { undefined: fns.undefined }), out.fallthroughError(input.combinator())));
    it('function route', () => error(() => dispatcher(input.combinator(), { function: fns.function }), out.fallthroughError(input.combinator())));
    it('combinator route', () => success(() => dispatcher(input.combinator(), { combinator: fns.combinator }), out.combinator));
    it('arr route', () => error(() => dispatcher(input.combinator(), { arr: fns.arr }), out.fallthroughError(input.combinator())));
    it('obj route', () => error(() => dispatcher(input.combinator(), { obj: fns.obj }), out.fallthroughError(input.combinator())));
    it('default route', () => success(() => dispatcher(input.combinator(), { default: fns.default }), out.default));
    it('default error route', () => error(() => dispatcher(input.combinator(), { default: fns.error }), out.error));
  });
  describe('arr', () => {
    it('all routes', () => success(() => dispatcher(input.arr(), fns), out.arr as any));
    it('undefined route', () => error(() => dispatcher(input.arr(), { undefined: fns.undefined }), out.fallthroughError(input.arr())));
    it('function route', () => error(() => dispatcher(input.arr(), { function: fns.function }), out.fallthroughError(input.arr())));
    it('combinator route', () => error(() => dispatcher(input.arr(), { combinator: fns.combinator }), out.fallthroughError(input.arr())));
    it('arr route', () => success(() => dispatcher(input.arr(), { arr: fns.arr }), out.arr));
    it('obj route', () => error(() => dispatcher(input.arr(), { obj: fns.obj }), out.fallthroughError(input.arr())));
    it('default route', () => success(() => dispatcher(input.arr(), { default: fns.default }), out.default));
    it('default error route', () => error(() => dispatcher(input.arr(), { default: fns.error }), out.error));
  });
  describe('obj', () => {
    it('all routes', () => success(() => dispatcher(input.obj(), fns), out.obj as any));
    it('undefined route', () => error(() => dispatcher(input.obj(), { undefined: fns.undefined }), out.fallthroughError(input.obj())));
    it('function route', () => error(() => dispatcher(input.obj(), { function: fns.function }), out.fallthroughError(input.obj())));
    it('combinator route', () => error(() => dispatcher(input.obj(), { combinator: fns.combinator }), out.fallthroughError(input.obj())));
    it('arr route', () => error(() => dispatcher(input.obj(), { arr: fns.arr }), out.fallthroughError(input.obj())));
    it('obj route', () => success(() => dispatcher(input.obj(), { obj: fns.obj }), out.obj));
    it('default route', () => success(() => dispatcher(input.obj(), { default: fns.default }), out.default));
    it('default error route', () => error(() => dispatcher(input.obj(), { default: fns.error }), out.error));
  });
  describe('default', () => {
    it('all routes', () => success(() => dispatcher(input.default(), fns), out.default as any));
    it('undefined route', () => error(() => dispatcher(input.default(), { undefined: fns.undefined }), out.fallthroughError(input.default())));
    it('function route', () => error(() => dispatcher(input.default(), { function: fns.function }), out.fallthroughError(input.default())));
    it('combinator route', () => error(() => dispatcher(input.default(), { combinator: fns.combinator }), out.fallthroughError(input.default())));
    it('arr route', () => error(() => dispatcher(input.default(), { arr: fns.arr }), out.fallthroughError(input.default())));
    it('obj route', () => error(() => dispatcher(input.default(), { obj: fns.obj }), out.fallthroughError(input.default())));
    it('default route', () => success(() => dispatcher(input.default(), { default: fns.default }), out.default));
    it('default error route', () => error(() => dispatcher(input.default(), { default: fns.error }), out.error));
  });
  describe('fallthrough TypeError', () => {
    it('throws when no handler matches', () => error( () => dispatcher(input.default(), { arr: fns.arr }) as any, out.fallthroughError(input.default())));
  });
  describe('typecheck dispatch inner types', () => {
    it('remainder from nothing', () => void dispatcher(input.default() as FullType, {
      default: (v) => { expectTypeOf(v).toEqualTypeOf<FullType>(); },
    }));
    it('remainder from undefined', () => void dispatcher(input.default() as FullType, {
      undefined: (v) => v,
      default: (v) => { expectTypeOf(v).toEqualTypeOf<Exclude<FullType, UndefinedType>>() },
    }));
    it('remainder from function', () => void dispatcher(input.default() as FullType, {
      function: (v) => v,
      default: (v) => { expectTypeOf(v).toEqualTypeOf<Exclude<FullType, FunctionType>>() },
    }));
    it('remainder from combinator', () => void dispatcher(input.default() as string | ReturnType<typeof input.combinator>, {
      combinator: (v) => v,
      default: (v) => { expectTypeOf(v).toEqualTypeOf<string>(); },
    }));
    it('remainder from arr', () => void dispatcher(input.default() as FullType, {
      arr: (v) => v,
      default: (v) => { expectTypeOf(v).toEqualTypeOf<Exclude<FullType, ArrType>>(); },
    }));
    it('remainder from obj', () => void dispatcher(input.default() as FullType, {
      obj: (v) => v,
      default: (v) => { expectTypeOf(v).toEqualTypeOf<Exclude<FullType, ObjType>>(); },
    }));
    it('remainder from everything except default', () => void dispatcher(input.default() as FullType, {
      undefined: (v) => v,
      function: (v) => v,
      combinator: (v) => v,
      arr: (v) => v,
      obj: (v) => v,
      default: (v) => { expectTypeOf(v).toEqualTypeOf<DefaultType>(); },
    }));
  });
});