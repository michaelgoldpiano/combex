import { COMBINATOR } from './symbols';

/**
 * Extracts keys that are present in every member of a union type.
 * @example SharedKeys<{ a: 1, b: 2 } | { a: 3, c: 4 }> => 'a'
 */
type SharedKeys<T> = (
  { [K in T extends any ? keyof T : never]: T extends Record<K, any> ? true : false } extends infer R ?
  { [K in keyof R]: R[K] extends true ? K : never }[keyof R]
  : never
);

/**
 * Merges a union of objects into a single object type.
 * Keys present in all members are required; keys present in some members are optional.
 * Values of shared keys are unioned across all members.
 * @example MergeUnion<{ a: 1, b: 2 } | { a: 3, c: 4 }> => { a: 1 | 3, b?: 2, c?: 4 }
 */
type MergeUnion<T> = (
  { [K in SharedKeys<T>]: T extends Partial<Record<K, infer V>> ? V : never } &
  { [K in Exclude<T extends any ? keyof T : never, SharedKeys<T>>]?: T extends Partial<Record<K, infer V>> ? V : never }
);

/**
 * Extracts the value type of an optional tuple element at a specific key,
 * preserving explicit undefined values while stripping optionality-induced undefined.
 * @example TupleValue<[1?, undefined?], 0> => 1
 * @example TupleValue<[1?, undefined?], 1> => undefined
 */
type TupleValue<T extends Arr, K extends keyof T> = 
  T extends { readonly [P in K]?: infer V } ? V : T[K];

/**
 * Extracts all value types from a tuple, preserving explicit undefined values
 * while stripping undefined introduced by optional elements.
 * @example TupleValues<[1?, 2?]> => 1 | 2
 * @example TupleValues<[1?, undefined?]> => 1 | undefined
 */
type TupleUnion<T extends Arr> = 
  keyof T & number extends infer K extends keyof T ? TupleValue<T, K> : never;

type IsUnion<T, U extends T = T> = T extends any ? ([U] extends [T] ? false : true) : never;

/**
 * Concatenates two array types, preserving tuple structure where valid.
 *
 * - If B is a union, distributes And over each member.
 *   @example Concat<[1], [2] | [3]> => And<[1], [2] | [3]>
 * - If either side is a generic array, flattens to a generic array.
 *   @example Concat<number[], [1]> => (number | 1)[]
 *   @example Concat<[1], number[]> => (1 | number)[]
 * - If A has optional slots and B has required slots, flattens to a generic array
 *   since required elements cannot follow optional ones in a tuple.
 *   @example Concat<[1?], [2]> => (1 | 2)[]
 * - Otherwise, spreads into a tuple.
 *   @example Concat<[1], [2]> => [1, 2]
 *   @example Concat<[1?], [2?]> => [1?, 2?]
 *   @example Concat<[1?], number[]> => [1?, ...number[]]
 */
type HasOptionalSlot<T extends Arr> = T extends Required<T> ? false : true;
type HasRequiredSlot<T extends Arr> = Partial<T> extends T ? false : true;
type Concat<A extends Arr, B extends Arr> = 
  IsUnion<B> extends true 
    ? A extends Arr ? B extends Arr ? And<A, B> : never : never
    : IsTuple<A> extends true
      ? IsTuple<B> extends true
        ? HasOptionalSlot<A> extends true
          ? HasRequiredSlot<B> extends true
            ? (TupleUnion<A> | TupleUnion<B>)[]
            : [...A, ...B]
          : [...A, ...B]
        : (TupleUnion<A> | TupleUnion<B>)[]
      : (TupleUnion<A> | TupleUnion<B>)[];

type Mutable<A> = { -readonly [K in keyof A]: A[K] };
type NoOverlap<A, B> = keyof A & keyof B extends never ? B : never;
type OmitNever<A> = { [K in keyof A as A[K] extends never ? never : K]: A[K] };
type Expand<A> = A extends infer R ? { [K in keyof R]: R[K] } : never;

