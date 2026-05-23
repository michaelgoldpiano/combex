// src/symbols.ts
var COMBINATOR = /* @__PURE__ */ Symbol("combinator");

// src/utils/combinator.ts
var generator = function* (...values) {
  for (const v of values) {
    yield v;
  }
};
function combinator(name, fn, original) {
  return {
    name,
    [COMBINATOR]: true,
    *[Symbol.iterator]() {
      yield* fn();
    }
  };
}

// src/utils/dispatcher.ts
var validate = {
  undefined: (v) => v === void 0,
  function: (v) => typeof v === "function",
  combinator: (v) => v !== null && typeof v === "object" && COMBINATOR in v,
  arr: (v) => Array.isArray(v),
  obj: (v) => typeof v === "object" && v !== null && Object.getPrototypeOf(v) === Object.prototype && !(COMBINATOR in v)
};
var dispatcher = (input, fns) => {
  if (fns.undefined && validate.undefined(input)) return fns.undefined(input);
  if (fns.function && validate.function(input)) return fns.function(input);
  if (fns.combinator && validate.combinator(input)) return fns.combinator(input);
  if (fns.arr && validate.arr(input)) return fns.arr(input);
  if (fns.obj && validate.obj(input)) return fns.obj(input);
  if (fns.default) return fns.default(input);
  throw new TypeError(`unexpected input: ${JSON.stringify(input)}`);
};

// src/utils/map.ts
var map = function* (input, fn) {
  for (const t of input) {
    yield* fn(t);
  }
};
var condMap = function* (input, fn) {
  yield* dispatcher(input, {
    combinator: (vs) => map(vs, (v) => fn(v)),
    default: (v) => fn(v)
  });
};

// src/utils/stringify.ts
var stringify = (v) => dispatcher(v, {
  combinator: (c) => {
    let inner = "never";
    for (const first of map(c, (v2) => [stringify(v2)])) {
      inner = first[0];
      break;
    }
    return `Combinator<${inner}>`;
  },
  default: (d) => JSON.stringify(d)
});

// src/errors.ts
var CombexError = class extends Error {
  constructor(message) {
    super(message);
    this.name = "CombexError";
  }
};
var MergeError = class extends CombexError {
  constructor(operation, p1, p2) {
    super(`Cannot merge ${operation}
p1: ${stringify(p1)}
p2: ${JSON.stringify(p2)}`);
    this.name = "MergeError";
  }
};
var TypeError2 = class extends CombexError {
  constructor(expected, got) {
    super(`Expected ${expected}, got: ${stringify(got)}`);
    this.name = "TypeError";
  }
};
var RangeError = class extends CombexError {
  constructor(param, min, max, value) {
    super(`${param} must be between ${min} and ${max}, got ${value}`);
    this.name = "RangeError";
  }
};

// src/algo/product.ts
var productArr = (arr) => {
  const resolve = function* (current) {
    if (current.length === arr.length) {
      yield current;
      return;
    }
    yield* dispatcher(arr[current.length], {
      combinator: (c) => map(c, (v) => resolve([...current, v])),
      arr: (inner) => map(productArr(inner), (v) => resolve([...current, v])),
      obj: (inner) => map(productObj(inner), (v) => resolve([...current, v])),
      default: (v) => resolve([...current, v])
    });
  };
  return resolve([]);
};
var productObj = (obj) => {
  const objKeys = Object.keys(obj);
  const resolve = function* (current) {
    const currKeys = Object.keys(current);
    if (currKeys.length === objKeys.length) {
      yield current;
      return;
    }
    const k = objKeys[currKeys.length];
    yield* dispatcher(obj[k], {
      combinator: (c) => map(c, (v) => resolve({ ...current, [k]: v })),
      arr: (inner) => map(productArr(inner), (v) => resolve({ ...current, [k]: v })),
      obj: (inner) => map(productObj(inner), (v) => resolve({ ...current, [k]: v })),
      default: (v) => resolve({ ...current, [k]: v })
    });
  };
  return resolve({});
};

