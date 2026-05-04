import { describe, it } from 'vitest';
import { success, gen, combo, comboNonLiteral } from '../test/testUtils';
import type { Combinator } from '../types';
import { productArr, productObj } from './product';

const p1 = {
  arr: () => ['a1', 'a2'] as const,
  arrCombo: () => [combo('a1', 'a2'), comboNonLiteral(combo('a3', 'a4'))] as const,
  arrArrCombo: () => [[combo('a1', 'a2')], [comboNonLiteral(combo('a3', 'a4'))]] as const,
  arrLiteral: () => ['l1', combo('l2', combo('l3'))] as const,
  arrEmpty: () => [] as const,

  obj: () => ({ o1: 'o1', o2: 'o2' } as const),
  objCombo: () => ({ o1: combo('o1.1', 'o1.2'), o2: comboNonLiteral(combo('o2.1', 'o2.2')) } as const),
  objObjCombo: () => ({ o1: { o1: combo('o1', 'o2') }, o2: { o2: comboNonLiteral(combo('o3', 'o4')) }} as const),
  objLiteral: () => ({ l1: 'l1', l2: combo('l2', combo('l3')) } as const),
  objEmpty: () => ({} as const),
};

const out = {
  arr: () => gen(['a1', 'a2']) as Generator<['a1', 'a2']>,
  arrCombo: () => gen(['a1', 'a3'], ['a1', 'a4'], ['a2', 'a3'], ['a2', 'a4']) as Generator<['a1' | 'a2', 'a3' | 'a4']>,
  arrArrCombo: () => gen([['a1'], ['a3']], [['a1'], ['a4']], [['a2'], ['a3']], [['a2'], ['a4']]) as Generator<[['a1' | 'a2'], ['a3' | 'a4']]>,
  arrLiteral: () => gen(['l1', 'l2'], ['l1', combo('l3')]) as Generator<['l1', 'l2' | Combinator<'l3'>]>,
  arrEmpty: () => gen([]) as Generator<[]>,

  obj: () => gen({ o1: 'o1', o2: 'o2' }) as Generator<{ o1: 'o1', o2: 'o2' }>,
  objCombo: () => gen({ o1: 'o1.1', o2: 'o2.1' }, { o1: 'o1.1', o2: 'o2.2' }, { o1: 'o1.2', o2: 'o2.1' }, { o1: 'o1.2', o2: 'o2.2' }) as Generator<{ o1: 'o1.1' | 'o1.2', o2: 'o2.1' | 'o2.2' }>,
  objObjCombo: () => gen({ o1: { o1: 'o1' }, o2: { o2: 'o3' } }, { o1: { o1: 'o1' }, o2: { o2: 'o4' } }, { o1: { o1: 'o2' }, o2: { o2: 'o3' } }, { o1: { o1: 'o2' }, o2: { o2: 'o4' } }) as Generator<{ o1: { o1: 'o1' | 'o2' }, o2: { o2: 'o3' | 'o4' } }>,
  objLiteral: () => gen({ l1: 'l1', l2: 'l2' }, { l1: 'l1', l2: combo('l3') }) as Generator<{ l1: 'l1', l2: 'l2' | Combinator<'l3'> }>,
  objEmpty: () => gen({}) as Generator<{}>,
};

describe('any', () => {
  describe('arr', () => {
    it('[_, _]', () => success(() => productArr(p1.arr()), out.arr));
    it('[combo(_), combo(_)]', () => success(() => productArr(p1.arrCombo()), out.arrCombo));
    it('[[combo(_)], [combo(_)]]', () => success(() => productArr(p1.arrArrCombo()), out.arrArrCombo));
    it('[_, lit(_, combo(_))]', () => success(() => productArr(p1.arrLiteral()), out.arrLiteral));
    it('[]', () => success(() => productArr(p1.arrEmpty()), out.arrEmpty));
  });

  describe('obj', () => {
    it('{_, _}', () => success(() => productObj(p1.obj()), out.obj));
    it('{combo(_), combo(_)}', () => success(() => productObj(p1.objCombo()), out.objCombo));
    it('{{combo(_)}, {combo(_)}}', () => success(() => productObj(p1.objObjCombo()), out.objObjCombo));
    it('{_, lit(_, combo(_))}', () => success(() => productObj(p1.objLiteral()), out.objLiteral));
    it('{}', () => success(() => productObj(p1.objEmpty()), out.objEmpty));
  });
});