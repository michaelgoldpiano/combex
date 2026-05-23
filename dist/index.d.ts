declare const COMBINATOR: unique symbol;

/**
 * Extracts keys that are present in every member of a union type.
 * @example SharedKeys<{ a: 1, b: 2 } | { a: 3, c: 4 }> => 'a'
 */
type SharedKeys<T> = ({
    [K in T extends any ? keyof T : never]: T extends Record<K, any> ? true : false;
} extends infer R ? {
    [K in keyof R]: R[K] extends true ? K : never;
}[keyof R] : never);
/**
 * Merges a union of objects into a single object type.
 * Keys present in all members are required; keys present in some members are optional.
 * Values of shared keys are unioned across all members.
 * @example MergeUnion<{ a: 1, b: 2 } | { a: 3, c: 4 }> => { a: 1 | 3, b?: 2, c?: 4 }
 */
type MergeUnion<T> = ({
    [K in SharedKeys<T>]: T extends Partial<Record<K, infer V>> ? V : never;
} & {
    [K in Exclude<T extends any ? keyof T : never, SharedKeys<T>>]?: T extends Partial<Record<K, infer V>> ? V : never;
});
/**
 * Extracts the value type of an optional tuple element at a specific key,
 * preserving explicit undefined values while stripping optionality-induced undefined.
 * @example TupleValue<[1?, undefined?], 0> => 1
 * @example TupleValue<[1?, undefined?], 1> => undefined
 */
type TupleValue<T extends Arr, K extends keyof T> = T extends {
    readonly [P in K]?: infer V;
} ? V : T[K];
/**
 * Extracts all value types from a tuple, preserving explicit undefined values
 * while stripping undefined introduced by optional elements.
 * @example TupleValues<[1?, 2?]> => 1 | 2
 * @example TupleValues<[1?, undefined?]> => 1 | undefined
 */
type TupleUnion<T extends Arr> = keyof T & number extends infer K extends keyof T ? TupleValue<T, K> : never;
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
type Concat<A extends Arr, B extends Arr> = IsUnion<B> extends true ? A extends Arr ? B extends Arr ? And<A, B> : never : never : IsTuple<A> extends true ? IsTuple<B> extends true ? HasOptionalSlot<A> extends true ? HasRequiredSlot<B> extends true ? (TupleUnion<A> | TupleUnion<B>)[] : [...A, ...B] : [...A, ...B] : (TupleUnion<A> | TupleUnion<B>)[] : (TupleUnion<A> | TupleUnion<B>)[];
type Mutable<A> = {
    -readonly [K in keyof A]: A[K];
};
type OmitNever<A> = {
    [K in keyof A as A[K] extends never ? never : K]: A[K];
};
type Expand<A> = A extends infer R ? {
    [K in keyof R]: R[K];
} : never;
type ResolveArr<A extends Arr> = Mutable<{
    [K in keyof A]: Resolve<A[K]>;
}>;
type ResolveObj<A extends Obj> = Expand<OmitNever<Mutable<{
    [K in keyof A]: Resolve<A[K]>;
}>>>;
type GroupMap<A, B> = (IsUnion<A> extends true ? {
    resolve: (A extends Combinator<infer U> ? U : A) extends infer Resolved ? [Resolved] extends [Arr] ? ResolveArrayUnion<Resolved extends Arr ? ResolveArr<Resolved> : never> : [Resolved] extends [Obj] ? Resolved extends Obj ? ResolveObj<Resolved> : never : Resolved : never;
    permuted: never;
    subset: never;
    nonEmpty: never;
    and: never;
} : [
    A
] extends [Combinator] ? {
    resolve: A extends Combinator<infer U> ? U : never;
    permuted: never;
    subset: never;
    nonEmpty: never;
    and: never;
} : [
    A
] extends [Arr] ? {
    resolve: ResolveArr<A>;
    permuted: TupleUnion<A>[];
    subset: {
        [K in keyof A]?: A[K];
    };
    nonEmpty: Exclude<A, Arr<never>>;
    and: [B] extends [Arr] ? Concat<A, B> : never;
} : [
    A
] extends [Obj] ? {
    resolve: ResolveObj<A>;
    permuted: Record<keyof A, Required<A>[keyof A]>;
    subset: {
        [K in keyof A]?: A[K];
    };
    nonEmpty: Exclude<A, Obj<never>>;
    and: [B] extends [Obj] ? [MergeUnion<B>] extends [never] ? never : Resolve<A & MergeUnion<B>> : never;
} : {
    resolve: A;
    permuted: never;
    subset: never;
    nonEmpty: never;
    and: never;
});
type Combinator<T = unknown> = Iterable<T> & {
    readonly name: string;
    readonly [COMBINATOR]: true;
};
type Arr<T = unknown> = ReadonlyArray<T>;
type Obj<T = unknown> = Record<string, T>;
/**
 * Recursively resolves all Combinators within a type, returning the fully resolved type.
 * @example Resolve<Combinator<'a'>> => 'a'
 * @example Resolve<Combinator<[1, Combinator<2>]>> => [1, 2]
 * @example Resolve<{ a: Combinator<1>, b: Combinator<2> }> => { a: 1, b: 2 }
 */
