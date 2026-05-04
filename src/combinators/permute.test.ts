import { describe, it } from 'vitest';
import { success, combo, comboNonLiteral } from '../test/testUtils';
import type { Combinator } from '../types';
import { permute } from './permute';

const p1 = {
  arr: () => ['a1', 'a2', 'a3'] as const,
  arrCombo: () => [combo('a1', 'a2'), comboNonLiteral(combo('a3', 'a4'))] as const,
  arrLiteral: () => ['a1', combo('a2', combo('a3'))] as const,
  arrOne: () => ['a1'] as const,
  arrEmpty: () => [] as const,

  obj: () => ({ o1: 'o1', o2: 'o2', o3: 'o3' } as const),
  objCombo: () => ({ o1: combo('o1.1', 'o1.2'), o2: comboNonLiteral(combo('o2.1', 'o2.2')) } as const),
  objLiteral: () => ({ o1: 'o1', o2: combo('o2', combo('o3')) } as const),
  objOne: () => ({ o1: 'o1' } as const),
  objEmpty: () => ({} as const),
};

const out = {
  arr: () => combo(
    ['a1', 'a2', 'a3'],
    ['a1', 'a3', 'a2'],
    ['a2', 'a1', 'a3'],
    ['a2', 'a3', 'a1'],
    ['a3', 'a1', 'a2'],
    ['a3', 'a2', 'a1'],
  ) as Combinator<('a1' | 'a2' | 'a3')[]>,
  arrCombo: () => combo(
    ['a1', 'a3'],
    ['a1', 'a4'],
    ['a2', 'a3'],
    ['a2', 'a4'],
    ['a3', 'a1'],
    ['a3', 'a2'],
    ['a4', 'a1'],
    ['a4', 'a2'],
  ) as Combinator<('a1' | 'a2' | 'a3' | 'a4')[]>,
  arrLiteral: () => combo(
    ['a1', 'a2'],
    ['a1', combo('a3')],
    ['a2', 'a1'],
    [combo('a3'), 'a1'],
  ) as Combinator<('a1' | 'a2' | Combinator<'a3'>)[]>,
  arrOne: () => combo(['a1']) as Combinator<('a1')[]>,
  arrEmpty: () => combo([]) as Combinator<never[]>,

  obj: () => combo(
    { o1: 'o1', o2: 'o2', o3: 'o3' },
    { o1: 'o1', o3: 'o3', o2: 'o2' },
    { o2: 'o2', o1: 'o1', o3: 'o3' },
    { o2: 'o2', o3: 'o3', o1: 'o1' },
    { o3: 'o3', o1: 'o1', o2: 'o2' },
    { o3: 'o3', o2: 'o2', o1: 'o1' },
  ) as Combinator<Record<'o1' | 'o2' | 'o3', 'o1' | 'o2' | 'o3'>>,
  objCombo: () => combo(
    { o1: 'o1.1', o2: 'o2.1' },
    { o1: 'o1.1', o2: 'o2.2' },
    { o1: 'o1.2', o2: 'o2.1' },
    { o1: 'o1.2', o2: 'o2.2' },
    { o2: 'o2.1', o1: 'o1.1' },
    { o2: 'o2.1', o1: 'o1.2' },
    { o2: 'o2.2', o1: 'o1.1' },
    { o2: 'o2.2', o1: 'o1.2' },
  ) as Combinator<Record<'o1' | 'o2', 'o1.1' | 'o1.2' | 'o2.1' | 'o2.2'>>,
  objLiteral: () => combo(
    { o1: 'o1', o2: 'o2' },
    { o1: 'o1', o2: combo('o3') },
    { o2: 'o2', o1: 'o1' },
    { o2: combo('o3'), o1: 'o1' },
  ) as Combinator<Record<'o1' | 'o2', 'o1' | 'o2' | Combinator<'o3'>>>,
  objOne: () => combo({ o1: 'o1' }) as Combinator<Record<'o1', 'o1'>>,
  objEmpty: () => combo({}) as Combinator<Record<never, never>>,
};

describe('permute', () => {
  describe('arr', () => {
    it('[_, _, _]', () => success(() => permute(p1.arr()), out.arr));
    it('[combo(_, _), combo(_, _)]', () => success(() => permute(p1.arrCombo()), out.arrCombo));
    it('[_, combo(_, combo(_))]', () => success(() => permute(p1.arrLiteral()), out.arrLiteral));
    it('[_]', () => success(() => permute(p1.arrOne()), out.arrOne));
    it('[]', () => success(() => permute(p1.arrEmpty()), out.arrEmpty));
  });

  describe('obj', () => {
    it('{_, _, _}', () => success(() => permute(p1.obj()), out.obj));
    it('{combo(_, _), combo(_, _)}', () => success(() => permute(p1.objCombo()), out.objCombo));
    it('{_, combo(_, combo(_))}', () => success(() => permute(p1.objLiteral()), out.objLiteral));
    it('{_}', () => success(() => permute(p1.objOne()), out.objOne));
    it('{}', () => success(() => permute(p1.objEmpty()), out.objEmpty));
  });
});