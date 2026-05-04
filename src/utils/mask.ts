import type { Arr } from '../types';
import { RangeError } from '../errors';

/**
 * Yields all bitmasks for sizes between `min` and `max` (inclusive),
 * in lexicographic order by element index (last element changes fastest).
 * 
 * Based on Gosper's Hack but adapted to yield in lexicographic order
 * rather than ascending numeric order.
 * 
 * @param length - Number of elements (bits). Max 31 due to JS 32-bit bitmask limit.
 * @param min - Minimum number of bits set
 * @param max - Maximum number of bits set
 * @returns Generator yielding each valid bitmask
 * @example maskRange(3, 1, 2) => 001 | 010 | 100 | 011 | 101 | 110
 */
export const maskRange = function*(
  length: number,
  min: number,
  max: number,
): Generator<number> {

  /* JavaScript bitmasks are 32bits max, which is ~2b operations */
  if (length > 31) {
    throw new RangeError('Array length', 0, 31, length);
  }

  /* Precompute mask of all valid bits (e.g., length=5 -> 0b11111) */
  const lengthMask = (1 << length) - 1;

  /* Empty subset */
  if (min === 0) {
    yield 0;
    min = 1;
  }

  for (let size = min; size <= max; size++) {
    
    /* Start with the lowest `size` bits set (e.g. size=3 -> 00111) */
    let mask = (1 << size) - 1;
    while (mask !== -1) {
      yield mask;

      const h = 31 - Math.clz32(mask);  /* Position of highest set bit */
      const hBit = 1 << h;

      /* Common case: Highest bit can move up by one position */
      if (h + 1 < length) {
        mask = (mask ^ hBit) | (hBit << 1);
      }
      
      /* Highest bit is stuck at the top - find the top consecutive block
       * e.g. 10011 has top block {bit4} (size 1), 11001 has top block {bit3,bit4} (size 2)
       * The block gets carried: find the highest bit below the block,
       * move it up by 1, and pack the block just above it. */
      else {

        /* Find where the top consecutive block starts by locating the
         * highest 0-bit below h - the block starts just above it */
        const notMaskBelow = (~mask & lengthMask) & (hBit - 1);
        const blockStart = notMaskBelow ? (31 - Math.clz32(notMaskBelow)) + 1 : 0;
        const blockSize = h - blockStart + 1;

        /* Find the highest set bit below the block to carry upward */
        const bitsBelow = mask & ((1 << blockStart) - 1);
        if (!bitsBelow) {
          mask = -1;
          continue;
        }

        const lowerBit = 31 - Math.clz32(bitsBelow);
        const newPos = lowerBit + 1;

        /* Move lowerBit up by 1, pack the block just above it, keep remaining bits */
        mask = (bitsBelow ^ (1 << lowerBit)) | (1 << newPos) | (((1 << blockSize) - 1) << (newPos + 1));
      }
    }
  }
};

/**
 * Extracts array elements at indices corresponding to set bits in mask.
 * @param arr - Input array
 * @param mask - Bitmask where setting of bit i (from right) means inclusion of arr[i]
 * @returns Array of elements at set bit positions, in index order
 * @example maskToArr([1, 2, 3, 4], 0b1010) => [2, 4]
 */
export const maskToArr = (
  arr: Arr,
  mask: number,
): unknown[] => {
  const result = [];
  let m = mask;
  while (m) {
    const i = Math.clz32(m & -m) ^ 31;  /* Index of lowest set bit */
    result.push(arr[i]);
    m &= m - 1;  /* Clear lowest set bit */
  }
  return result;
};