type Resolve<T> = GroupMap<T, never>['resolve'];
/**
 * The type of all permutations of an array or object.
 * @example Permuted<[1, 2, 3]> => [1, 2, 3] | [1, 3, 2] | [2, 1, 3] | [2, 3, 1] | [3, 1, 2] | [3, 2, 1]
 * @example Permuted<{ a: 1, b: 2 }> => { a: 1, b: 2 } | { b: 2, a: 1 }
 */
type Permuted<T> = GroupMap<T, never>['permuted'];
/**
 * Makes all keys of an array or object optional.
 * @example Subset<[1, 2]> => [1?, 2?]
 * @example Subset<{ a: 1, b: 2 }> => { a?: 1, b?: 2 }
 */
type Subset<T> = GroupMap<T, never>['subset'];
/**
 * Excludes empty arrays or objects from a type.
 * @example NonEmpty<[] | [1] | [1, 2]> => [1] | [1, 2]
 * @example NonEmpty<{} | { a: 1 }> => { a: 1 }
 */
type NonEmpty<T> = GroupMap<T, never>['nonEmpty'];
/**
 * Merges two arrays or objects together, returning never if incompatible.
 * @example And<[1, 2], [3, 4]> => [1, 2, 3, 4]
 * @example And<{ a: 1 }, { b: 2 }> => { a: 1, b: 2 }
 * @example And<{ a: 1 }, { a: 2 }> => never (overlapping keys)
 * @example And<[1, 2], { a: 1 }> => never (incompatible types)
 */
type And<A, B> = GroupMap<A, B>['and'];
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
type IsTuple<T extends Arr> = number extends Required<T>['length'] ? false : IsUnion<Required<T>['length']> extends true ? false : true;
type SlotType<T extends Arr, K extends keyof T & number> = T extends {
    readonly [P in K]?: infer V;
} ? V : T[K];
type ElementTypes<T extends Arr> = T extends Arr ? number extends Required<T>['length'] ? T[number] : keyof T & number extends infer K extends keyof T & number ? SlotType<T, K> : never : never;
type ZipValues<T extends Arr, Acc extends Arr = []> = Acc['length'] extends Required<T>['length'] ? Acc : ZipValues<T, [...Acc, SlotType<T, Acc['length'] & keyof T & number>]>;
/** Index of first optional slot in T, or never if all required.
 * @example FirstOptIdx<[1, 2?, 3?]> => 1
 * @example FirstOptIdx<[1, 2]> => never
 */
type FirstOptIdx<T extends Arr, I extends 0[] = []> = I['length'] extends Required<T>['length'] ? never : {} extends Pick<T, I['length'] & keyof T> ? I['length'] : FirstOptIdx<T, [...I, 0]>;
/** First N elements of a tuple.
 * @example Head<[1, 2, 3], 2> => [1, 2]
 */
type Head<T extends Arr, N extends number, Acc extends Arr = []> = Acc['length'] extends N ? Acc : T extends readonly [infer F, ...infer R] ? Head<R, N, [...Acc, F]> : Acc;
/** Elements after index N.
 * @example TailAfter<[1, 2, 3], 1> => [3]
 */
type TailAfter<T extends Arr, N extends number, Acc extends 0[] = []> = Acc['length'] extends N ? T extends readonly [infer _, ...infer R] ? R : [] : T extends readonly [infer _, ...infer R] ? TailAfter<R, N, [...Acc, 0]> : [];
/** Build a fully optional tuple from a required one.
 * @example BuildOptional<[1, 2, 3]> => [1?, 2?, 3?]
 */
type BuildOptional<T extends Arr, Acc extends Arr = []> = T extends readonly [infer H, ...infer R] ? BuildOptional<R, [...Acc, ...([H?])]> : Acc;
type ZipTuples<T extends Arr> = ZipValues<T> extends infer V extends Arr ? [FirstOptIdx<T>] extends [never] ? V : FirstOptIdx<T> extends infer N extends number ? [...Head<V, N>, ...BuildOptional<[V[N & keyof V & number], ...TailAfter<V, N>]>] : V : never;
type ResolveArrayUnion<T extends Arr> = IsTuple<T> extends true ? ZipTuples<T> : ElementTypes<T>[];

declare function combinator<const T>(name: string, fn: () => Generator<T>, original?: unknown): Combinator<T>;

/**
 * Merges two arrays or objects together, yielding all resolved combinations.
 * The second parameter is a function that receives each resolved value of the first
 * and returns the value to merge with it.
 * @param param1 - The base array or object (or combinator thereof)
 * @param param2 - Function receiving each resolved p1 value, returning the value to merge
 * @returns Combinator yielding each merged and resolved combination
 * @example and([1, 2], (t) => [3, 4]) => [1, 2, 3, 4]
 * @example and({ a: 1 }, (t) => ({ b: 2 })) => { a: 1, b: 2 }
 * @example and([one(1, 2)], (t) => [one(3, 4)]) => [1, 3] | [1, 4] | [2, 3] | [2, 4]
 */
