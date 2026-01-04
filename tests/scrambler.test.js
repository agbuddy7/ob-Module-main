/**
 * Tests for scrambler functionality
 */

import SeededRandom from '../core/prng.js';
import { generateShuffleMap, generateReverseShuffleMap } from '../core/scrambler.js';

describe('SeededRandom', () => {
  test('should generate consistent random numbers with same seed', () => {
    const rng1 = new SeededRandom(42);
    const rng2 = new SeededRandom(42);
    
    for (let i = 0; i < 10; i++) {
      expect(rng1.next()).toBe(rng2.next());
    }
  });

  test('should generate different random numbers with different seeds', () => {
    const rng1 = new SeededRandom(42);
    const rng2 = new SeededRandom(43);
    
    const val1 = rng1.next();
    const val2 = rng2.next();
    
    expect(val1).not.toBe(val2);
  });

  test('nextInt should return integers in specified range', () => {
    const rng = new SeededRandom(42);
    
    for (let i = 0; i < 100; i++) {
      const val = rng.nextInt(0, 10);
      expect(val).toBeGreaterThanOrEqual(0);
      expect(val).toBeLessThan(10);
      expect(Number.isInteger(val)).toBe(true);
    }
  });

  test('reset should restore initial state', () => {
    const rng = new SeededRandom(42);
    
    const firstValues = [];
    for (let i = 0; i < 5; i++) {
      firstValues.push(rng.next());
    }
    
    rng.reset();
    
    for (let i = 0; i < 5; i++) {
      expect(rng.next()).toBe(firstValues[i]);
    }
  });
});

describe('Shuffle Map', () => {
  test('should generate consistent shuffle map for same seed', () => {
    const map1 = generateShuffleMap(42);
    const map2 = generateShuffleMap(42);
    
    expect(map1).toEqual(map2);
  });

  test('should generate different shuffle maps for different seeds', () => {
    const map1 = generateShuffleMap(42);
    const map2 = generateShuffleMap(43);
    
    expect(map1).not.toEqual(map2);
  });

  test('shuffle map should contain all indices 0-63', () => {
    const map = generateShuffleMap(42);
    
    expect(map.length).toBe(64);
    
    const sorted = [...map].sort((a, b) => a - b);
    for (let i = 0; i < 64; i++) {
      expect(sorted[i]).toBe(i);
    }
  });

  test('reverse shuffle map should undo original shuffle', () => {
    const shuffleMap = generateShuffleMap(42);
    const reverseMap = generateReverseShuffleMap(shuffleMap);
    
    // Create test array
    const original = Array.from({ length: 64 }, (_, i) => i);
    
    // Shuffle
    const shuffled = shuffleMap.map(index => original[index]);
    
    // Unshuffle using reverse map
    const unshuffled = reverseMap.map(index => shuffled[index]);
    
    // Should match original
    expect(unshuffled).toEqual(original);
  });
});

describe('Seed Encoding', () => {
  test('should encode column and negative positions correctly', () => {
    // Seed = (C - 1) × 8 + N
    
    // Column 1, Negative 1 -> Seed 1
    expect((1 - 1) * 8 + 1).toBe(1);
    
    // Column 1, Negative 8 -> Seed 8
    expect((1 - 1) * 8 + 8).toBe(8);
    
    // Column 9, Negative 1 -> Seed 65
    expect((9 - 1) * 8 + 1).toBe(65);
    
    // Column 9, Negative 8 -> Seed 72
    expect((9 - 1) * 8 + 8).toBe(72);
  });

  test('all valid combinations should produce unique seeds 1-72', () => {
    const seeds = new Set();
    
    for (let col = 1; col <= 9; col++) {
      for (let neg = 1; neg <= 8; neg++) {
        const seed = (col - 1) * 8 + neg;
        seeds.add(seed);
        
        expect(seed).toBeGreaterThanOrEqual(1);
        expect(seed).toBeLessThanOrEqual(72);
      }
    }
    
    expect(seeds.size).toBe(72);
  });
});
