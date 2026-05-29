import { describe, it, expectTypeOf } from 'vitest';
import { success, error, combo, comboNonLiteral } from '../test/testUtils';
import type { And, Combinator, Arr, Obj } from '../types';
import { TypeError, MergeError } from '../errors';
import { and } from './and';

const p1 = {
  arr: () => ['a1'] as const,
  comboArr: () => comboNonLiteral(combo(['a1'] as const)),
  condArr: () => ['a1'].length > 0 ? ['a1'] as const : ['never'] as const,
  fnArr: () => (['a1'] as const).map(x => x),
  andArr1: () => and(['a1'] as const, (_z) => [] as const),
  andArr2: () => and([] as const, (_z) => ['a1'] as const),
  arrCombo: () => [combo('a1')] as const,
  arrEmpty: () => [] as const,

  obj: () => ({ o1: 'o1' } as const),
  comboObj: () => comboNonLiteral(combo({ o1: 'o1' } as const)),
  condObj: () => Object.keys({ o1: 'o1' } as const).length > 0 ? { o1: 'o1' } as const : { never: 'never' } as const,
  fnObj: () => Object.assign({}, { o1: 'o1' } as const),
  andObj1: () => and({ o1: 'o1' } as const, (_z) => ({})),
  andObj2: () => and({}, (_z) => ({ o1: 'o1' } as const)),
  objCombo: () => ({ o1: combo('o1') } as const),
  objEmpty: () => ({} as const),
};

const p2 = {
  arr: <T extends Arr>(t: T) => ['a2', 'a3'] as const,
  arrCombo: <T extends Arr>(t: T) => [combo('a2'), combo('a3')] as const,
  comboArr: <T extends Arr>(t: T) => comboNonLiteral(combo(['a2', 'a3'] as const)),
  condArr: <T extends Arr>(t: T) => (['a1'] as const).length > 0 ? ['a2', 'a3'] as const : ['never'] as const,
  fnArr: <T extends Arr>(t: T) => (['a2', 'a3'] as const).map(x => x),
  andArr1: <T extends Arr>(t: T) => and(['a2', 'a3'] as const, (_z) => [] as const),
  andArr2: <T extends Arr>(t: T) => and([] as const, (_z) => ['a2', 'a3'] as const),

  dynArr: <T extends Arr>(t: T): [T['length'], T[0]] => [t.length, t[0]],
  dynComboArr: <T extends Arr>(t: T): [T['length'], T[0]] => comboNonLiteral(combo([t.length, t[0]])) as unknown as [T['length'], T[0]],
  dynArrCombo: <T extends Arr>(t: T): [T['length'], T[0]] => [combo(t.length), combo(t[0])] as unknown as [T['length'], T[0]],
  dynCondArr: <T extends Arr>(t: T): [T['length'], T[0]] | ['never'] => ['a1'].length > 0 ? [t.length, t[0]] : ['never'],
  dynFnArr: <T extends Arr>(t: T): [T['length'], T[0]] => ([t.length, t[0]]).map(x => x) as [number, string],
  dynAndArr1: <T extends Arr>(t: T): Combinator<[T['length'], T[0]]> => and([t.length, t[0]], (_z) => [] as const),
  dynAndArr2: <T extends Arr>(t: T): Combinator<[T['length'], T[0]]> => and([] as const, (_z) => [t.length, t[0]]),
  
  arrEmpty: <T>(t: T) => [] as const,

  obj: <T extends Obj>(t: T) => ({ o2: 'o2', o3: 'o3' } as const),
  objCombo: <T extends Obj>(t: T) => ({ o2: combo('o2'), o3: combo('o3') } as const),
  comboObj: <T extends Obj>(t: T) => comboNonLiteral(combo({ o2: 'o2', o3: 'o3' } as const)),
  condObj: <T extends Obj>(t: T) => ['a1'].length > 0 ? { o2: 'o2', o3: 'o3' } as const : { never: 'never' } as const,
  fnObj: <T extends Obj>(t: T) => Object.assign({} as const, { o2: 'o2', o3: 'o3' } as const),
  andObj1: <T extends Obj>(t: T) => and({ o2: 'o2', o3: 'o3' } as const, (_z) => ({} as const)),
  andObj2: <T extends Obj>(t: T) => and({} as const, (_z) => ({ o2: 'o2', o3: 'o3' } as const)),

  dynObj: <T extends Obj>(t: T): { l: number, copy: T['o1'] } => ({ l: Object.keys(t).length, copy: t.o1 }) as unknown as { l: number, copy: T['o1'] },
  dynObjCombo: <T extends Obj>(t: T): { l: number, copy: T['o1'] } => ({ l: combo(Object.keys(t).length), copy: combo(t.o1) }) as unknown as { l: number, copy: T['o1'] },
  dynComboObj: <T extends Obj>(t: T): { l: number, copy: T['o1'] } => comboNonLiteral(combo({ l: Object.keys(t).length, copy: t.o1 })) as unknown as { l: number, copy: T['o1'] },
  dynCondObj: <T extends Obj>(t: T): { l: number, copy: T['o1'] } | { never : 'never' } => (['a1'].length > 0 ? { l: Object.keys(t).length, copy: t.o1 } : { never: 'never' } as const) as unknown as { l: number, copy: T['o1'] } | { never: 'never' },
  dynFnObj: <T extends Obj>(t: T): { l: number, copy: T['o1'] } => Object.assign({} as const, { l: Object.keys(t).length, copy: t.o1 }) as unknown as { l: number, copy: T['o1'] },
  dynAndObj1: <T extends Obj>(t: T): { l: number, copy: T['o1'] } => and({ l: Object.keys(t).length, copy: t.o1 }, (_z) => ({} as const)) as unknown as { l: number, copy: T['o1'] },
  dynAndObj2: <T extends Obj>(t: T): { l: number, copy: T['o1'] } => and({} as const, (_z) => ({ l: Object.keys(t).length, copy: t.o1 })) as unknown as { l: number, copy: T['o1'] },

  objEmpty: <T>(t: T) => ({} as const),
};

