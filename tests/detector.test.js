/**
 * Tests for detector functionality
 */

import { hasScrambledAspectRatio } from '../core/detector.js';

describe('Aspect Ratio Detection', () => {
  test('should detect correct 9:8 aspect ratio', () => {
    expect(hasScrambledAspectRatio(900, 800)).toBe(true);
    expect(hasScrambledAspectRatio(1125, 1000)).toBe(true);
    expect(hasScrambledAspectRatio(450, 400)).toBe(true);
  });

  test('should reject incorrect aspect ratios', () => {
    expect(hasScrambledAspectRatio(800, 800)).toBe(false); // 1:1
    expect(hasScrambledAspectRatio(1600, 900)).toBe(false); // 16:9
    expect(hasScrambledAspectRatio(800, 600)).toBe(false); // 4:3
  });

  test('should handle tolerance correctly', () => {
    // 9:8 = 1.125
    // With default tolerance of 0.02
    
    // Just within tolerance
    expect(hasScrambledAspectRatio(1000, 890)).toBe(true); // 1.1236
    
    // Just outside tolerance
    expect(hasScrambledAspectRatio(1000, 850)).toBe(false); // 1.1765
  });

  test('should work with custom tolerance', () => {
    expect(hasScrambledAspectRatio(1000, 850, 0.1)).toBe(true);
    expect(hasScrambledAspectRatio(1000, 850, 0.01)).toBe(false);
  });
});

describe('Seed Decoding', () => {
  test('should decode seed back to column and negative positions', () => {
    // Reverse formula:
    // Given seed S, find C and N where S = (C - 1) × 8 + N
    // C = floor((S - 1) / 8) + 1
    // N = ((S - 1) % 8) + 1
    
    function decodeSeed(seed) {
      const columnPosition = Math.floor((seed - 1) / 8) + 1;
      const negativePosition = ((seed - 1) % 8) + 1;
      return { columnPosition, negativePosition };
    }
    
    expect(decodeSeed(1)).toEqual({ columnPosition: 1, negativePosition: 1 });
    expect(decodeSeed(8)).toEqual({ columnPosition: 1, negativePosition: 8 });
    expect(decodeSeed(9)).toEqual({ columnPosition: 2, negativePosition: 1 });
    expect(decodeSeed(65)).toEqual({ columnPosition: 9, negativePosition: 1 });
    expect(decodeSeed(72)).toEqual({ columnPosition: 9, negativePosition: 8 });
  });

  test('encoding and decoding should be reversible', () => {
    function encodeSeed(col, neg) {
      return (col - 1) * 8 + neg;
    }
    
    function decodeSeed(seed) {
      const columnPosition = Math.floor((seed - 1) / 8) + 1;
      const negativePosition = ((seed - 1) % 8) + 1;
      return { columnPosition, negativePosition };
    }
    
    for (let col = 1; col <= 9; col++) {
      for (let neg = 1; neg <= 8; neg++) {
        const seed = encodeSeed(col, neg);
        const decoded = decodeSeed(seed);
        
        expect(decoded.columnPosition).toBe(col);
        expect(decoded.negativePosition).toBe(neg);
      }
    }
  });
});
