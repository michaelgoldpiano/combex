import { describe, it } from 'vitest';
import { success, gen, combo, comboNonLiteral } from '../test/testUtils';
import type { Combinator } from '../types';
import { permutationArr, permutationObj } from './permutation';

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
  arr: () => gen(
    ['a1', 'a2', 'a3'],
    ['a1', 'a3', 'a2'],
    ['a2', 'a1', 'a3'],
    ['a2', 'a3', 'a1'],
    ['a3', 'a1', 'a2'],
    ['a3', 'a2', 'a1'],
  ) as unknown as Generator<('a1' | 'a2' | 'a3')[]>,
  arrCombo: () => gen(
    [combo('a1', 'a2'), comboNonLiteral(combo('a3', 'a4'))],
    [comboNonLiteral(combo('a3', 'a4')), combo('a1', 'a2')],
  ) as unknown as Generator<(Combinator<'a1' | 'a2'> | Combinator<'a3' | 'a4'>)[]>,
  arrLiteral: () => gen(
    ['a1', combo('a2', combo('a3'))],
    [combo('a2', combo('a3')), 'a1'],
  ) as unknown as Generator<('a1' | Combinator<'a2' | Combinator<'a3'>>)[]>,
  arrOne: () => gen(['a1']) as unknown as Generator<('a1')[]>,
  arrEmpty: () => gen([]) as unknown as Generator<never[]>,

  obj: () => gen(
    { o1: 'o1', o2: 'o2', o3: 'o3' },
    { o1: 'o1', o3: 'o3', o2: 'o2' },
    { o2: 'o2', o1: 'o1', o3: 'o3' },
    { o2: 'o2', o3: 'o3', o1: 'o1' },
    { o3: 'o3', o1: 'o1', o2: 'o2' },
    { o3: 'o3', o2: 'o2', o1: 'o1' },
  ) as Generator<Record<'o1' | 'o2' | 'o3', 'o1' | 'o2' | 'o3'>>,
  objCombo: () => gen(
    { o1: combo('o1.1', 'o1.2'), o2: combo('o2.1', 'o2.2') },
    { o2: combo('o2.1', 'o2.2'), o1: combo('o1.1', 'o1.2') },
  ) as Generator<Record<'o1' | 'o2', Combinator<'o1.1' | 'o1.2'> | Combinator<'o2.1' | 'o2.2'>>>,
  objLiteral: () => gen(
    { o1: 'o1', o2: combo('o2', combo('o3')) },
    { o2: combo('o2', combo('o3')), o1: 'o1' },
  ) as Generator<Record<'o1' | 'o2', 'o1' | Combinator<'o2' | Combinator<'o3'>>>>,
  objOne: () => gen({ o1: 'o1' }) as Generator<Record<'o1', 'o1'>>,
  objEmpty: () => gen({}) as Generator<Record<never, never>>,
};

describe('permute', () => {
  describe('arr', () => {
    it('[_, _, _]', () => success(() => permutationArr(p1.arr()), out.arr));
    it('[combo(_, _), combo(_, _)]', () => success(() => permutationArr(p1.arrCombo()), out.arrCombo));
    it('[_, combo(_, combo(_))]', () => success(() => permutationArr(p1.arrLiteral()), out.arrLiteral));
    it('[_]', () => success(() => permutationArr(p1.arrOne()), out.arrOne));
    it('[]', () => success(() => permutationArr(p1.arrEmpty()), out.arrEmpty));
  });

  describe('obj', () => {
    it('{_, _, _}', () => success(() => permutationObj(p1.obj()), out.obj));
    it('{combo(_, _), combo(_, _)}', () => success(() => permutationObj(p1.objCombo()), out.objCombo));
    it('{_, combo(_, combo(_))}', () => success(() => permutationObj(p1.objLiteral()), out.objLiteral));
    it('{_}', () => success(() => permutationObj(p1.objOne()), out.objOne));
    it('{}', () => success(() => permutationObj(p1.objEmpty()), out.objEmpty));
  });
});