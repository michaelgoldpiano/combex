import { describe, it } from 'vitest';
import { success, gen, combo, comboNonLiteral } from '../test/testUtils';
import type { Combinator } from '../types';
import { powersetArr, powersetObj } from './powerset';

const p1 = {
  arr: () => ['a1', 'a2'] as const,
  arrArr: () => [['a1'], ['a2']] as const,
  arrCombo: () => [combo('a1', 'a2'), comboNonLiteral(combo('a3', 'a4'))] as const,
  arrLiteral: () => ['l1', combo('l2', combo('l3'))] as const,
  arrEmpty: () => [] as const,

  obj: () => ({ o1: 'o1', o2: 'o2' } as const),
  objObj: () => ({ o1: { o1: 'o1' }, o2: { o2: 'o2' }} as const),
  objCombo: () => ({ o1: combo('o1.1', 'o1.2'), o2: comboNonLiteral(combo('o2.1', 'o2.2')) } as const),
  objLiteral: () => ({ l1: 'l1', l2: combo('l2', combo('l3'))} as const),
  objEmpty: () => ({} as const),
};

const out = {
  empty: {
    arr: () => gen([], ['a1'], ['a2'], ['a1', 'a2']) as Generator<readonly ['a1'?, 'a2'?]>,
    arrArr: () => gen([], [['a1']], [['a2']], [['a1'], ['a2']]) as Generator<readonly [(readonly ['a1'])?, (readonly ['a2'])?]>,
    arrCombo: () => gen([], [combo('a1', 'a2')], [combo('a3', 'a4')], [combo('a1', 'a2'), combo('a3', 'a4')]) as Generator<readonly [Combinator<'a1' | 'a2'>?, Combinator<'a3' | 'a4'>?]>,
    arrLiteral: () => gen([], ['l1'], [combo('l2', combo('l3'))], ['l1', combo('l2', combo('l3'))]) as Generator<readonly ['l1'?, Combinator<'l2' | Combinator<'l3'>>?]>,
    arrEmpty: () => gen([]) as Generator<readonly []>,

    obj: () => gen({}, { o1: 'o1' }, { o2: 'o2' }, { o1: 'o1', o2: 'o2' }) as Generator<{ o1?: 'o1', o2?: 'o2' }>,
    objObj: () => gen({}, { o1: { o1: 'o1' }}, { o2: { o2: 'o2' }}, { o1: { o1: 'o1' }, o2: { o2: 'o2' }}) as Generator<{ o1?: { o1: 'o1' }, o2?: { o2: 'o2' }}>,
    objCombo: () => gen({}, { o1: combo('o1.1', 'o1.2') }, { o2: combo('o2.1', 'o2.2') }, { o1: combo('o1.1', 'o1.2'), o2: combo('o2.1', 'o2.2') }) as Generator<{ o1?: Combinator<'o1.1' | 'o1.2'>, o2?: Combinator<'o2.1' | 'o2.2'> }>,
    objLiteral: () => gen({}, { l1: 'l1' }, { l2: combo('l2', combo('l3')) }, { l1: 'l1', l2: combo('l2', combo('l3')) }) as Generator<{ l1?: 'l1', l2?: Combinator<'l2' | Combinator<'l3'>> }>,
    objEmpty: () => gen({}) as Generator<{}>,
  },
  nonEmpty: {
    arr: () => gen(['a1'], ['a2'], ['a1', 'a2']) as Generator<readonly ['a1'?, 'a2'?]>,
    arrArr: () => gen([['a1']], [['a2']], [['a1'], ['a2']]) as Generator<readonly [(readonly ['a1'])?, (readonly ['a2'])?]>,
    arrCombo: () => gen([combo('a1', 'a2')], [combo('a3', 'a4')], [combo('a1', 'a2'), combo('a3', 'a4')]) as Generator<readonly [Combinator<'a1' | 'a2'>?, Combinator<'a3' | 'a4'>?]>,
    arrLiteral: () => gen(['l1'], [combo('l2', combo('l3'))], ['l1', combo('l2', combo('l3'))]) as Generator<readonly ['l1'?, Combinator<'l2' | Combinator<'l3'>>?]>,
    arrEmpty: () => gen() as Generator<never>,

    obj: () => gen({ o1: 'o1' }, { o2: 'o2' }, { o1: 'o1', o2: 'o2' }) as Generator<{ o1?: 'o1', o2?: 'o2' }>,
    objObj: () => gen({ o1: { o1: 'o1' }}, { o2: { o2: 'o2' }}, { o1: { o1: 'o1' }, o2: { o2: 'o2' }}) as Generator<{ o1?: { o1: 'o1' }, o2?: { o2: 'o2' }}>,
    objCombo: () => gen({ o1: combo('o1.1', 'o1.2') }, { o2: combo('o2.1', 'o2.2') }, { o1: combo('o1.1', 'o1.2'), o2: combo('o2.1', 'o2.2') }) as Generator<{ o1?: Combinator<'o1.1' | 'o1.2'>, o2?: Combinator<'o2.1' | 'o2.2'> }>,
    objLiteral: () => gen({ l1: 'l1' }, { l2: combo('l2', combo('l3')) }, { l1: 'l1', l2: combo('l2', combo('l3')) }) as Generator<{ l1?: 'l1', l2?: Combinator<'l2' | Combinator<'l3'>> }>,
    objEmpty: () => gen() as Generator<never>,
  },
};