declare const and: <const P1 extends Combinator<Arr | Obj> | Arr | Obj, const R2 extends Combinator<Arr | Obj> | Arr | Obj, const R = And<Resolve<P1>, Resolve<R2>>>(param1: P1, param2: (f1: Resolve<P1>) => R2) => Combinator<R>;

/**
 * Resolves all elements of an array or object, yielding the cartesian product.
 * Equivalent resolution to an array or object within a combinator,
 * but itself as a combinator, for clarity and for top-level resolution.
 * @param input - The array or object to resolve
 * @returns Combinator yielding each fully resolved combination
 * @example all([one(1, 2), one(3, 4)]) => [1, 3] | [1, 4] | [2, 3] | [2, 4]
 * @example all({ a: one(1, 2), b: one(3, 4) }) => { a: 1, b: 3 } | { a: 1, b: 4 } | { a: 2, b: 3 } | { a: 2, b: 4 }
 */
declare const all: <const T extends Combinator<Arr | Obj> | Arr | Obj, const R extends Resolve<T>>(input: T) => Combinator<R>;

/**
 * Yields all subsets (powerset) of an array or object, resolving any combinators inside.
 * Equivalent to subset(input, 0, input.length).
 * @param input - The array or object to compute subsets of
 * @returns Combinator yielding each resolved subset
 * @example any([1, 2]) => [] | [1] | [2] | [1, 2]
 * @example any({ a: 1, b: 2 }) => {} | { a: 1 } | { b: 2 } | { a: 1, b: 2 }
 */
declare const any: <const T extends Combinator<Arr | Obj> | Arr | Obj, const R extends Subset<Resolve<T>>>(input: T) => Combinator<R>;

/**
 * Yields all non-empty subsets of an array or object, resolving any combinators inside.
 * Equivalent to subset(input, 1, input.length).
 * @param input - The array or object to compute subsets of
 * @returns Combinator yielding each non-empty resolved subset
 * @example some([1, 2]) => [1] | [2] | [1, 2]
 * @example some({ a: 1, b: 2 }) => { a: 1 } | { b: 2 } | { a: 1, b: 2 }
 */
declare const some: <const T extends Combinator<Arr | Obj> | Arr | Obj, const R extends NonEmpty<Subset<Resolve<T>>>>(input: T) => Combinator<R>;

/**
 * Yields all subsets of an array or object with between `min` and `max` elements (inclusive).
 * @param input - The array or object to compute subsets of
 * @param min - Minimum subset size
 * @param max - Maximum subset size
 * @returns Combinator yielding each resolved subset
 * @example subset([1, 2, 3], 1, 2) => [1] | [2] | [3] | [1, 2] | [1, 3] | [2, 3]
 * @example subset({ a: 1, b: 2 }, 0, 1) => {} | { a: 1 } | { b: 2 }
 */
declare const subset: <const T extends Combinator<Arr | Obj> | Arr | Obj, const R extends Subset<Resolve<T>>>(input: T, min: number, max: number) => Combinator<R>;

/**
 * Yields each value one at a time, resolving combinators, arrays, and objects.
 * @param values - The values to yield
 * @returns Combinator yielding each resolved value
 * @example one(1, 2, 3) => 1 | 2 | 3
 * @example one([1, 2], [3, 4]) => [1, 2] | [3, 4]
 * @example one(combo(1, 2), 3) => 1 | 2 | 3
 */
declare const one: <const T extends unknown[], const R extends Resolve<T[number]>>(...values: T) => Combinator<R>;

/**
 * Yields all permutations of an array or object. End changes fastest.
 * @param input - The array or object to permute
 * @returns Combinator yielding each permutation
 * @example permute([1, 2, 3]) => [1,2,3] | [1,3,2] | [2,1,3] | [2,3,1] | [3,1,2] | [3,2,1]
 * @example permute({ a: 1, b: 2 }) => { a: 1, b: 2 } | { b: 2, a: 1 }
 */
declare const permute: <const T extends Combinator<Arr | Obj> | Arr | Obj, const R extends Permuted<Resolve<T>>>(input: T) => Combinator<R>;

/**
 * Yields a single value as-is, without resolving combinators inside.
 * Use when you want to treat a combinator (or anything else) as a literal value.
 * @param value - The value to yield
 * @returns Combinator yielding the value once
 * @example literal([1, 2]) => [1, 2]  (the array itself, not its elements)
 * @example literal(combo(1, 2)) => Combinator<1|2>  (the combinator itself as a value)
 */
declare const literal: <const T>(value: T) => Combinator<T>;

export { type Combinator, all, and, any, combinator, literal, one, permute, some, subset };
