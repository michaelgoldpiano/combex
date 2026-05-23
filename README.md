# combex

A TypeScript library for generating exhaustive combinations of test cases. Instead of manually listing every case, you describe the shape of your data and combex generates every valid combination — with full type inference.

## Installation

```bash
npm install combex
```

## Quick Example

```typescript
import { and, one, some, all, any } from 'combex';

const cases = and(
  {
    input: {
      email: one('', 'invalid', 't@t.t'),
      password: one('', 'short', 'valid!Pass1'),
      age: one(-1, 0, 17, 18, 120, 121),
    },
  },
  (t) => ({
    expected: (() => {
      if (
        t.input.email === '' ||
        t.input.email === 'invalid'
      ) return { valid: false, error: 'Invalid email' };
      if (
        t.input.password === '' ||
        t.input.password === 'short'
      ) return { valid: false, error: 'Invalid password' };
      if (
        t.input.age < 18 ||
        t.input.age > 120
      ) return { valid: false, error: 'Invalid age' };
      return { valid: true };
    })(),
  }),
);

for (const c of cases) {
// c is fully typed:
// const c: {
//   input: {
//     email: "" | "invalid" | "t@t.t";
//     password: "" | "short" | "valid!Pass1";
//     age: 0 | -1 | 17 | 18 | 120 | 121;
//   };
//   expected: {
//     valid: boolean;
//     error: string;
//   } | {
//     valid: boolean;
//     error?: never;
//   };
// }
}
```

This generates all 36 combinations: every method × path pair, with the appropriate id, body, and query fields for each method.

## How It Works

combex works by nesting combinators inside plain arrays and objects. When you iterate a combinator, it yields every combination of its contents. Nesting combinators inside each other composes them — the outer combinator automatically takes the cartesian product of everything inside it.

`and` is the exception: it lets you make the second argument depend on the resolved value of the first, which is how you express branching logic like the `switch` above.

## API

### `one(...values)`

Yields each value one at a time.

```typescript
one(1, 2, 3)  // yields: 1, 2, 3
```

### `any(array | object)`

Yields every subset of the input (the powerset), including the empty set.

```typescript
any([1, 2])
// yields: [], [1], [2], [1, 2]

any({ a: 1, b: 2 })
// yields: {}, { a: 1 }, { b: 2 }, { a: 1, b: 2 }
```

### `some(array | object)`

Like `any`, but excludes the empty set.

```typescript
some([1, 2])
// yields: [1], [2], [1, 2]
```

### `subset(array | object, min, max)`

Yields every subset with a number of elements between `min` and `max` (inclusive).

```typescript
subset([1, 2, 3], 1, 2)
// yields: [1], [2], [3], [1, 2], [1, 3], [2, 3]
```

### `all(array | object)`

Yields the cartesian product of all elements. Useful at the top level when you want every combination of several independent choices.

```typescript
all({ a: one(1, 2), b: one('x', 'y') })
// yields: { a: 1, b: 'x' }, { a: 1, b: 'y' }, { a: 2, b: 'x' }, { a: 2, b: 'y' }
```

### `and(p1, (t) => p2)`

Merges two arrays or objects. The second argument is a function that receives each resolved value of the first and returns what to merge with it. Useful for expressing dependencies between parts of a test case.

```typescript
and([1, 2], (t) => [3, 4])
// yields: [1, 2, 3, 4]

and({ a: one(1, 2) }, (t) => ({ b: t.a * 10 }))
// yields: { a: 1, b: 10 }, { a: 2, b: 20 }
```

### `permute(array | object)`

Yields every possible ordering of the elements.

```typescript
permute([1, 2, 3])
// yields: [1,2,3], [1,3,2], [2,1,3], [2,3,1], [3,1,2], [3,2,1]
```

### `literal(value)`

Escapes any further processing — the value is yielded as-is, without combex trying to expand it.

```typescript
literal([1, 2, 3])
// yields: [1, 2, 3]  (as a single value, not expanded)
```

### `combinator(name, generatorFn)`

Creates a custom combinator. Use this when the built-in combinators don't cover your use case.

```typescript
import { combinator } from 'combex';

const range = (start: number, end: number) =>
  combinator('range', function*() {
    for (let i = start; i <= end; i++) yield i;
  });

range(1, 3)  // yields: 1, 2, 3
```