describe('powerset', () => {
  describe('arr', () => {
    describe('including empty', () => {
      it('[_, _]', () => success(() => powersetArr(p1.arr(), true), out.empty.arr));
      it('[[_], [_]]', () => success(() => powersetArr(p1.arrArr(), true), out.empty.arrArr));
      it('[combo(_), combo(_)]', () => success(() => powersetArr(p1.arrCombo(), true), out.empty.arrCombo));
      it('[_, lit(_, combo(_))]', () => success(() => powersetArr(p1.arrLiteral(), true), out.empty.arrLiteral));
      it('[]', () => success(() => powersetArr(p1.arrEmpty(), true), out.empty.arrEmpty));
    });
    describe('not including empty', () => {
      it('[_, _]', () => success(() => powersetArr(p1.arr(), false), out.nonEmpty.arr));
      it('[[_], [_]]', () => success(() => powersetArr(p1.arrArr(), false), out.nonEmpty.arrArr));
      it('[combo(_), combo(_)]', () => success(() => powersetArr(p1.arrCombo(), false), out.nonEmpty.arrCombo));
      it('[_, lit(_, combo(_))]', () => success(() => powersetArr(p1.arrLiteral(), false), out.nonEmpty.arrLiteral));
      it('[]', () => success(() => powersetArr(p1.arrEmpty(), false), out.nonEmpty.arrEmpty));
    });
  });

  describe('obj', () => {
    describe('including empty', () => {
      it('obj', () => success(() => powersetObj(p1.obj(), true), out.empty.obj));
      it('{{_}, {_}}', () => success(() => powersetObj(p1.objObj(), true), out.empty.objObj));
      it('{combo(_), combo(_)}', () => success(() => powersetObj(p1.objCombo(), true), out.empty.objCombo));
      it('{_, lit(_, combo(_))}', () => success(() => powersetObj(p1.objLiteral(), true), out.empty.objLiteral));
      it('{}', () => success(() => powersetObj(p1.objEmpty(), true), out.empty.objEmpty));
    });
    describe('not including empty', () => {
      it('obj', () => success(() => powersetObj(p1.obj(), false), out.nonEmpty.obj));
      it('{{_}, {_}}', () => success(() => powersetObj(p1.objObj(), false), out.nonEmpty.objObj));
      it('{combo(_), combo(_)}', () => success(() => powersetObj(p1.objCombo(), false), out.nonEmpty.objCombo));
      it('{_, lit(_, combo(_))}', () => success(() => powersetObj(p1.objLiteral(), false), out.nonEmpty.objLiteral));
      it('{}', () => success(() => powersetObj(p1.objEmpty(), false), out.nonEmpty.objEmpty));
    });
  });
});