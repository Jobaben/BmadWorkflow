/**
 * SpatialHash Unit Tests
 *
 * Tests the SpatialHash utility for efficient neighbor queries.
 * This data structure is critical for fluid simulation performance.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { Vector3 } from 'three';
import { SpatialHash } from '../../src/utils/SpatialHash';

// Simple test item with position
interface TestItem {
  id: number;
  position: Vector3;
}

function createItem(id: number, x: number, y: number, z: number): TestItem {
  return { id, position: new Vector3(x, y, z) };
}

describe('SpatialHash', () => {
  let hash: SpatialHash<TestItem>;

  describe('initialization', () => {
    it('should create with specified cell size', () => {
      hash = new SpatialHash<TestItem>(1.0);
      expect(hash.getCellSize()).toBe(1.0);
    });

    it('should start empty', () => {
      hash = new SpatialHash<TestItem>(1.0);
      expect(hash.size()).toBe(0);
    });

    it('should throw error for non-positive cell size', () => {
      expect(() => new SpatialHash<TestItem>(0)).toThrow();
      expect(() => new SpatialHash<TestItem>(-1)).toThrow();
    });
  });

  describe('insert', () => {
    beforeEach(() => {
      hash = new SpatialHash<TestItem>(1.0);
    });

    it('should insert items', () => {
      const item = createItem(1, 0, 0, 0);
      hash.insert(item.position, item);

      expect(hash.size()).toBe(1);
    });

    it('should insert multiple items', () => {
      hash.insert(new Vector3(0, 0, 0), createItem(1, 0, 0, 0));
      hash.insert(new Vector3(1, 0, 0), createItem(2, 1, 0, 0));
      hash.insert(new Vector3(2, 0, 0), createItem(3, 2, 0, 0));

      expect(hash.size()).toBe(3);
    });

    it('should insert items at any position', () => {
      hash.insert(new Vector3(-100, 50, 200), createItem(1, -100, 50, 200));
      hash.insert(new Vector3(100, -50, -200), createItem(2, 100, -50, -200));

      expect(hash.size()).toBe(2);
    });

    it('should handle items at the same position', () => {
      const pos = new Vector3(1, 1, 1);
      hash.insert(pos, createItem(1, 1, 1, 1));
      hash.insert(pos, createItem(2, 1, 1, 1));
      hash.insert(pos, createItem(3, 1, 1, 1));

      expect(hash.size()).toBe(3);
    });
  });

  describe('query', () => {
    beforeEach(() => {
      hash = new SpatialHash<TestItem>(1.0);

      // Create a grid of items
      for (let x = -2; x <= 2; x++) {
        for (let y = -2; y <= 2; y++) {
          for (let z = -2; z <= 2; z++) {
            const id = (x + 2) * 25 + (y + 2) * 5 + (z + 2);
            hash.insert(new Vector3(x, y, z), createItem(id, x, y, z));
          }
        }
      }
    });

    it('should find items within query radius', () => {
      const results = hash.query(new Vector3(0, 0, 0), 1.5);

      // Should find items at distance <= 1.5 from origin
      expect(results.length).toBeGreaterThan(0);

      // All results should have items (may include some beyond exact radius due to cell-based query)
      for (const item of results) {
        expect(item.id).toBeDefined();
      }
    });

    it('should return more items with larger radius', () => {
      const smallRadius = hash.query(new Vector3(0, 0, 0), 0.5);
      const largeRadius = hash.query(new Vector3(0, 0, 0), 2.0);

      expect(largeRadius.length).toBeGreaterThanOrEqual(smallRadius.length);
    });

    it('should return empty array when no items in range', () => {
      const results = hash.query(new Vector3(100, 100, 100), 1.0);

      expect(results.length).toBe(0);
    });

    it('should work at various positions', () => {
      // Query at corner of grid
      const cornerResults = hash.query(new Vector3(2, 2, 2), 1.0);
      expect(cornerResults.length).toBeGreaterThan(0);

      // Query at edge
      const edgeResults = hash.query(new Vector3(0, 0, 2), 1.0);
      expect(edgeResults.length).toBeGreaterThan(0);
    });
  });

  describe('queryWithDistance', () => {
    beforeEach(() => {
      hash = new SpatialHash<TestItem>(1.0);

      // Add items at known positions
      hash.insert(new Vector3(0, 0, 0), createItem(0, 0, 0, 0));
      hash.insert(new Vector3(1, 0, 0), createItem(1, 1, 0, 0));
      hash.insert(new Vector3(2, 0, 0), createItem(2, 2, 0, 0));
      hash.insert(new Vector3(0, 1, 0), createItem(3, 0, 1, 0));
      hash.insert(new Vector3(0, 0, 1), createItem(4, 0, 0, 1));
    });

    it('should return items with distance squared', () => {
      const results = hash.queryWithDistance(
        new Vector3(0, 0, 0),
        1.5,
        item => item.position
      );

      expect(results.length).toBeGreaterThan(0);

      for (const result of results) {
        expect(result.item).toBeDefined();
        expect(typeof result.distanceSq).toBe('number');
        expect(result.distanceSq).toBeGreaterThanOrEqual(0);
      }
    });

    it('should include item at origin with distanceSq of 0', () => {
      const results = hash.queryWithDistance(
        new Vector3(0, 0, 0),
        0.1,
        item => item.position
      );

      expect(results.some(r => r.distanceSq === 0)).toBe(true);
    });

    it('should correctly calculate distance squared', () => {
      const results = hash.queryWithDistance(
        new Vector3(0, 0, 0),
        2.0,
        item => item.position
      );

      // Find item at (1, 0, 0) - distance should be 1
      const itemAt1 = results.find(r => r.item.id === 1);
      expect(itemAt1).toBeDefined();
      expect(itemAt1?.distanceSq).toBeCloseTo(1.0, 5);

      // Find item at (0, 1, 0) - distance should be 1
      const itemAt3 = results.find(r => r.item.id === 3);
      expect(itemAt3).toBeDefined();
      expect(itemAt3?.distanceSq).toBeCloseTo(1.0, 5);
    });

    it('should filter items beyond radius', () => {
      const results = hash.queryWithDistance(
        new Vector3(0, 0, 0),
        0.5,
        item => item.position
      );

      // Only the item at origin should be within 0.5 radius
      expect(results.length).toBe(1);
      expect(results[0].item.id).toBe(0);
    });
  });

  describe('clear', () => {
    beforeEach(() => {
      hash = new SpatialHash<TestItem>(1.0);
    });

    it('should remove all items', () => {
      hash.insert(new Vector3(0, 0, 0), createItem(1, 0, 0, 0));
      hash.insert(new Vector3(1, 0, 0), createItem(2, 1, 0, 0));
      hash.insert(new Vector3(2, 0, 0), createItem(3, 2, 0, 0));

      expect(hash.size()).toBe(3);

      hash.clear();

      expect(hash.size()).toBe(0);
    });

    it('should allow reinserting after clear', () => {
      hash.insert(new Vector3(0, 0, 0), createItem(1, 0, 0, 0));
      hash.clear();

      hash.insert(new Vector3(5, 5, 5), createItem(2, 5, 5, 5));

      expect(hash.size()).toBe(1);

      const results = hash.query(new Vector3(5, 5, 5), 1.0);
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].id).toBe(2);
    });

    it('should return empty results after clear', () => {
      hash.insert(new Vector3(0, 0, 0), createItem(1, 0, 0, 0));
      hash.clear();

      const results = hash.query(new Vector3(0, 0, 0), 10.0);
      expect(results.length).toBe(0);
    });
  });

  describe('cell size behavior', () => {
    it('should place nearby items in same or adjacent cells', () => {
      hash = new SpatialHash<TestItem>(2.0);

      // Items within one cell size should be found efficiently
      hash.insert(new Vector3(0.1, 0.1, 0.1), createItem(1, 0.1, 0.1, 0.1));
      hash.insert(new Vector3(0.2, 0.2, 0.2), createItem(2, 0.2, 0.2, 0.2));

      const results = hash.query(new Vector3(0, 0, 0), 1.0);
      expect(results.length).toBe(2);
    });

    it('should handle different cell sizes', () => {
      const smallCells = new SpatialHash<TestItem>(0.5);
      const largeCells = new SpatialHash<TestItem>(5.0);

      // Same item
      const item = createItem(1, 1, 1, 1);

      smallCells.insert(item.position, item);
      largeCells.insert(item.position, item);

      // Both should find the item
      const smallResults = smallCells.query(new Vector3(1, 1, 1), 1.0);
      const largeResults = largeCells.query(new Vector3(1, 1, 1), 1.0);

      expect(smallResults.length).toBe(1);
      expect(largeResults.length).toBe(1);
    });
  });

  describe('performance characteristics', () => {
    it('should handle large number of items', () => {
      hash = new SpatialHash<TestItem>(1.0);

      // Insert 1000 items
      for (let i = 0; i < 1000; i++) {
        const x = (i % 10) - 5;
        const y = Math.floor(i / 10) % 10 - 5;
        const z = Math.floor(i / 100) % 10 - 5;
        hash.insert(new Vector3(x, y, z), createItem(i, x, y, z));
      }

      expect(hash.size()).toBe(1000);

      // Query should still be fast
      const startTime = performance.now();
      for (let i = 0; i < 100; i++) {
        hash.query(new Vector3(0, 0, 0), 2.0);
      }
      const endTime = performance.now();

      // 100 queries should complete quickly
      expect(endTime - startTime).toBeLessThan(100);
    });

    it('should return subset of items for localized query', () => {
      hash = new SpatialHash<TestItem>(1.0);

      // Create widely distributed items
      for (let i = 0; i < 100; i++) {
        hash.insert(new Vector3(i * 10, 0, 0), createItem(i, i * 10, 0, 0));
      }

      // Query in local area should return far fewer than all items
      const results = hash.query(new Vector3(0, 0, 0), 5.0);

      expect(results.length).toBeLessThan(100);
      expect(results.length).toBeGreaterThan(0);
    });
  });

  describe('edge cases', () => {
    beforeEach(() => {
      hash = new SpatialHash<TestItem>(1.0);
    });

    it('should handle items at negative positions', () => {
      hash.insert(new Vector3(-5, -5, -5), createItem(1, -5, -5, -5));

      const results = hash.query(new Vector3(-5, -5, -5), 1.0);
      expect(results.length).toBe(1);
      expect(results[0].id).toBe(1);
    });

    it('should handle very small positions', () => {
      hash.insert(new Vector3(0.001, 0.001, 0.001), createItem(1, 0.001, 0.001, 0.001));

      const results = hash.query(new Vector3(0, 0, 0), 0.1);
      expect(results.length).toBe(1);
    });

    it('should handle zero radius query', () => {
      hash.insert(new Vector3(0, 0, 0), createItem(1, 0, 0, 0));

      // Zero radius might return the item at exact position
      // or nothing depending on implementation
      const results = hash.query(new Vector3(0, 0, 0), 0);
      // Just ensure it doesn't throw
      expect(Array.isArray(results)).toBe(true);
    });

    it('should handle items at cell boundaries', () => {
      // Items at exact cell boundaries
      hash.insert(new Vector3(1, 0, 0), createItem(1, 1, 0, 0));
      hash.insert(new Vector3(1.001, 0, 0), createItem(2, 1.001, 0, 0));
      hash.insert(new Vector3(0.999, 0, 0), createItem(3, 0.999, 0, 0));

      const results = hash.query(new Vector3(1, 0, 0), 0.1);

      // All three should be found
      expect(results.length).toBe(3);
    });
  });
});
