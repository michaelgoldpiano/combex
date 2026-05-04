import { describe, it } from 'vitest';
import { success, combo, comboNonLiteral } from '../test/testUtils';
import type { Combinator } from '../types';
import { any } from './any';

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
  arr: () => combo([], ['a1'], ['a2'], ['a1', 'a2']) as Combinator<['a1'?, 'a2'?]>,
  arrArr: () => combo([], [['a1']], [['a2']], [['a1'], ['a2']]) as Combinator<[['a1']?, ['a2']?]>,
  arrCombo: () => combo([], ['a1'], ['a2'], ['a3'], ['a4'], ['a1', 'a3'], ['a1', 'a4'], ['a2', 'a3'], ['a2', 'a4']) as Combinator<[('a1' | 'a2')?, ('a3' | 'a4')?]>,
  arrLiteral: () => combo([], ['l1'], ['l2'], [combo('l3')], ['l1', 'l2'], ['l1', combo('l3')]) as Combinator<['l1'?, ('l2' | Combinator<'l3'>)?]>,
  arrEmpty: () => combo([]) as Combinator<[]>,

  obj: () => combo({}, { o1: 'o1' }, { o2: 'o2' }, { o1: 'o1', o2: 'o2' }) as Combinator<{ o1?: 'o1', o2?: 'o2' }>,
  objObj: () => combo({}, { o1: { o1: 'o1' }}, { o2: { o2: 'o2' }}, { o1: { o1: 'o1' }, o2: { o2: 'o2' }}) as Combinator<{ o1?: { o1: 'o1' }, o2?: { o2: 'o2' }}>,
  objCombo: () => combo({}, { o1: 'o1.1' }, { o1: 'o1.2' }, { o2: 'o2.1' }, { o2: 'o2.2' }, { o1: 'o1.1', o2: 'o2.1' }, { o1: 'o1.1', o2: 'o2.2' }, { o1: 'o1.2', o2: 'o2.1' }, { o1: 'o1.2', o2: 'o2.2' }) as Combinator<{ o1?: 'o1.1' | 'o1.2', o2?: 'o2.1' | 'o2.2' }>,
  objLiteral: () => combo({}, { l1: 'l1' }, { l2: 'l2' }, { l2: combo('l3') }, { l1: 'l1', l2: 'l2' }, { l1: 'l1', l2: combo('l3') }) as Combinator<{ l1?: 'l1', l2?: 'l2' | Combinator<'l3'> }>,
  objEmpty: () => combo({}) as Combinator<{}>,
};

describe('any', () => {
  describe('arr', () => {
    it('[_, _]', () => success(() => any(p1.arr()), out.arr));
    it('[[_], [_]]', () => success(() => any(p1.arrArr()), out.arrArr));
    it('[combo(_), combo(_)]', () => success(() => any(p1.arrCombo()), out.arrCombo));
    it('[_, lit(_, combo(_))]', () => success(() => any(p1.arrLiteral()), out.arrLiteral));
    it('[]', () => success(() => any(p1.arrEmpty()), out.arrEmpty));
  });

  describe('obj', () => {
    it('obj', () => success(() => any(p1.obj()), out.obj));
    it('{{_}, {_}}', () => success(() => any(p1.objObj()), out.objObj));
    it('{combo(_), combo(_)}', () => success(() => any(p1.objCombo()), out.objCombo));
    it('{_, lit(_, combo(_))}', () => success(() => any(p1.objLiteral()), out.objLiteral));
    it('{}', () => success(() => any(p1.objEmpty()), out.objEmpty));
  });
});