type ResolveArr<A extends Arr> = Mutable<{ [K in keyof A]: Resolve<A[K]> }>;
type ResolveObj<A extends Obj> = Expand<OmitNever<Mutable<{ [K in keyof A]: Resolve<A[K]> }>>>;

type GroupMap<A, B> = (
  IsUnion<A> extends true ? {
    resolve: (A extends Combinator<infer U> ? U : A) extends infer Resolved
      ? [Resolved] extends [Arr] ? ResolveArrayUnion<Resolved extends Arr ? ResolveArr<Resolved> : never>
      : [Resolved] extends [Obj] ? Resolved extends Obj ? ResolveObj<Resolved> : never
      : Resolved  /* primitive union — return as-is */
      : never,
    permuted: never,
    subset: never,
    nonEmpty: never,
    and: never,
  } :

  /* Combinator */
  [A] extends [Combinator] ? {
    resolve: A extends Combinator<infer U> ? U : never,
    permuted: never,
    subset: never,
    nonEmpty: never,
    and: never,
  } :

  /* Array */
  [A] extends [Arr] ? {
    resolve: ResolveArr<A>,
    permuted: TupleUnion<A>[],
    subset: { [K in keyof A]?: A[K] },
    nonEmpty: Exclude<A, Arr<never>>,
    and: [B] extends [Arr] ? Concat<A, B> : never,
  } :

  /* Object */
  [A] extends [Obj] ? {
    resolve: ResolveObj<A>,
    permuted: Record<keyof A, Required<A>[keyof A]>,
    subset: { [K in keyof A]?: A[K] },
    nonEmpty: Exclude<A, Obj<never>>,
    // and: [B] extends [Obj] ? [NoOverlap<A, MergeUnion<B>>] extends [never] ? never : Resolve<A & NoOverlap<A, MergeUnion<B>>> : never,
    and: [B] extends [Obj] ? [MergeUnion<B>] extends [never] ? never : Resolve<A & MergeUnion<B>> : never,
  } :

  /* Default */
  {
    resolve: A,
    permuted: never,
    subset: never,
    nonEmpty: never,
    and: never,
  }
);

/* Core types */
export type Combinator<T = unknown> = Iterable<T> & {
  readonly name: string,
  readonly [COMBINATOR]: true,
};
export type Arr<T = unknown> = ReadonlyArray<T>;
export type Obj<T = unknown> = Record<string, T>;

/** 
 * Recursively resolves all Combinators within a type, returning the fully resolved type.
 * @example Resolve<Combinator<'a'>> => 'a'
 * @example Resolve<Combinator<[1, Combinator<2>]>> => [1, 2]
 * @example Resolve<{ a: Combinator<1>, b: Combinator<2> }> => { a: 1, b: 2 }
 */
export type Resolve<T> = GroupMap<T, never>['resolve'];

/**
 * The type of all permutations of an array or object.
 * @example Permuted<[1, 2, 3]> => [1, 2, 3] | [1, 3, 2] | [2, 1, 3] | [2, 3, 1] | [3, 1, 2] | [3, 2, 1]
 * @example Permuted<{ a: 1, b: 2 }> => { a: 1, b: 2 } | { b: 2, a: 1 }
 */
export type Permuted<T> = GroupMap<T, never>['permuted'];

/**
 * Makes all keys of an array or object optional.
 * @example Subset<[1, 2]> => [1?, 2?]
 * @example Subset<{ a: 1, b: 2 }> => { a?: 1, b?: 2 }
 */
export type Subset<T> = GroupMap<T, never>['subset'];

/**
 * Excludes empty arrays or objects from a type.
 * @example NonEmpty<[] | [1] | [1, 2]> => [1] | [1, 2]
 * @example NonEmpty<{} | { a: 1 }> => { a: 1 }
 */
export type NonEmpty<T> = GroupMap<T, never>['nonEmpty'];

/**
 * Merges two arrays or objects together, returning never if incompatible.
 * @example And<[1, 2], [3, 4]> => [1, 2, 3, 4]
 * @example And<{ a: 1 }, { b: 2 }> => { a: 1, b: 2 }
 * @example And<{ a: 1 }, { a: 2 }> => never (overlapping keys)
 * @example And<[1, 2], { a: 1 }> => never (incompatible types)
 */
