import { describe, it } from 'vitest';
import { success, combo, comboNonLiteral } from '../test/testUtils';
import type { Combinator } from '../types';
import { one } from './one';

const p1 = {
  arr: () => ['a1', 'a2'] as const,
  comboArr: () => comboNonLiteral(combo(['a1', 'a2'] as const)),
  arrCombo: () => [combo('a1'), comboNonLiteral(combo('a2'))] as const,
  obj: () => ({ o1: 'o1', o2: 'o2' } as const),
  comboObj: () => comboNonLiteral(combo({ o1: 'o1', o2: 'o2' } as const)),
  objCombo: () => ({ o1: combo('o1'), o2: comboNonLiteral(combo('o2')) } as const),
  default: () => 'd1' as const,
  defaultCombo: () => comboNonLiteral(combo('d1' as const)),
  literal: () => combo(['l1' as const, combo('l2' as const)]),
};

const out = {
  arr: () => combo(['a1', 'a2']) as Combinator<['a1', 'a2']>,
  comboArr: () => combo(['a1', 'a2']) as Combinator<readonly ['a1', 'a2']>,
  obj: () => combo({ o1: 'o1', o2: 'o2' }) as Combinator<{ o1: 'o1', o2: 'o2' }>,
  default: () => combo('d1') as Combinator<'d1'>,
  literal: () => combo(['l1', combo('l2')]) as Combinator<readonly ['l1', Combinator<'l2'>]>,
};

describe('one', () => {
  describe('arr', () => {
    it('arr', () => success(() => one(p1.arr()), out.arr));
    it('combo(arr)', () => success(() => one(p1.comboArr()), out.comboArr));
    it('[combo(_), combo(_)]', () => success(() => one(p1.arrCombo()), out.arr));
  });

  describe('obj', () => {
    it('obj', () => success(() => one(p1.obj()), out.obj));
    it('combo(obj)', () => success(() => one(p1.comboObj()), out.obj));
    it('{combo(_}, combo(_)}', () => success(() => one(p1.objCombo()), out.obj));
  });

  describe('default', () => {
    it('default', () => success(() => one(p1.default()), out.default));
    it('combo(default', () => success(() => one(p1.defaultCombo()), out.default));
  });

  describe('literal', () => {
    it('literal', () => success(() => one(p1.literal()), out.literal));
  });
});