// src/combinators/and.ts
var and = (param1, param2) => {
  return combinator("and", function* () {
    yield* dispatcher(param2, {
      /* p2 must be a function */
      function: (p2Fn) => condMap(param1, (p1) => dispatcher(p1, {
        /* p1 is array */
        arr: (p12) => map(productArr(p12), (p1Resolved) => condMap(p2Fn(p1Resolved), (p2) => dispatcher(p2, {
          undefined: () => generator(p1Resolved),
          arr: (p22) => map(productArr(p22), (p2Resolved) => generator([...p1Resolved, ...p2Resolved])),
          default: (p22) => {
            throw new MergeError("[...arr, ...obj]", p12, p22);
          }
        }))),
        /* p1 is object */
        obj: (p12) => map(productObj(p12), (p1Resolved) => condMap(p2Fn(p1Resolved), (p2) => dispatcher(p2, {
          undefined: () => generator(p1Resolved),
          obj: (p22) => map(productObj(p22), (p2Resolved) => generator({ ...p1Resolved, ...p2Resolved })),
          default: (p22) => {
            throw new MergeError("{...obj, ...arr}", p12, p22);
          }
        }))),
        default: (p12) => {
          throw new TypeError2("Combinator<Arr | Obj> | Arr | Obj", p12);
        }
      })),
      default: (p2Fn) => {
        throw new TypeError2("Function", p2Fn);
      }
    });
  });
};

// src/combinators/all.ts
var all = (input) => {
  const resolve = function* (input2) {
    yield* dispatcher(input2, {
      arr: (arr) => productArr(arr),
      obj: (obj) => productObj(obj),
      default: (d) => {
        throw new TypeError2("Arr | Obj", d);
      }
    });
  };
  return combinator("all", function* () {
    yield* dispatcher(input, {
      combinator: (vs) => map(vs, (v) => resolve(v)),
      default: (v) => resolve(v)
    });
  });
};

// src/utils/mask.ts
var maskRange = function* (length, min, max) {
  if (length > 31) {
    throw new RangeError("Array length", 0, 31, length);
  }
  const lengthMask = (1 << length) - 1;
  if (min === 0) {
    yield 0;
    min = 1;
  }
  for (let size = min; size <= max; size++) {
    let mask = (1 << size) - 1;
    while (mask !== -1) {
      yield mask;
      const h = 31 - Math.clz32(mask);
      const hBit = 1 << h;
      if (h + 1 < length) {
        mask = mask ^ hBit | hBit << 1;
      } else {
        const notMaskBelow = ~mask & lengthMask & hBit - 1;
        const blockStart = notMaskBelow ? 31 - Math.clz32(notMaskBelow) + 1 : 0;
        const blockSize = h - blockStart + 1;
        const bitsBelow = mask & (1 << blockStart) - 1;
        if (!bitsBelow) {
          mask = -1;
          continue;
        }
        const lowerBit = 31 - Math.clz32(bitsBelow);
        const newPos = lowerBit + 1;
        mask = bitsBelow ^ 1 << lowerBit | 1 << newPos | (1 << blockSize) - 1 << newPos + 1;
      }
    }
  }
};
var maskToArr = (arr, mask) => {
  const result = [];
  let m = mask;
  while (m) {
    const i = Math.clz32(m & -m) ^ 31;
    result.push(arr[i]);
    m &= m - 1;
  }
  return result;
};

// src/algo/powerset.ts
var powersetArr = function* (arr, includeEmpty) {
  for (let mask = includeEmpty ? 0 : 1; mask < 1 << arr.length; mask++) {
    yield maskToArr(arr, mask);
  }
};
var powersetObj = function* (obj, includeEmpty) {
  const entries = Object.entries(obj);
  for (let mask = includeEmpty ? 0 : 1; mask < 1 << entries.length; mask++) {
    yield Object.fromEntries(maskToArr(entries, mask));
  }
};

