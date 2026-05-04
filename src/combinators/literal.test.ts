import { describe, it } from 'vitest';
import { success, combo, comboNonLiteral } from '../test/testUtils';
import type { Combinator } from '../types';
import { literal } from './literal';

const p1 = {
  arr: () => ['a1', 'a2'] as const,
  arrCombo: () => [combo('a1'), combo('a2')] as const,
  comboArr: () => comboNonLiteral(combo(['a1', 'a2'] as const)),
  literalArr: () => literal(['a1', 'a2'] as const),
  arrEmpty: () => [] as const,

  obj: () => ({ o1: 'o1', o2: 'o2' } as const),
  objCombo: () => ({ o1: combo('o1'), o2: combo('o2') } as const),
  comboObj: () => comboNonLiteral(combo({ o1: 'o1', o2: 'o2' } as const)),
  literalObj: () => literal({ o1: 'o1', o2: 'o2' } as const),
  objEmpty: () => ({} as const),
};

const out = {
  arr: () => combo(['a1', 'a2']) as Combinator<readonly ['a1', 'a2']>,
  arrCombo: () => combo([combo('a1'), combo('a2')]) as Combinator<readonly [Combinator<'a1'>, Combinator<'a2'>]>,
  comboArr: () => combo(comboNonLiteral(combo(['a1', 'a2']))) as Combinator<Combinator<readonly ['a1', 'a2']>>,
  literalArr: () => combo(literal(['a1', 'a2'])) as Combinator<Combinator<readonly ['a1', 'a2']>>,
  arrEmpty: () => combo([]) as Combinator<readonly []>,

  obj: () => combo({ o1: 'o1', o2: 'o2' }) as Combinator<{ o1: 'o1', o2: 'o2' }>,
  objCombo: () => combo({ o1: combo('o1'), o2: combo('o2') }) as Combinator<{ o1: Combinator<'o1'>, o2: Combinator<'o2'> }>,
  comboObj: () => combo(comboNonLiteral(combo({ o1: 'o1', o2: 'o2' }))) as Combinator<Combinator<{ o1: 'o1', o2: 'o2' }>>,
  literalObj: () => combo(literal({ o1: 'o1', o2: 'o2' })) as Combinator<Combinator<{ o1: 'o1', o2: 'o2' }>>,
  objEmpty: () => combo({}) as Combinator<{}>,
};

describe('literal', () => {
  describe('arr', () => {
    it('[_, _]', () => success(() => literal(p1.arr()), out.arr));
    it('[combo(_), combo(_)]', () => success(() => literal(p1.arrCombo()), out.arrCombo));
    it('combo([_, _])', () => success(() => literal(p1.comboArr()), out.comboArr));
    it('lit([_, _])', () => success(() => literal(p1.literalArr()), out.literalArr));
    it('[]', () => success(() => literal(p1.arrEmpty()), out.arrEmpty));
  });

  describe('obj', () => {
    it('{_, _}', () => success(() => literal(p1.obj()), out.obj));
    it('{combo(_), combo(_)}', () => success(() => literal(p1.objCombo()), out.objCombo));
    it('combo({_, _})', () => success(() => literal(p1.comboObj()), out.comboObj));
    it('lit({_, _})', () => success(() => literal(p1.literalObj()), out.literalObj));
    it('{}', () => success(() => literal(p1.objEmpty()), out.objEmpty));
  });
});