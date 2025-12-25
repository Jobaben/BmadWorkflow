/**
 * AnimationLoop - RequestAnimationFrame Wrapper
 *
 * Manages the render/update cycle using requestAnimationFrame.
 * Provides consistent delta time calculation with frame capping
 * to prevent physics issues when returning from inactive tabs.
 */

/** Maximum delta time (seconds) to prevent physics explosion after tab switch */
const MAX_DELTA_TIME = 0.1;

/** Frame callback type - receives delta time in seconds */
export type FrameCallback = (deltaTime: number) => void;

/**
 * AnimationLoop manages the game/render loop using requestAnimationFrame.
 *
 * Features:
 * - Consistent timing using performance.now()
 * - Delta time in seconds for easy physics calculations
 * - Delta time capping to prevent spiral of death on tab switching
 * - Multiple callback support
 * - Clean start/stop control
 *
 * @example
 * ```typescript
 * const loop = new AnimationLoop();
 * loop.onFrame((dt) => {
 *   object.rotation.y += speed * dt;
 *   renderer.render(scene);
 * });
 * loop.start();
 * ```
 */
export class AnimationLoop {
  private callbacks: FrameCallback[] = [];
  private running: boolean = false;
  private lastTime: number = 0;
  private frameId: number = 0;

  /**
   * Registers a callback to be called each frame.
   * Multiple callbacks can be registered and will be called in order.
   *
   * @param callback - Function to call each frame with delta time in seconds
   */
  onFrame(callback: FrameCallback): void {
    this.callbacks.push(callback);
  }

  /**
   * Removes a previously registered frame callback.
   *
   * @param callback - The callback function to remove
   * @returns true if the callback was found and removed, false otherwise
   */
  offFrame(callback: FrameCallback): boolean {
    const index = this.callbacks.indexOf(callback);
    if (index !== -1) {
      this.callbacks.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * Starts the animation loop.
   * If already running, this has no effect.
   */
  start(): void {
    if (this.running) {
      return;
    }

    this.running = true;
    this.lastTime = performance.now();
    this.frameId = requestAnimationFrame(this.tick);
  }

  /**
   * Stops the animation loop.
   * If not running, this has no effect.
   */
  stop(): void {
    if (!this.running) {
      return;
    }

    this.running = false;
    if (this.frameId) {
      cancelAnimationFrame(this.frameId);
      this.frameId = 0;
    }
  }

  /**
   * Returns whether the animation loop is currently running.
   *
   * @returns true if the loop is running, false otherwise
   */
  isRunning(): boolean {
    return this.running;
  }

  /**
   * The main tick function called each frame.
   * Uses an arrow function to preserve `this` binding.
   */
  private tick = (): void => {
    if (!this.running) {
      return;
    }

    // Calculate delta time
    const currentTime = performance.now();
    let deltaTime = (currentTime - this.lastTime) / 1000; // Convert ms to seconds
    this.lastTime = currentTime;

    // Cap delta time to prevent physics explosion after tab switch
    if (deltaTime > MAX_DELTA_TIME) {
      deltaTime = MAX_DELTA_TIME;
    }

    // Call all registered callbacks
    for (const callback of this.callbacks) {
      callback(deltaTime);
    }

    // Schedule next frame
    this.frameId = requestAnimationFrame(this.tick);
  };
}