const out = {
  arr: () => combo(['a1', 'a2', 'a3']) as Combinator<['a1', 'a2', 'a3']>,
  condArr: () => combo(['a1', 'a2', 'a3']) as Combinator<['a1' | 'never', 'a2', 'a3']>,
  arrCond: () => combo(['a1', 'a2', 'a3']) as Combinator<('a1' | 'a2' | 'a3' | 'never')[]>,
  fnArr: () => combo(['a1', 'a2', 'a3']) as Combinator<('a1' | 'a2' | 'a3')[]>,
  arrFn: () => combo(['a1', 'a2', 'a3']) as Combinator<('a1' | 'a2' | 'a3')[]>,
  dynArr: () => combo(['a1', 1, 'a1']) as Combinator<['a1', 1, 'a1']>,
  dynArrCond: () => combo(['a1', 1, 'a1']) as Combinator<('a1' | 1 | 'a1' | 'never')[]>,
  arrEmpty: () => combo([]) as Combinator<[]>,

  obj: () => combo({ o1: 'o1', o2: 'o2', o3: 'o3' }) as Combinator<{ o1: 'o1', o2: 'o2', o3: 'o3'}>,
  condObj: () => combo({ o1: 'o1', o2: 'o2', o3: 'o3' }) as Combinator<And<{ o1?: 'o1', never?: 'never' }, { o2: 'o2', o3: 'o3' }>>,
  objCond: () => combo({ o1: 'o1', o2: 'o2', o3: 'o3' }) as Combinator<And<{ o1: 'o1' }, { o2: 'o2', o3: 'o3' } | { never: 'never' }>>,
  dynObj: () => combo({ o1: 'o1', l: 1, copy: 'o1' }) as Combinator<{ o1: 'o1', l: number, copy: 'o1' }>,
  dynObjCond: () => combo({ o1: 'o1', l: 1, copy: 'o1' }) as Combinator<And<{ o1: 'o1' }, { l: number, copy: 'o1' } | { never: 'never' }>>,
  objEmpty: () => combo({}) as Combinator<{}>,

  errorFn: (t: any) => () => new TypeError('Function', t),
  errorP1: (t: any) => () => new TypeError('Combinator<Arr | Obj> | Arr | Obj', t),
  errorP2Arr: (t1: any, t2: any) => () => new MergeError('[...arr, ...obj]', t1, t2),
  errorP2Obj: (t1: any, t2: any) => () => new MergeError('{...obj, ...arr}', t1, t2),
};

