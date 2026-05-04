import { dispatcher } from './dispatcher';
import { map } from './map';

export const stringify = (v: unknown): string => dispatcher(v, {
  combinator: (c) => {
    let inner = 'never';
    for (const first of map(c, (v) => [stringify(v)])) {
      inner = first[0]!;
      break;
    }
    return `Combinator<${inner}>`;
  },
  default: (d) => JSON.stringify(d),
});