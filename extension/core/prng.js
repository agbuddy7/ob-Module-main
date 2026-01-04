/**
 * Seeded Pseudo-Random Number Generator using Mulberry32 algorithm
 * Provides deterministic random numbers - same seed always produces same sequence
 */
class SeededRandom {
  constructor(seed) {
    this.seed = seed;
    this.state = seed;
  }

  /**
   * Generate next random number between 0 and 1
   */
  next() {
    this.state = (this.state + 0x6D2B79F5) | 0;
    let t = Math.imul(this.state ^ (this.state >>> 15), 1 | this.state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /**
   * Generate random integer between min (inclusive) and max (exclusive)
   */
  nextInt(min, max) {
    return Math.floor(this.next() * (max - min)) + min;
  }

  /**
   * Reset the PRNG to its initial seed state
   */
  reset() {
    this.state = this.seed;
  }
}
