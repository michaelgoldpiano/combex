import { describe, it } from 'vitest';
import { success, combo, comboNonLiteral } from '../test/testUtils';
import type { Combinator } from '../types';
import { all } from './all';

const p1 = {
  arr: () => ['a1', 'a2'] as const,
  arrOfArr: () => [['a1'], ['a2']] as const,
  arrOfCombo: () => [combo('a1', 'a2'), comboNonLiteral(combo('a3', 'a4'))] as const,
  obj: () => ({ o1: 'o1', o2: 'o2' } as const),
  objOfObj: () => ({ o1: { o1: 'o1' }, o2: { o2: 'o2' }} as const),
  objOfCombo: () => ({ o1: combo('o1.1', 'o1.2'), o2: comboNonLiteral(combo('o2.1', 'o2.2')) } as const),
  literal: () => ['l1' as const, combo(combo('l2'))] as const,
};

const out = {
  arr: () => combo(['a1', 'a2']) as Combinator<['a1', 'a2']>,
  arrOfArr: () => combo([['a1'], ['a2']]) as Combinator<[['a1'], ['a2']]>,
  arrOfCombo: () => combo(['a1', 'a3'], ['a1', 'a4'], ['a2', 'a3'], ['a2', 'a4']) as Combinator<['a1' | 'a2', 'a3' | 'a4']>,
  obj: () => combo({ o1: 'o1', o2: 'o2' }) as Combinator<{ o1: 'o1', o2: 'o2' }>,
  objOfObj: () => combo({ o1: { o1: 'o1' }, o2: { o2: 'o2' }}) as Combinator<{ o1: { o1: 'o1' }, o2: { o2: 'o2' }}>,
  objOfCombo: () => combo({ o1: 'o1.1', o2: 'o2.1' }, { o1: 'o1.1', o2: 'o2.2' }, { o1: 'o1.2', o2: 'o2.1' }, { o1: 'o1.2', o2: 'o2.2' }) as Combinator<{ o1: 'o1.1' | 'o1.2', o2: 'o2.1' | 'o2.2' }>,
  literal: () => combo(['l1', combo('l2')]) as Combinator<['l1', Combinator<'l2'>]>,
};

describe('any', () => {
  describe('arr', () => {
    it('[_, _]', () => success(() => all(p1.arr()), out.arr));
    it('[combo(_), combo(_)]', () => success(() => all(p1.arrOfCombo()), out.arrOfCombo));
  });

  describe('arrArr', () => {
    it('[[_], [_]]', () => success(() => all(p1.arrOfArr()), out.arrOfArr));
  });

  describe('obj', () => {
    it('obj', () => success(() => all(p1.obj()), out.obj));
    it('{combo(_}, combo(_)}', () => success(() => all(p1.objOfCombo()), out.objOfCombo));
  });

  describe('objObj', () => {
    it('{{_}, {_}}', () => success(() => all(p1.objOfObj()), out.objOfObj));
  });

  describe('literal', () => {
    it('literal', () => success(() => all(p1.literal()), out.literal));
  });
});