/**
 * FPSMonitor - Frame Rate Tracking
 *
 * Tracks frame rate performance by calculating instantaneous
 * and rolling average FPS values.
 */

/** Number of frames to use for rolling average calculation */
const SAMPLE_SIZE = 60;

/**
 * FPSMonitor tracks frame rate for performance validation.
 *
 * Features:
 * - Instantaneous FPS calculation
 * - Rolling average FPS over the last 60 frames
 * - Efficient circular buffer implementation
 *
 * @example
 * ```typescript
 * const fpsMonitor = new FPSMonitor();
 *
 * loop.onFrame((deltaTime) => {
 *   fpsMonitor.frame(deltaTime);
 *   console.log(`FPS: ${fpsMonitor.currentFPS.toFixed(1)}`);
 * });
 * ```
 */
export class FPSMonitor {
  private deltaTimes: number[] = [];
  private index: number = 0;
  private filled: boolean = false;
  private instantaneousFPS: number = 0;
  private rollingAverageFPS: number = 0;

  /**
   * Creates a new FPSMonitor.
   */
  constructor() {
    // Pre-allocate array for circular buffer
    this.deltaTimes = new Array(SAMPLE_SIZE).fill(0);
  }

  /**
   * Records a frame with the given delta time.
   * Should be called once per frame.
   *
   * @param deltaTime - Time elapsed since last frame in seconds
   */
  frame(deltaTime: number): void {
    // Calculate instantaneous FPS (avoid division by zero)
    this.instantaneousFPS = deltaTime > 0 ? 1 / deltaTime : 0;

    // Store delta time in circular buffer
    this.deltaTimes[this.index] = deltaTime;
    this.index = (this.index + 1) % SAMPLE_SIZE;

    // Mark as filled once we've gone through the buffer once
    if (this.index === 0) {
      this.filled = true;
    }

    // Calculate rolling average
    this.calculateAverage();
  }

  /**
   * Gets the current instantaneous FPS.
   * This is 1/deltaTime for the most recent frame.
   */
  get currentFPS(): number {
    return this.instantaneousFPS;
  }

  /**
   * Gets the rolling average FPS over the last 60 frames.
   * Returns 0 until at least one frame has been recorded.
   */
  get averageFPS(): number {
    return this.rollingAverageFPS;
  }

  /**
   * Resets the FPS monitor, clearing all recorded data.
   */
  reset(): void {
    this.deltaTimes.fill(0);
    this.index = 0;
    this.filled = false;
    this.instantaneousFPS = 0;
    this.rollingAverageFPS = 0;
  }

  /**
   * Calculates the rolling average FPS from the circular buffer.
   */
  private calculateAverage(): void {
    // Determine how many samples we have
    const sampleCount = this.filled ? SAMPLE_SIZE : this.index;

    if (sampleCount === 0) {
      this.rollingAverageFPS = 0;
      return;
    }

    // Sum all delta times
    let totalDelta = 0;
    for (let i = 0; i < sampleCount; i++) {
      totalDelta += this.deltaTimes[i];
    }

    // Calculate average FPS (avoid division by zero)
    if (totalDelta > 0) {
      this.rollingAverageFPS = sampleCount / totalDelta;
    } else {
      this.rollingAverageFPS = 0;
    }
  }
}
