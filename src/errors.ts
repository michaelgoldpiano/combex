import { stringify } from './utils/stringify';

export class CombexError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CombexError';
  }
}

export class MergeError extends CombexError {
  constructor(operation: string, p1: unknown, p2: unknown) {
    super(`Cannot merge ${operation}\np1: ${stringify(p1)}\np2: ${JSON.stringify(p2)}`);
    this.name = 'MergeError';
  }
}

export class TypeError extends CombexError {
  constructor(expected: string, got: unknown) {
    super(`Expected ${expected}, got: ${stringify(got)}`);
    this.name = 'TypeError';
  }
}

export class RangeError extends CombexError {
  constructor(param: string, min: number, max: number, value: number) {
    super(`${param} must be between ${min} and ${max}, got ${value}`);
    this.name = 'RangeError';
  }
}