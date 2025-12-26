/**
 * ObjectPool Unit Tests
 *
 * Tests the ObjectPool utility for object reuse and performance optimization.
 * Validates all acceptance criteria from story-006.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ObjectPool } from '../../src/utils/ObjectPool';

// Simple test object with resettable state
interface TestObject {
  value: number;
  name: string;
}

const createTestObject = (): TestObject => ({
  value: 0,
  name: '',
});

const resetTestObject = (obj: TestObject): void => {
  obj.value = 0;
  obj.name = '';
};

describe('ObjectPool', () => {
  let pool: ObjectPool<TestObject>;

  describe('initialization', () => {
    it('should create pool with default initial size', () => {
      pool = new ObjectPool(createTestObject);
      const stats = pool.getStats();

      expect(stats.total).toBe(10); // Default initial size
      expect(stats.available).toBe(10);
      expect(stats.active).toBe(0);
    });

    it('should create pool with custom initial size', () => {
      pool = new ObjectPool(createTestObject, 25);
      const stats = pool.getStats();

      expect(stats.total).toBe(25);
      expect(stats.available).toBe(25);
      expect(stats.active).toBe(0);
    });

    it('should accept custom reset function', () => {
      const resetFn = vi.fn(resetTestObject);
      pool = new ObjectPool(createTestObject, 5, resetFn);

      const obj = pool.acquire();
      obj.value = 42;
      obj.name = 'test';
      pool.release(obj);

      expect(resetFn).toHaveBeenCalledWith(obj);
    });

    it('should accept custom batch size', () => {
      pool = new ObjectPool(createTestObject, 5, undefined, 3);

      // Acquire all 5 initial objects
      for (let i = 0; i < 5; i++) {
        pool.acquire();
      }

      // Acquire one more, triggering growth
      pool.acquire();
      const stats = pool.getStats();

      // 5 initial + 3 batch = 8 total
      expect(stats.total).toBe(8);
      expect(stats.active).toBe(6);
    });
  });

  describe('AC1: Pool provides objects without allocation', () => {
    beforeEach(() => {
      pool = new ObjectPool(createTestObject, 10);
    });

    it('should return an object when acquire is called', () => {
      const obj = pool.acquire();

      expect(obj).toBeDefined();
      expect(typeof obj.value).toBe('number');
      expect(typeof obj.name).toBe('string');
    });

    it('should not create new objects when pool has available objects', () => {
      const initialStats = pool.getStats();
      const totalBefore = initialStats.total;

      // Acquire an object
      pool.acquire();

      const afterStats = pool.getStats();
      expect(afterStats.total).toBe(totalBefore);
    });

    it('should decrease available count when acquiring', () => {
      const before = pool.getStats().available;
      pool.acquire();
      const after = pool.getStats().available;

      expect(after).toBe(before - 1);
    });

    it('should increase active count when acquiring', () => {
      const before = pool.getStats().active;
      pool.acquire();
      const after = pool.getStats().active;

      expect(after).toBe(before + 1);
    });
  });

  describe('AC2: Released objects are recycled', () => {
    beforeEach(() => {
      pool = new ObjectPool(createTestObject, 10);
    });

    it('should return object to pool when released', () => {
      const obj = pool.acquire();
      const availableBefore = pool.getStats().available;

      pool.release(obj);

      expect(pool.getStats().available).toBe(availableBefore + 1);
    });

    it('should decrease active count when releasing', () => {
      const obj = pool.acquire();
      const activeBefore = pool.getStats().active;

      pool.release(obj);

      expect(pool.getStats().active).toBe(activeBefore - 1);
    });

    it('should reuse released objects', () => {
      const obj1 = pool.acquire();
      pool.release(obj1);
      const obj2 = pool.acquire();

      // Should be the same reference
      expect(obj2).toBe(obj1);
    });

    it('should not increase total count when reusing released objects', () => {
      const obj = pool.acquire();
      const totalBefore = pool.getStats().total;

      pool.release(obj);
      pool.acquire();

      expect(pool.getStats().total).toBe(totalBefore);
    });
  });

  describe('AC3: Pool grows when exhausted', () => {
    beforeEach(() => {
      pool = new ObjectPool(createTestObject, 3, undefined, 2);
    });

    it('should automatically grow when all objects are in use', () => {
      // Exhaust the pool
      pool.acquire();
      pool.acquire();
      pool.acquire();

      expect(pool.getStats().available).toBe(0);

      // Acquire one more - should trigger growth
      const obj = pool.acquire();

      expect(obj).toBeDefined();
      expect(pool.getStats().total).toBe(5); // 3 initial + 2 batch
    });

    it('should grow by batch size', () => {
      // Exhaust the pool (3 objects)
      for (let i = 0; i < 3; i++) {
        pool.acquire();
      }

      // Acquire one more to trigger growth
      pool.acquire();

      // 3 initial + 2 batch, minus 4 acquired = 1 available
      expect(pool.getStats().available).toBe(1);
    });

    it('should continue to provide objects after multiple growths', () => {
      const objects: TestObject[] = [];

      // Acquire more objects than initial + one batch
      for (let i = 0; i < 10; i++) {
        objects.push(pool.acquire());
      }

      expect(objects.length).toBe(10);
      expect(pool.getStats().active).toBe(10);
      // 3 initial + 2*4 batches = 11 total (grew 4 times: at 4, 6, 8, 10)
      expect(pool.getStats().total).toBeGreaterThanOrEqual(10);
    });
  });

  describe('AC4: Objects are reset on release', () => {
    it('should call reset function when object is released', () => {
      const resetFn = vi.fn();
      pool = new ObjectPool(createTestObject, 5, resetFn);

      const obj = pool.acquire();
      pool.release(obj);

      expect(resetFn).toHaveBeenCalledTimes(1);
      expect(resetFn).toHaveBeenCalledWith(obj);
    });

    it('should reset object state before returning to pool', () => {
      pool = new ObjectPool(createTestObject, 5, resetTestObject);

      const obj1 = pool.acquire();
      obj1.value = 100;
      obj1.name = 'modified';
      pool.release(obj1);

      const obj2 = pool.acquire();
      expect(obj2.value).toBe(0);
      expect(obj2.name).toBe('');
    });

    it('should work without reset function (default no-op)', () => {
      pool = new ObjectPool(createTestObject, 5);

      const obj = pool.acquire();
      obj.value = 42;
      pool.release(obj);

      // Object should be back in pool, value retained (no reset)
      const stats = pool.getStats();
      expect(stats.available).toBe(5);
    });

    it('should call reset for each object in releaseAll', () => {
      const resetFn = vi.fn(resetTestObject);
      pool = new ObjectPool(createTestObject, 5, resetFn);

      pool.acquire();
      pool.acquire();
      pool.acquire();

      pool.releaseAll();

      expect(resetFn).toHaveBeenCalledTimes(3);
    });
  });

  describe('AC5: Pool reports statistics', () => {
    beforeEach(() => {
      pool = new ObjectPool(createTestObject, 10);
    });

    it('should report active count', () => {
      pool.acquire();
      pool.acquire();
      pool.acquire();

      expect(pool.getStats().active).toBe(3);
    });

    it('should report available count', () => {
      pool.acquire();
      pool.acquire();

      expect(pool.getStats().available).toBe(8);
    });

    it('should report total size', () => {
      expect(pool.getStats().total).toBe(10);
    });

    it('should have consistent stats (active + available = total before growth)', () => {
      pool.acquire();
      pool.acquire();
      pool.acquire();

      const stats = pool.getStats();
      expect(stats.active + stats.available).toBe(stats.total);
    });

    it('should update stats correctly through acquire/release cycles', () => {
      const obj1 = pool.acquire();
      const obj2 = pool.acquire();

      let stats = pool.getStats();
      expect(stats.active).toBe(2);
      expect(stats.available).toBe(8);

      pool.release(obj1);

      stats = pool.getStats();
      expect(stats.active).toBe(1);
      expect(stats.available).toBe(9);

      pool.release(obj2);

      stats = pool.getStats();
      expect(stats.active).toBe(0);
      expect(stats.available).toBe(10);
    });
  });

  describe('edge cases', () => {
    beforeEach(() => {
      pool = new ObjectPool(createTestObject, 5, resetTestObject);
    });

    it('should ignore double release of same object', () => {
      const obj = pool.acquire();

      pool.release(obj);
      pool.release(obj); // Second release should be ignored

      const stats = pool.getStats();
      expect(stats.available).toBe(5); // Not 6
      expect(stats.active).toBe(0);
    });

    it('should ignore release of object not from pool', () => {
      const foreignObject: TestObject = { value: 999, name: 'foreign' };

      pool.release(foreignObject);

      const stats = pool.getStats();
      expect(stats.available).toBe(5);
      expect(stats.total).toBe(5);
    });

    it('should handle acquire from empty pool', () => {
      // Acquire all 5
      for (let i = 0; i < 5; i++) {
        pool.acquire();
      }

      // Pool is now empty, but should still provide objects
      const obj = pool.acquire();
      expect(obj).toBeDefined();
    });

    it('should handle very large pool sizes', () => {
      const largePool = new ObjectPool(createTestObject, 1000);
      const stats = largePool.getStats();

      expect(stats.total).toBe(1000);
      expect(stats.available).toBe(1000);

      // Acquire all
      for (let i = 0; i < 1000; i++) {
        largePool.acquire();
      }

      expect(largePool.getStats().active).toBe(1000);
      expect(largePool.getStats().available).toBe(0);
    });
  });

  describe('releaseAll', () => {
    beforeEach(() => {
      pool = new ObjectPool(createTestObject, 10, resetTestObject);
    });

    it('should release all active objects back to pool', () => {
      pool.acquire();
      pool.acquire();
      pool.acquire();

      pool.releaseAll();

      const stats = pool.getStats();
      expect(stats.active).toBe(0);
      expect(stats.available).toBe(10);
    });

    it('should reset all released objects', () => {
      const obj1 = pool.acquire();
      const obj2 = pool.acquire();
      obj1.value = 100;
      obj2.value = 200;

      pool.releaseAll();

      const newObj1 = pool.acquire();
      const newObj2 = pool.acquire();

      expect(newObj1.value).toBe(0);
      expect(newObj2.value).toBe(0);
    });

    it('should be safe to call when no objects are active', () => {
      pool.releaseAll();

      const stats = pool.getStats();
      expect(stats.active).toBe(0);
      expect(stats.available).toBe(10);
    });
  });

  describe('dispose', () => {
    it('should clear all pool state', () => {
      pool = new ObjectPool(createTestObject, 10);
      pool.acquire();
      pool.acquire();

      pool.dispose();

      const stats = pool.getStats();
      expect(stats.active).toBe(0);
      expect(stats.available).toBe(0);
      expect(stats.total).toBe(0);
    });

    it('should handle being called multiple times', () => {
      pool = new ObjectPool(createTestObject, 10);

      pool.dispose();
      pool.dispose();

      const stats = pool.getStats();
      expect(stats.total).toBe(0);
    });
  });

  describe('steady-state usage (no allocations)', () => {
    it('should not allocate during steady-state acquire/release cycles', () => {
      pool = new ObjectPool(createTestObject, 5, resetTestObject);

      // Warm up - acquire and release to establish steady state
      const warmupObj = pool.acquire();
      pool.release(warmupObj);

      const totalBefore = pool.getStats().total;

      // Steady state cycles
      for (let i = 0; i < 100; i++) {
        const obj = pool.acquire();
        obj.value = i;
        pool.release(obj);
      }

      expect(pool.getStats().total).toBe(totalBefore);
    });

    it('should reuse objects in LIFO order', () => {
      pool = new ObjectPool(createTestObject, 5);

      const obj1 = pool.acquire();
      const obj2 = pool.acquire();

      pool.release(obj1);
      pool.release(obj2);

      // Last released should be first acquired (stack behavior)
      const acquired1 = pool.acquire();
      expect(acquired1).toBe(obj2);

      const acquired2 = pool.acquire();
      expect(acquired2).toBe(obj1);
    });
  });
});
