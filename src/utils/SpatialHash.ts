/**
 * SpatialHash - Efficient Spatial Partitioning for Neighbor Queries
 *
 * A spatial hash divides 3D space into a grid of cells. Each particle
 * is placed in the cell that contains its position. When querying for
 * neighbors, we only need to check particles in nearby cells rather
 * than checking all particles.
 *
 * This reduces neighbor lookup complexity from O(n²) to approximately O(n),
 * which is critical for fluid simulations with many particles.
 *
 * ## How Spatial Hashing Works
 *
 * 1. Space is divided into a 3D grid of cells
 * 2. Each cell has a unique key based on its grid coordinates
 * 3. When a particle is inserted, we compute which cell it belongs to
 * 4. When querying neighbors, we check the particle's cell and adjacent cells
 *
 * ## Real SPH Note
 *
 * In production SPH simulations, you might use more sophisticated
 * spatial data structures like:
 * - Uniform grids with compact hashing
 * - k-d trees for non-uniform distributions
 * - GPU-friendly sorting-based approaches
 *
 * This implementation prioritizes clarity over maximum performance.
 */

import type { Vector3 } from 'three';

/**
 * Generic spatial hash for efficient neighbor queries in 3D space.
 *
 * @typeParam T - Type of items stored in the hash (must have a position)
 *
 * @example
 * ```typescript
 * interface Particle { position: Vector3; velocity: Vector3; }
 * const hash = new SpatialHash<Particle>(1.0); // 1 unit cell size
 *
 * // Insert particles
 * particles.forEach(p => hash.insert(p.position, p));
 *
 * // Query neighbors within radius
 * const neighbors = hash.query(particle.position, 2.0);
 * ```
 */
export class SpatialHash<T> {
  /** Size of each cell in world units */
  private readonly cellSize: number;

  /** Inverse of cell size (optimization to avoid division) */
  private readonly invCellSize: number;

  /** Map from cell key to items in that cell */
  private cells: Map<string, T[]>;

  /** Total number of items currently in the hash */
  private itemCount: number;

  /**
   * Creates a new SpatialHash.
   *
   * The cell size should typically be about 2x the query radius
   * for optimal performance. Too small = many cells to check,
   * too large = many particles per cell to check.
   *
   * @param cellSize - The size of each grid cell in world units
   */
  constructor(cellSize: number) {
    if (cellSize <= 0) {
      throw new Error('Cell size must be positive');
    }

    this.cellSize = cellSize;
    this.invCellSize = 1 / cellSize;
    this.cells = new Map();
    this.itemCount = 0;
  }

  /**
   * Inserts an item at a given position.
   *
   * Items can be inserted at any position; the hash computes
   * which cell they belong to automatically.
   *
   * @param position - The 3D position of the item
   * @param item - The item to store
   */
  insert(position: Vector3, item: T): void {
    const key = this.positionToKey(position);

    let cell = this.cells.get(key);
    if (!cell) {
      cell = [];
      this.cells.set(key, cell);
    }

    cell.push(item);
    this.itemCount++;
  }

  /**
   * Queries for all items within a given radius of a position.
   *
   * This is the key operation that makes spatial hashing valuable:
   * instead of checking all N particles, we only check particles
   * in nearby cells.
   *
   * @param position - The center position to query from
   * @param radius - The search radius in world units
   * @returns Array of items within the radius
   */
  query(position: Vector3, radius: number): T[] {
    const results: T[] = [];

    // Compute the range of cells to check
    // We need to check all cells that could contain points within radius
    const cellsToCheck = Math.ceil(radius * this.invCellSize) + 1;

    // Get the base cell coordinates
    const cx = Math.floor(position.x * this.invCellSize);
    const cy = Math.floor(position.y * this.invCellSize);
    const cz = Math.floor(position.z * this.invCellSize);

    // Check all nearby cells
    for (let dx = -cellsToCheck; dx <= cellsToCheck; dx++) {
      for (let dy = -cellsToCheck; dy <= cellsToCheck; dy++) {
        for (let dz = -cellsToCheck; dz <= cellsToCheck; dz++) {
          const key = this.coordsToKey(cx + dx, cy + dy, cz + dz);
          const cell = this.cells.get(key);

          if (cell) {
            // Add all items from this cell to results
            // In a full implementation, you might also check distance here
            // to filter out items that are in the cell but outside radius
            results.push(...cell);
          }
        }
      }
    }

    return results;
  }

  /**
   * Queries for items with distance checking.
   *
   * This variant also returns the squared distance to each item,
   * which is useful for weighting in SPH calculations.
   *
   * @param position - The center position to query from
   * @param radius - The search radius in world units
   * @param getPosition - Function to extract position from an item
   * @returns Array of {item, distanceSq} pairs within the radius
   */
  queryWithDistance(
    position: Vector3,
    radius: number,
    getPosition: (item: T) => Vector3
  ): Array<{ item: T; distanceSq: number }> {
    const results: Array<{ item: T; distanceSq: number }> = [];
    const radiusSq = radius * radius;

    const cellsToCheck = Math.ceil(radius * this.invCellSize) + 1;

    const cx = Math.floor(position.x * this.invCellSize);
    const cy = Math.floor(position.y * this.invCellSize);
    const cz = Math.floor(position.z * this.invCellSize);

    for (let dx = -cellsToCheck; dx <= cellsToCheck; dx++) {
      for (let dy = -cellsToCheck; dy <= cellsToCheck; dy++) {
        for (let dz = -cellsToCheck; dz <= cellsToCheck; dz++) {
          const key = this.coordsToKey(cx + dx, cy + dy, cz + dz);
          const cell = this.cells.get(key);

          if (cell) {
            for (const item of cell) {
              const itemPos = getPosition(item);
              const dx2 = itemPos.x - position.x;
              const dy2 = itemPos.y - position.y;
              const dz2 = itemPos.z - position.z;
              const distanceSq = dx2 * dx2 + dy2 * dy2 + dz2 * dz2;

              if (distanceSq <= radiusSq) {
                results.push({ item, distanceSq });
              }
            }
          }
        }
      }
    }

    return results;
  }

  /**
   * Clears all items from the hash.
   *
   * Call this at the start of each frame before re-inserting
   * particles with their updated positions.
   */
  clear(): void {
    this.cells.clear();
    this.itemCount = 0;
  }

  /**
   * Gets the number of items currently stored.
   *
   * @returns The total item count
   */
  size(): number {
    return this.itemCount;
  }

  /**
   * Gets the cell size used by this hash.
   *
   * @returns The cell size in world units
   */
  getCellSize(): number {
    return this.cellSize;
  }

  /**
   * Converts a 3D position to a cell key string.
   *
   * @param position - The position to convert
   * @returns A unique string key for the cell containing this position
   */
  private positionToKey(position: Vector3): string {
    const x = Math.floor(position.x * this.invCellSize);
    const y = Math.floor(position.y * this.invCellSize);
    const z = Math.floor(position.z * this.invCellSize);
    return `${x},${y},${z}`;
  }

  /**
   * Converts cell coordinates to a key string.
   *
   * @param x - Cell X coordinate
   * @param y - Cell Y coordinate
   * @param z - Cell Z coordinate
   * @returns A unique string key for this cell
   */
  private coordsToKey(x: number, y: number, z: number): string {
    return `${x},${y},${z}`;
  }
}