export type And<A, B> = GroupMap<A, B>['and'];

/**
 * Resolves a union of array types into a single array type.
 *
 * - If all members are tuples of the same length, zips them slot by slot:
 *   each slot's type is the union of all members' slot types.
 *   Slots are optional from the first index that is optional in any member onward.
 *   @example ResolveArrayUnion<[1, 2] | [3, 4]> => [1 | 3, 2 | 4]
 *   @example ResolveArrayUnion<[1, 2] | [3?, 4?]> => [(1 | 3)?, (2 | 4)?]
 *   @example ResolveArrayUnion<[1, 2?] | [3, 4?]> => [1 | 3, (2 | 4)?]
 * - Otherwise, flattens all element types into a generic array.
 *   @example ResolveArrayUnion<[1] | [2, 3]> => (1 | 2 | 3)[]
 *   @example ResolveArrayUnion<[1] | number[]> => (1 | number)[]
 *   @example ResolveArrayUnion<number[] | string[]> => (number | string)[]
 */
type IsTuple<T extends Arr> =
  number extends Required<T>['length'] ? false :
  IsUnion<Required<T>['length']> extends true ? false : true;
 
type SlotType<T extends Arr, K extends keyof T & number> =
  T extends { readonly [P in K]?: infer V } ? V : T[K];
 
type ElementTypes<T extends Arr> =
  T extends Arr
    ? number extends Required<T>['length']
      ? T[number]
      : keyof T & number extends infer K extends keyof T & number ? SlotType<T, K> : never
    : never;
 
type ZipValues<T extends Arr, Acc extends Arr = []> =
  Acc['length'] extends Required<T>['length'] ? Acc
  : ZipValues<T, [...Acc, SlotType<T, Acc['length'] & keyof T & number>]>;
 
/** Index of first optional slot in T, or never if all required.
 * @example FirstOptIdx<[1, 2?, 3?]> => 1
 * @example FirstOptIdx<[1, 2]> => never
 */
type FirstOptIdx<T extends Arr, I extends 0[] = []> =
  I['length'] extends Required<T>['length'] ? never
  : {} extends Pick<T, I['length'] & keyof T> ? I['length']
  : FirstOptIdx<T, [...I, 0]>;
 
/** First N elements of a tuple.
 * @example Head<[1, 2, 3], 2> => [1, 2]
 */
type Head<T extends Arr, N extends number, Acc extends Arr = []> =
  Acc['length'] extends N ? Acc
  : T extends readonly [infer F, ...infer R] ? Head<R, N, [...Acc, F]> : Acc;
 
/** Elements after index N.
 * @example TailAfter<[1, 2, 3], 1> => [3]
 */
type TailAfter<T extends Arr, N extends number, Acc extends 0[] = []> =
  Acc['length'] extends N
    ? T extends readonly [infer _, ...infer R] ? R : []
    : T extends readonly [infer _, ...infer R] ? TailAfter<R, N, [...Acc, 0]> : [];
 
/** Build a fully optional tuple from a required one.
 * @example BuildOptional<[1, 2, 3]> => [1?, 2?, 3?]
 */
type BuildOptional<T extends Arr, Acc extends Arr = []> =
  T extends readonly [infer H, ...infer R]
    ? BuildOptional<R, [...Acc, ...( [H?] )]>
    : Acc;
 
type ZipTuples<T extends Arr> =
  ZipValues<T> extends infer V extends Arr
    ? [FirstOptIdx<T>] extends [never]
      ? V
      : FirstOptIdx<T> extends infer N extends number
        ? [...Head<V, N>, ...BuildOptional<[V[N & keyof V & number], ...TailAfter<V, N>]>]
        : V
    : never;
 
type ResolveArrayUnion<T extends Arr> =
  IsTuple<T> extends true
    ? ZipTuples<T>
    : ElementTypes<T>[];