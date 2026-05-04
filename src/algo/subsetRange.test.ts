import { describe, it } from 'vitest';
import { success, gen, combo, comboNonLiteral } from '../test/testUtils';
import type { Combinator } from '../types';
import { subsetRangeArr, subsetRangeObj } from './subsetRange';

const p1 = {
  arr: () => ['a1', 'a2', 'a3', 'a4', 'a5'] as const,
  arrArr: () => [['a1'], ['a2'], ['a3']] as const,
  arrCombo: () => [combo('a1', 'a2'), comboNonLiteral(combo('a3', 'a4')), combo('a5')] as const,
  arrLiteral: () => ['a1', combo('a2', combo('a3')), 'a4'] as const,
  arrEmpty: () => [] as const,

  obj: () => ({ o1: 'o1', o2: 'o2', o3: 'o3', o4: 'o4', o5: 'o5' } as const),
  objObj: () => ({ o1: { o1: 'o1' }, o2: { o2: 'o2' }, o3: { o3: 'o3' } } as const),
  objCombo: () => ({ o1: combo('o1.1', 'o1.2'), o2: comboNonLiteral(combo('o2.1', 'o2.2')), o3: combo('o3') } as const),
  objLiteral: () => ({ o1: 'o1', o2: combo('o2.1', combo('o2.2')), o3: 'o3'} as const),
  objEmpty: () => ({} as const),
};

