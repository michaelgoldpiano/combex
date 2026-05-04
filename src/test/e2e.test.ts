import { describe, it } from 'vitest';
import { success, combo } from './testUtils';
import type { Combinator } from '../types';
import { and } from '../combinators/and';
import { all } from '../combinators/all';
import { any } from '../combinators/any';
import { some } from '../combinators/some';
import { one } from '../combinators/one';
import { permute } from '../combinators/permute';
import { literal } from '../combinators/literal';
import { subset } from '../combinators/subset';

describe('e2e', () => {
  it('full API', () => success(() => 
    and(
      {
        method: one('GET', 'POST', 'DELETE'),
        path: one('/users', '/products'),
      },
      (t) => {
        switch (t.method) {
          case 'GET': return { id: one(1), query: some({ limit: one(10, 20), offset: one(0, 10) }) }
          case 'POST': return { id: one(2), body: all({ name: one('Alice', 'Bob'), age: any([25, 30]) }) }
          case 'DELETE': return { id: one(2, 3) }
        }
      }
    ),
    () => combo(
      { method: 'GET', path: '/users', id: 1, query: { limit: 10 } },
      { method: 'GET', path: '/users', id: 1, query: { limit: 20 } },
      { method: 'GET', path: '/users', id: 1, query: { offset: 0 } },
      { method: 'GET', path: '/users', id: 1, query: { offset: 10 } },
      { method: 'GET', path: '/users', id: 1, query: { limit: 10, offset: 0 } },
      { method: 'GET', path: '/users', id: 1, query: { limit: 10, offset: 10 } },
      { method: 'GET', path: '/users', id: 1, query: { limit: 20, offset: 0 } },
      { method: 'GET', path: '/users', id: 1, query: { limit: 20, offset: 10 } },
      { method: 'GET', path: '/products', id: 1, query: { limit: 10 } },
      { method: 'GET', path: '/products', id: 1, query: { limit: 20 } },
      { method: 'GET', path: '/products', id: 1, query: { offset: 0 } },
      { method: 'GET', path: '/products', id: 1, query: { offset: 10 } },
      { method: 'GET', path: '/products', id: 1, query: { limit: 10, offset: 0 } },
      { method: 'GET', path: '/products', id: 1, query: { limit: 10, offset: 10 } },
      { method: 'GET', path: '/products', id: 1, query: { limit: 20, offset: 0 } },
      { method: 'GET', path: '/products', id: 1, query: { limit: 20, offset: 10 } },
      { method: 'POST', path: '/users', id: 2, body: { name: 'Alice', age: [] } },
      { method: 'POST', path: '/users', id: 2, body: { name: 'Alice', age: [25] } },
      { method: 'POST', path: '/users', id: 2, body: { name: 'Alice', age: [30] } },
      { method: 'POST', path: '/users', id: 2, body: { name: 'Alice', age: [25, 30] } },
      { method: 'POST', path: '/users', id: 2, body: { name: 'Bob', age: [] } },
      { method: 'POST', path: '/users', id: 2, body: { name: 'Bob', age: [25] } },
      { method: 'POST', path: '/users', id: 2, body: { name: 'Bob', age: [30] } },
      { method: 'POST', path: '/users', id: 2, body: { name: 'Bob', age: [25, 30] } },
      { method: 'POST', path: '/products', id: 2, body: { name: 'Alice', age: [] } },
      { method: 'POST', path: '/products', id: 2, body: { name: 'Alice', age: [25] } },
      { method: 'POST', path: '/products', id: 2, body: { name: 'Alice', age: [30] } },
      { method: 'POST', path: '/products', id: 2, body: { name: 'Alice', age: [25, 30] } },
      { method: 'POST', path: '/products', id: 2, body: { name: 'Bob', age: [] } },
      { method: 'POST', path: '/products', id: 2, body: { name: 'Bob', age: [25] } },
      { method: 'POST', path: '/products', id: 2, body: { name: 'Bob', age: [30] } },
      { method: 'POST', path: '/products', id: 2, body: { name: 'Bob', age: [25, 30] } },
      { method: 'DELETE', path: '/users', id: 2 },
      { method: 'DELETE', path: '/users', id: 3 },
      { method: 'DELETE', path: '/products', id: 2 },
      { method: 'DELETE', path: '/products', id: 3 },
    ) as Combinator<{
      method: 'GET' | 'POST' | 'DELETE';
      path: '/users' | '/products';
      id: 1 | 2 | 3;
      body?: { name: 'Alice' | 'Bob'; age: [25?, 30?] };
      query?: { limit?: 10 | 20; offset?: 0 | 10 };
    }>
  ));
});