describe('and', () => {
  describe('arr', () => {
    describe('basic', () => {
      it('[] + []', () => success(() => and(p1.arrEmpty(), p2.arrEmpty), out.arrEmpty));
      it('[_] + [_]', () => success(() => and(p1.arr(), p2.arr), out.arr));

      it('[combo(_)] + [_]', () => success(() => and(p1.arrCombo(), p2.arr), out.arr));
      it('combo([_]) + [_]',() => success(() => and(p1.comboArr(), p2.arr), out.arr));
      it('() => [_?] + [_]', () => success(() => and(p1.condArr(), p2.arr), out.condArr));
      it('() => [_] + [_]', () => success(() => and(p1.fnArr(), p2.arr), out.fnArr));
      it('and([_], []) + [_]', () => success(() => and(p1.andArr1(), p2.arr), out.arr));
      it('and([], [_]) + [_]', () => success(() => and(p1.andArr2(), p2.arr), out.arr));

      it('[_] + [combo(_)]', () => success(() => and(p1.arr(), p2.arrCombo), out.arr));
      it('[_] + combo([_])', () => success(() => and(p1.arr(), p2.comboArr), out.arr));
      it('[_] + () => [_?]', () => success(() => and(p1.arr(), p2.condArr), out.arrCond));
      it('[_] + () => [_]', () => success(() => and(p1.arr(), p2.fnArr), out.arrFn));
      it('[_] + and([_], [])', () => success(() => and(p1.arr(), p2.andArr1), out.arr));
      it('[_] + and([], [_])', () => success(() => and(p1.arr(), p2.andArr2), out.arr));
    });
    describe('arr with input usage', () => {
      it('[_] + [t]', () => success(() => and(p1.arr(), p2.dynArr), out.dynArr));
      it('[_] + [combo(t)]', () => success(() => and(p1.arr(), p2.dynArrCombo), out.dynArr));
      it('[_] + combo([t])', () => success(() => and(p1.arr(), p2.dynComboArr), out.dynArr));
      it('[_] + () => [t?]', () => success(() => and(p1.arr(), p2.dynCondArr), out.dynArrCond));
      it('[_] + () => [t]', () => success(() => and(p1.arr(), p2.dynFnArr), out.dynArr));
      it('[_] + and([t], [])', () => success(() => and(p1.arr(), p2.dynAndArr1), out.dynArr));
      it('[_] + and([], [t])', () => success(() => and(p1.arr(), p2.dynAndArr2), out.dynArr));
    });
    describe('arrCombo with input usage', () => {
      it('[combo(_)] + [t]', () => success(() => and(p1.arrCombo(), p2.dynArr), out.dynArr));
      it('[combo(_)] + [combo(t)]', () => success(() => and(p1.arrCombo(), p2.dynArrCombo), out.dynArr));
      it('[combo(_)] + combo([t])', () => success(() => and(p1.arrCombo(), p2.dynComboArr), out.dynArr));
      it('[combo(_)] + () => [t?]', () => success(() => and(p1.arrCombo(), p2.dynCondArr), out.dynArrCond));
      it('[combo(_)] + () => [t]', () => success(() => and(p1.arrCombo(), p2.dynFnArr), out.dynArr));
      it('[combo(_)] + and([t], [])', () => success(() => and(p1.arrCombo(), p2.dynAndArr1), out.dynArr));
      it('[combo(_)] + and([], [t])', () => success(() => and(p1.arrCombo(), p2.dynAndArr2), out.dynArr));
    });
  });
  describe('obj', () => {
    describe('basic', () => {
      it('{} + {}', () => success(() => and(p1.objEmpty(), p2.objEmpty), out.objEmpty));
      it('{_} + {_}', () => success(() => and(p1.obj(), p2.obj), out.obj));

      it('{combo(_)} + {_}', () => success(() => and(p1.objCombo(), p2.obj), out.obj));
      it('combo({_}) + {_}', () => success(() => and(p1.comboObj(), p2.obj), out.obj));
      it('() => {_?} + {_}', () => success(() => and(p1.condObj(), p2.obj), out.condObj));
      it('() => {_} + {_}', () => success(() => and(p1.fnObj(), p2.obj), out.obj));
      it('and({_}, {}) + {_}', () => success(() => and(p1.andObj1(), p2.obj), out.obj));
      it('and({}, {_}) + {_}', () => success(() => and(p1.andObj2(), p2.obj), out.obj));

      it('{_} + {combo(_)}', () => success(() => and(p1.obj(), p2.objCombo), out.obj));
      it('{_} + combo({_})', () => success(() => and(p1.obj(), p2.comboObj), out.obj));
      it('{_} + () => {_?}', () => success(() => and(p1.obj(), p2.condObj), out.objCond));
      it('{_} + () => {_}', () => success(() => and(p1.obj(), p2.fnObj), out.obj));
      it('{_} + and({_}, {})', () => success(() => and(p1.obj(), p2.andObj1), out.obj));
      it('{_} + and({}, {_})', () => success(() => and(p1.obj(), p2.andObj2), out.obj));
    });
    describe('obj with input usage', () => {
      it('{_} + {t}', () => success(() => and(p1.obj(), p2.dynObj), out.dynObj));
      it('{_} + {combo(t)}', () => success(() => and(p1.obj(), p2.dynObjCombo), out.dynObj));
      it('{_} + combo({t})', () => success(() => and(p1.obj(), p2.dynComboObj), out.dynObj));
      it('{_} + () => {t?}', () => success(() => and(p1.obj(), p2.dynCondObj), out.dynObjCond));
      it('{_} + () => {t}', () => success(() => and(p1.obj(), p2.dynFnObj), out.dynObj));
      it('{_} + and([t], [])', () => success(() => and(p1.obj(), p2.dynAndObj1), out.dynObj));
      it('{_} + and([], [t])', () => success(() => and(p1.obj(), p2.dynAndObj2), out.dynObj));
    });
    describe('objCombo with input usage', () => {
      it('{combo(_)} + {t}', () => success(() => and(p1.objCombo(), p2.dynObj), out.dynObj));
      it('{combo(_)} + {combo(t)}', () => success(() => and(p1.objCombo(), p2.dynObjCombo), out.dynObj));
      it('{combo(_)} + combo({t})', () => success(() => and(p1.objCombo(), p2.dynComboObj), out.dynObj));
      it('{combo(_)} + () => {t?}', () => success(() => and(p1.objCombo(), p2.dynCondObj), out.dynObjCond));
      it('{combo(_)} + () => {t}', () => success(() => and(p1.objCombo(), p2.dynFnObj), out.dynObj));
      it('{combo(_)} + and([t], [])', () => success(() => and(p1.objCombo(), p2.dynAndObj1), out.dynObj));
      it('{combo(_)} + and([], [t])', () => success(() => and(p1.objCombo(), p2.dynAndObj2), out.dynObj));
    });
  });
  describe('errors', () => {
    describe('missing function', () => {
      it('and(_, nonFunction)', () => error(() => and('_' as any, 'not a function' as any), out.errorFn('not a function')));
    });
    describe('wrong p1', () => {
      it('and(str, (t) => _)', () => error(() => and('str' as any, (_t: any) => '_' as never), out.errorP1('str')));
      it('and(combo(combo(str)), (t) => _)', () => error(() => and(combo(combo('str')) as any, (_t) => '_' as never), out.errorP1(combo('str'))));
    });
    describe('arr-obj', () => {
      it('and([], {})', () => error(() => and([], (t) => ({} as never)), out.errorP2Arr([], {})));
      it('and([], combo({}))', () => error(() => and([], (t) => combo({} as any)), out.errorP2Arr([], {})));
      it('and(combo([]), {})', () => error(() => and(combo([]), (t) => ({} as never)), out.errorP2Arr([], {})));
      it('and(combo(combo([])), combo(combo({})))', () => error(() => and(combo([]), (t) => combo({}) as never), out.errorP2Arr([], {})));
    });
    describe('obj-arr', () => {
      it('and({}, [])', () => error(() => and({}, (t) => [] as never), out.errorP2Obj({}, [])));
      it('and({}, (t) => combo([]))', () => error(() => and({}, (t) => combo([]) as never), out.errorP2Obj({}, [])));
      it('and(combo({}), (t) => [])', () => error(() => and(combo({}), (t) => [] as never), out.errorP2Obj({}, [])));
      it('and(combo(combo({})), (t) => combo(combo([])))', () => error(() => and(combo({}), (t) => combo([]) as never), out.errorP2Obj({}, [])));
    });
  });
  describe('extra tests', () => {
    it('and with matching tuples', () => success(() => and([1], (t) => t[0] === 1 ? [2, 3] : [4, 5]), () => combo([1, 2, 3]) as Combinator<[1, 2 | 4, 3 | 5]>));
    it('and with non-matching tuples', () => success(() => and([1], (t) => t[0] === 1 ? combo([2, 3]) : [4]), () => combo([1, 2, 3]) as Combinator<(1 | 2 | 3 | 4)[]>));
    it('and with combinator', () => success(() => and(combo([], [1]) as Combinator<[1?]>, (t) => t[0] === 1 ? t : [2, 3]), () => combo([2, 3], [1, 1]) as Combinator<(1 | 2 | 3)[]>));
  });
  describe('typecheck', () => {
    describe('invalid', () => {
      it('overlap gives never', () => expectTypeOf(and(p1.obj(), (t) => t as { o1: 'o1' })).toEqualTypeOf<Combinator<{ o1: 'o1' }>>());
      it('arr + obj gives never', () => expectTypeOf(and(p1.arr(), p2.obj as any)).toEqualTypeOf<Combinator<never>>());
      it('obj + arr gives never', () => expectTypeOf(and(p1.obj(), p2.arr as any)).toEqualTypeOf<Combinator<never>>());
    });
    describe('and(and(and(_, _), _), _)', () => {
      it('and(and(and([1, 2], [3]), [4]), [5])', () => expectTypeOf(and(and(and([1], (t3) => [2]), (t2) => [3]), (t1) => [4])).toEqualTypeOf<Combinator<[1, 2, 3, 4]>>());
      it('and(and(and({ a: 1 }, { b: 2 }), { c: 3 }), { d: 4 })', () => expectTypeOf(and(and(and({ a: 1 }, (t3) => ({ b: 2 })), (t2) => ({ c: 3 })), (t1) => ({ d: 4 }))).toEqualTypeOf<Combinator<{ a: 1, b: 2, c: 3, d: 4 }>>());
    });
    describe('and(_, and(_, and(_, _)))', () => {
      it('and([1], and([2], and([3], [4])))', () => expectTypeOf(and([1], (t1) => and([2], (t2) => and([3], (t3) => [4])))).toEqualTypeOf<Combinator<[1, 2, 3, 4]>>());
      it('and({ a: 1 }, and({ b: 2 }, and({ c: 3 }, { d: 4 })))', () => expectTypeOf(and({ a: 1 }, (t1) => and({ b: 2 }, (t2) => and({ c: 3 }, (t3) => ({ d: 4 }))))).toEqualTypeOf<Combinator<{ a: 1, b: 2, c: 3, d: 4 }>>());
    });
    describe('and(and(_, _), and(_, _))', () => {
      it('and(and([1], [2]), and([3], [4]))', () => expectTypeOf(and(and([1], (t1) => [2]), (t2) => and([3], (t3) => [4]))).toEqualTypeOf<Combinator<[1, 2, 3, 4]>>());
      it('and(and({ a: 1 }, { b: 2 }), and({c: 3 }, { d: 4 }))', () => expectTypeOf(and(and({ a: 1 }, (t1) => ({ b: 2 })), (t2) => and({ c: 3 }, (t3) => ({ d: 4 })))).toEqualTypeOf<Combinator<{ a: 1, b: 2, c: 3, d: 4 }>>());
    });
    describe('and(combo(combo(_)), _), non-literal', () => {
      it('and(combo(combo([1])), [2])', () => expectTypeOf(and(comboNonLiteral(combo([1])), (t) => [2])).toEqualTypeOf<Combinator<[1, 2]>>());
      it('and(combo(combo({ a: 1 })), { b: 2 })', () => expectTypeOf(and(comboNonLiteral(combo({ a: 1 })), (t) => ({ b: 2 }))).toEqualTypeOf<Combinator<{ a: 1, b: 2 }>>());
    });
    describe('and(_, combo(combo(_))), non-literal', () => {
      it('and([1], combo(combo([2])))', () => expectTypeOf(and([1], (t) => comboNonLiteral(combo([2])))).toEqualTypeOf<Combinator<[1, 2]>>());
      it('and({ a: 1 }, combo(combo({ b: 2 })))', () => expectTypeOf(and({ a: 1 }, (t) => comboNonLiteral(combo({ b: 2 })))).toEqualTypeOf<Combinator<{ a: 1, b: 2 }>>());
    });
    it('and with union of objects with different-length array values', () =>
      expectTypeOf(
        and(
          (Math.random() > 0.5
            ? { dbSetup: [1, 2] as const, cookie: undefined as undefined }
            : { dbSetup: [1, 2, 3, 4] as const, cookie: 'token' as string }
          ),
          (f1) => ({ body: 'b' as const })
        )
      ).toEqualTypeOf<Combinator<{ dbSetup: (1 | 2 | 3 | 4)[], cookie: string | undefined, body: 'b' }>>()
    );
  });
});