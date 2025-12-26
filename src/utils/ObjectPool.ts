/**
 * ObjectPool - Generic Object Pool for Performance Optimization
 *
 * Reuses objects to avoid garbage collection pauses in high-frequency
 * allocation scenarios like particle systems and fluid simulations.
 *
 * This is a critical optimization pattern for game/graphics development.
 * By pre-allocating objects and recycling them, we eliminate GC pauses
 * that would cause visible stuttering during animation.
 */

import type { PoolStats } from '../types';

/** Default number of objects to create when the pool is initialized */
const DEFAULT_INITIAL_SIZE = 10;

/** Default number of objects to create when the pool needs to grow */
const DEFAULT_BATCH_SIZE = 10;

/**
 * A generic object pool that provides object reuse to avoid
 * garbage collection during high-frequency operations.
 *
 * @typeParam T - The type of objects managed by this pool
 *
 * @example
 * ```typescript
 * // Create a pool for particles
 * const particlePool = new ObjectPool(
 *   () => ({ x: 0, y: 0, velocity: 0 }), // factory
 *   100,                                  // initial size
 *   (p) => { p.x = 0; p.y = 0; p.velocity = 0; } // reset
 * );
 *
 * // Acquire a particle (no allocation in steady state)
 * const particle = particlePool.acquire();
 *
 * // Use the particle...
 * particle.x = 10;
 *
 * // Release when done (returns to pool for reuse)
 * particlePool.release(particle);
 * ```
 */
export class ObjectPool<T> {
  /** Factory function for creating new objects */
  private readonly factory: () => T;

  /** Optional function to reset object state on release */
  private readonly reset: (obj: T) => void;

  /** Stack of available objects (using array as stack for O(1) operations) */
  private available: T[] = [];

  /** Set of objects currently in use (for tracking and validation) */
  private activeSet: Set<T> = new Set();

  /** Total number of objects created by this pool */
  private totalCreated: number = 0;

  /** Number of objects to create when pool needs to grow */
  private batchSize: number;

  /**
   * Creates a new ObjectPool.
   *
   * @param factory - Function that creates new instances of T
   * @param initialSize - Number of objects to pre-allocate (default: 10)
   * @param reset - Optional function to reset object state on release
   * @param batchSize - Number of objects to create when pool grows (default: 10)
   */
  constructor(
    factory: () => T,
    initialSize: number = DEFAULT_INITIAL_SIZE,
    reset?: (obj: T) => void,
    batchSize: number = DEFAULT_BATCH_SIZE
  ) {
    this.factory = factory;
    this.reset = reset ?? (() => {});
    this.batchSize = batchSize;

    // Pre-allocate initial objects
    this.grow(initialSize);
  }

  /**
   * Acquires an object from the pool.
   *
   * If the pool is empty, it automatically grows to provide more objects.
   * The returned object is tracked as active until released.
   *
   * @returns An object from the pool ready for use
   */
  acquire(): T {
    // If pool is empty, grow it
    if (this.available.length === 0) {
      this.grow(this.batchSize);
    }

    // Pop from available stack (O(1) operation)
    const obj = this.available.pop()!;

    // Track as active
    this.activeSet.add(obj);

    return obj;
  }

  /**
   * Releases an object back to the pool for reuse.
   *
   * The reset function (if provided) is called to clean the object's state.
   * Releasing an object that wasn't from this pool is safely ignored.
   *
   * @param obj - The object to release back to the pool
   */
  release(obj: T): void {
    // Ignore if this object isn't tracked as active
    // This handles double-release and objects not from this pool
    if (!this.activeSet.has(obj)) {
      return;
    }

    // Remove from active tracking
    this.activeSet.delete(obj);

    // Reset the object's state
    this.reset(obj);

    // Return to available stack
    this.available.push(obj);
  }

  /**
   * Releases all active objects back to the pool.
   *
   * Useful for resetting a demo or clearing all particles at once.
   * Each object is reset before being returned to the pool.
   */
  releaseAll(): void {
    // Convert to array to avoid modifying set during iteration
    const activeObjects = Array.from(this.activeSet);

    for (const obj of activeObjects) {
      this.release(obj);
    }
  }

  /**
   * Gets statistics about the current pool state.
   *
   * @returns Object with active, available, and total counts
   */
  getStats(): PoolStats {
    return {
      active: this.activeSet.size,
      available: this.available.length,
      total: this.totalCreated,
    };
  }

  /**
   * Disposes of the pool, clearing all references.
   *
   * After disposal, the pool should not be used.
   */
  dispose(): void {
    this.available = [];
    this.activeSet.clear();
    this.totalCreated = 0;
  }

  /**
   * Grows the pool by creating new objects.
   *
   * @param count - Number of objects to create
   */
  private grow(count: number): void {
    for (let i = 0; i < count; i++) {
      const obj = this.factory();
      this.available.push(obj);
      this.totalCreated++;
    }
  }
}