## Type System

combex infers the strongest possible type for every combinator. The result type of iterating a combinator reflects all possible values it can yield — including conditional branches from `and`, optional fields from `any`/`some`/`subset`, and tuple structure from arrays.

```typescript
const c1 = and([1], (t) => [2, 3]);
// type: Combinator<[1, 2, 3]>

const c2 = any({ limit: one(10, 20), offset: one(0, 10) });
// type: Combinator<{ limit?: 10 | 20, offset?: 0 | 10 }>
```

## Potential TODOs

1. The function `and` turning into dot format `one(...).and(...)` for user clarity.
2. Top level definition encouraged for all combinators, i.e. using `combinator(...)`.  This is in part for clarity of definitions, in part for resolving types more clearly (removing `.and` from the type).
3. Returning type `Optional<...>` instead of labeling with `?` on optional elements.  This is because of the way that TypeScript conflates `optional` with `undefined`, creating unclear types.
4. Encourage users to use the `tsconfig.json` setting `"exactOptionalPropertyTypes": true`, which limits TypeScript from conflating `optional` and `undefined` to some degree.
5. Handle spreading a combinator, e.g. `one([1, ...any([2, 3]))`.
6. Remove `all`, it is the same as `one`.

## Full Test Example

```typescript
/* Actual combex generator for "Register" */
import { and, any, one } from 'combex';

const inputs = and({
  dbSetup: any([insertEmail, insertPhone]),
  url: 'http://localhost:3000/register',
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: and({
    email: one('', 'invalid', 't@t.t'),
    password: one('', 'short', 'validpass'),
    first_name: one('', 'Jane'),
    last_name: one('', 'Doe'),
  }, (_t) => any({
    phone: one(undefined, 1234567890, 1234),
  })),
}, (t) => ({
  expected: (() => {
    if (
      t.body.email === '' ||
      t.body.email === 'invalid' ||
      t.body.password === '' ||
      t.body.password === 'short' ||
      t.body.phone === 1234 ||
      t.body.first_name === '' ||
      t.body.last_name === ''
    ) return verificationError;
    if (t.dbSetup.includes(insertEmail) && t.body.email === 't@t.t') return emailConflictError;
    if (t.dbSetup.includes(insertPhone) && t.body.phone === 1234567890) return phoneConflictError;
    return success;
  })(),
}));
```

```typescript
/* Test code */
import { describe, it, beforeAll, afterEach, expect } from 'vitest';

describe('POST /register', () => {
  afterEach(async () => {
    await db.deleteFrom('phones').execute();
    await db.deleteFrom('emails').execute();
  });
  for (const { dbSetup, url, method, headers, body, expected } of inputs) {
    it(`${JSON.stringify(body)}\n->\n${JSON.stringify(expected)}`, async () => {

      /* Setup test db */
      for (const s of dbSetup) {
        await s!();
      }

      const response = await fetch(url, { method, headers, body: JSON.stringify(body) });
      const result = await response.json();
      expect(result).toEqual(expected);
    });
  }
});
```

```typescript
/* Infrastructure */
import { Kysely, PostgresDialect } from 'kysely';
import { Pool } from 'pg';

interface PhonesTable {
  number: number;
}

interface EmailsTable {
  address: string;
}

interface Database {
  phones: PhonesTable;
  emails: EmailsTable;
}

const db = new Kysely<Database>({
  dialect: new PostgresDialect({
    pool: new Pool({
      connectionString: 'postgres://localhost/testdb',
    }),
  }),
});

/* Test utils */
const insertPhone = async () => {
  await db.insertInto('phones').values({ number: 1234567890 }).execute();
};

const insertEmail = async () => {
  await db.insertInto('emails').values({ address: 't@t.t' }).execute();
};

const verificationError = { status: 400, error: 'Verification failed' } as const;
const emailConflictError = { status: 409, error: 'Email already in use' } as const;
const phoneConflictError = { status: 409, error: 'Phone already in use' } as const;
const success = { status: 201 } as const;

/* Setup test db */
beforeAll(async () => {
  await db.schema.createTable('phones')
    .ifNotExists()
    .addColumn('number', 'integer')
    .execute();
  
  await db.schema.createTable('emails')
    .ifNotExists()
    .addColumn('address', 'varchar')
    .execute();
});
```