const out = {
  arr: () => gen(
    ['a1', 'a2'],
    ['a1', 'a3'],
    ['a1', 'a4'],
    ['a1', 'a5'],
    ['a2', 'a3'],
    ['a2', 'a4'],
    ['a2', 'a5'],
    ['a3', 'a4'],
    ['a3', 'a5'],
    ['a4', 'a5'],
    ['a1', 'a2', 'a3'],
    ['a1', 'a2', 'a4'],
    ['a1', 'a2', 'a5'],
    ['a1', 'a3', 'a4'],
    ['a1', 'a3', 'a5'],
    ['a1', 'a4', 'a5'],
    ['a2', 'a3', 'a4'],
    ['a2', 'a3', 'a5'],
    ['a2', 'a4', 'a5'],
    ['a3', 'a4', 'a5'],
  ) as Generator<readonly ['a1'?, 'a2'?, 'a3'?, 'a4'?, 'a5'?]>,
  arrArr: () => gen(
    [],
    [['a1']],
    [['a2']],
    [['a3']],
    [['a1'], ['a2']],
    [['a1'], ['a3']],
    [['a2'], ['a3']],
  ) as Generator<readonly [(readonly ['a1'])?, (readonly ['a2'])?, (readonly ['a3'])?]>,
  arrCombo: () => gen(
    [combo('a1', 'a2')],
    [combo('a3', 'a4')],
    [combo('a5')],
    [combo('a1', 'a2'), combo('a3', 'a4')],
    [combo('a1', 'a2'), combo('a5')],
    [combo('a3', 'a4'), combo('a5')],
  ) as Generator<readonly [Combinator<'a1' | 'a2'>?, Combinator<'a3' | 'a4'>?, Combinator<'a5'>?]>,
  arrLiteral: () => gen(
    ['a1', combo('a2', combo('a3'))],
    ['a1', 'a4'],
    [combo('a2', combo('a3')), 'a4'],
  ) as Generator<readonly ['a1'?, Combinator<'a2' | Combinator<'a3'>>?, 'a4'?]>,
  arrEmpty: () => gen([]) as Generator<readonly []>,

  obj: () => gen(
    { o1: 'o1', o2: 'o2' },
    { o1: 'o1', o3: 'o3' },
    { o1: 'o1', o4: 'o4' },
    { o1: 'o1', o5: 'o5' },
    { o2: 'o2', o3: 'o3' },
    { o2: 'o2', o4: 'o4' },
    { o2: 'o2', o5: 'o5' },
    { o3: 'o3', o4: 'o4' },
    { o3: 'o3', o5: 'o5' },
    { o4: 'o4', o5: 'o5' },
    { o1: 'o1', o2: 'o2', o3: 'o3' },
    { o1: 'o1', o2: 'o2', o4: 'o4' },
    { o1: 'o1', o2: 'o2', o5: 'o5' },
    { o1: 'o1', o3: 'o3', o4: 'o4' },
    { o1: 'o1', o3: 'o3', o5: 'o5' },
    { o1: 'o1', o4: 'o4', o5: 'o5' },
    { o2: 'o2', o3: 'o3', o4: 'o4' },
    { o2: 'o2', o3: 'o3', o5: 'o5' },
    { o2: 'o2', o4: 'o4', o5: 'o5' },
    { o3: 'o3', o4: 'o4', o5: 'o5' },
  ) as Generator<{ o1?: 'o1', o2?: 'o2', o3?: 'o3', o4?: 'o4', o5?: 'o5' }>,
  objObj: () => gen(
    {},
    { o1: { o1: 'o1' } },
    { o2: { o2: 'o2' } },
    { o3: { o3: 'o3' } },
    { o1: { o1: 'o1' }, o2: { o2: 'o2' } },
    { o1: { o1: 'o1' }, o3: { o3: 'o3' } },
    { o2: { o2: 'o2' }, o3: { o3: 'o3' } },
  ) as Generator<{ o1?: { o1: 'o1' }, o2?: { o2: 'o2' }, o3?: { o3: 'o3' } }>,
  objCombo: () => gen(
    { o1: combo('o1.1', 'o1.2') },
    { o2: combo('o2.1', 'o2.2') },
    { o3: combo('o3') },
    { o1: combo('o1.1', 'o1.2'), o2: combo('o2.1', 'o2.2') },
    { o1: combo('o1.1', 'o1.2'), o3: combo('o3') },
    { o2: combo('o2.1', 'o2.2'), o3: combo('o3') },
  ) as Generator<{ o1?: Combinator<'o1.1' | 'o1.2'>, o2?: Combinator<'o2.1' | 'o2.2'>, o3?: Combinator<'o3'> }>,
  objLiteral: () => gen(
    { o1: 'o1', o2: combo('o2.1', combo('o2.2')) },
    { o1: 'o1', o3: 'o3' },
    { o2: combo('o2.1', combo('o2.2')), o3: 'o3' },
  ) as Generator<{ o1?: 'o1', o2?: Combinator<'o2.1' | Combinator<'o2.2'>>, o3?: 'o3' }>,
  objEmpty: () => gen({}) as Generator<{}>,
};

describe('subsetRange', () => {
  describe('arr', () => {
    it('[_, _]', () => success(() => subsetRangeArr(p1.arr(), 2, 3), out.arr));
    it('[[_], [_]]', () => success(() => subsetRangeArr(p1.arrArr(), 0, 2), out.arrArr));
    it('[combo(_), combo(_)]', () => success(() => subsetRangeArr(p1.arrCombo(), 1, 2), out.arrCombo));
    it('[_, lit(_, combo(_))]', () => success(() => subsetRangeArr(p1.arrLiteral(), 2, 2), out.arrLiteral));
    it('[]', () => success(() => subsetRangeArr(p1.arrEmpty(), 0, 0), out.arrEmpty));
  });
  describe('obj', () => {
    it('obj', () => success(() => subsetRangeObj(p1.obj(), 2, 3), out.obj));
    it('{{_}, {_}}', () => success(() => subsetRangeObj(p1.objObj(), 0, 2), out.objObj));
    it('{combo(_), combo(_)}', () => success(() => subsetRangeObj(p1.objCombo(), 1, 2), out.objCombo));
    it('{_, lit(_, combo(_))}', () => success(() => subsetRangeObj(p1.objLiteral(), 2, 2), out.objLiteral));
    it('{}', () => success(() => subsetRangeObj(p1.objEmpty(), 0, 0), out.objEmpty));
  });
});