// src/combinators/any.ts
var any = (input) => {
  const resolve = function* (input2) {
    yield* dispatcher(input2, {
      arr: (arr) => map(powersetArr(arr, true), (powerset) => productArr(powerset)),
      obj: (obj) => map(powersetObj(obj, true), (powerset) => productObj(powerset)),
      default: (d) => {
        throw new TypeError2("Arr | Obj", d);
      }
    });
  };
  return combinator("any", function* () {
    yield* dispatcher(input, {
      combinator: (vs) => map(vs, (v) => resolve(v)),
      default: (v) => resolve(v)
    });
  });
};

// src/combinators/some.ts
var some = (input) => {
  const resolve = function* (input2) {
    yield* dispatcher(input2, {
      arr: (arr) => map(powersetArr(arr, false), (powerset) => productArr(powerset)),
      obj: (obj) => map(powersetObj(obj, false), (powerset) => productObj(powerset)),
      default: (d) => {
        throw new TypeError2("Arr | Obj", d);
      }
    });
  };
  return combinator("some", function* () {
    yield* dispatcher(input, {
      combinator: (vs) => map(vs, (v) => resolve(v)),
      default: (v) => resolve(v)
    });
  });
};

// src/algo/subsetRange.ts
var subsetRangeArr = function* (arr, min, max) {
  for (const mask of maskRange(arr.length, min, max)) {
    yield maskToArr(arr, mask);
  }
};
var subsetRangeObj = function* (obj, min, max) {
  const entries = Object.entries(obj);
  for (const mask of maskRange(entries.length, min, max)) {
    yield Object.fromEntries(maskToArr(entries, mask));
  }
};

// src/combinators/subset.ts
var subset = (input, min, max) => {
  const resolve = function* (input2) {
    yield* dispatcher(input2, {
      arr: (arr) => map(subsetRangeArr(arr, min, max), (subset2) => productArr(subset2)),
      obj: (obj) => map(subsetRangeObj(obj, min, max), (subset2) => productObj(subset2)),
      default: (d) => {
        throw new TypeError2("Arr | Obj", d);
      }
    });
  };
  return combinator("subset", function* () {
    yield* dispatcher(input, {
      combinator: (vs) => map(vs, (v) => resolve(v)),
      default: (v) => resolve(v)
    });
  });
};

// src/combinators/one.ts
var one = (...values) => {
  return combinator("one", function* () {
    for (const v of values) {
      yield* dispatcher(v, {
        combinator: (vs) => vs,
        arr: (v2) => productArr(v2),
        obj: (v2) => productObj(v2),
        default: (d) => generator(d)
      });
    }
  });
};

// src/algo/permutation.ts
var permutationArr = (arr) => {
  const resolve = function* (current, left, right) {
    if (left === arr.length - 1) {
      yield current;
      return;
    }
    yield* resolve(current, left + 1, left + 2);
    if (right < arr.length) {
      const next = [...current];
      [next[left], next[right]] = [next[right], next[left]];
      yield* resolve(next, left, right + 1);
    }
  };
  if (arr.length === 0) {
    return generator([]);
  }
  return resolve([...arr], 0, 1);
};
var permutationObj = (obj) => {
  const entries = Object.entries(obj);
  const resolve = function* (current, left, right) {
    if (left === entries.length - 1) {
      yield Object.fromEntries(current);
      return;
    }
    yield* resolve(current, left + 1, left + 2);
    if (right < entries.length) {
      const next = [...current];
      [next[left], next[right]] = [next[right], next[left]];
      yield* resolve(next, left, right + 1);
    }
  };
  if (entries.length === 0) {
    return generator({});
  }
  return resolve([...entries], 0, 1);
};

// src/combinators/permute.ts
var permute = (input) => {
  return combinator("permute", function* () {
    yield* condMap(input, (v) => dispatcher(v, {
      arr: (arr) => map(permutationArr(arr), (permuted) => productArr(permuted)),
      obj: (obj) => map(permutationObj(obj), (permuted) => productObj(permuted)),
      default: (d) => {
        throw new TypeError2("Arr | Obj", d);
      }
    }));
  });
};

// src/combinators/literal.ts
var literal = (value) => {
  return combinator("literal", function* () {
    yield value;
  });
};
export {
  all,
  and,
  any,
  combinator,
  literal,
  one,
  permute,
  some,
  subset
};
