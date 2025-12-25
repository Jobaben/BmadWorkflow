/**
 * FPSDisplay - On-Screen FPS Counter
 *
 * Creates an unobtrusive overlay displaying current FPS.
 * Can be toggled on/off for performance debugging.
 */

import type { FPSMonitor } from '../core/FPSMonitor';

/** CSS class name for the FPS display element */
const FPS_DISPLAY_CLASS = 'fps-display';

/**
 * FPSDisplay shows FPS metrics in a corner of the screen.
 *
 * Features:
 * - Shows current and average FPS
 * - Positioned in top-left corner (unobtrusive)
 * - Can be shown/hidden on demand
 * - Auto-updates each frame when update() is called
 *
 * @example
 * ```typescript
 * const fpsMonitor = new FPSMonitor();
 * const fpsDisplay = new FPSDisplay(fpsMonitor);
 * fpsDisplay.show();
 *
 * loop.onFrame((dt) => {
 *   fpsMonitor.frame(dt);
 *   fpsDisplay.update();
 * });
 * ```
 */
export class FPSDisplay {
  private element: HTMLDivElement | null = null;
  private fpsMonitor: FPSMonitor;
  private visible: boolean = false;

  /**
   * Creates a new FPSDisplay.
   *
   * @param fpsMonitor - The FPSMonitor to read values from
   */
  constructor(fpsMonitor: FPSMonitor) {
    this.fpsMonitor = fpsMonitor;
  }

  /**
   * Shows the FPS display overlay.
   * Creates the DOM element if it doesn't exist.
   */
  show(): void {
    if (this.visible) {
      return;
    }

    this.visible = true;
    this.ensureElement();
    if (this.element) {
      this.element.style.display = 'block';
    }
  }

  /**
   * Hides the FPS display overlay.
   */
  hide(): void {
    if (!this.visible) {
      return;
    }

    this.visible = false;
    if (this.element) {
      this.element.style.display = 'none';
    }
  }

  /**
   * Toggles the visibility of the FPS display.
   *
   * @returns The new visibility state
   */
  toggle(): boolean {
    if (this.visible) {
      this.hide();
    } else {
      this.show();
    }
    return this.visible;
  }

  /**
   * Returns whether the FPS display is currently visible.
   */
  isVisible(): boolean {
    return this.visible;
  }

  /**
   * Updates the displayed FPS values.
   * Call this once per frame.
   */
  update(): void {
    if (!this.visible || !this.element) {
      return;
    }

    const currentFPS = this.fpsMonitor.currentFPS;
    const averageFPS = this.fpsMonitor.averageFPS;

    this.element.textContent = `FPS: ${currentFPS.toFixed(0)} (avg: ${averageFPS.toFixed(0)})`;
  }

  /**
   * Removes the FPS display element from the DOM.
   */
  dispose(): void {
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
    this.element = null;
    this.visible = false;
  }

  /**
   * Creates the DOM element if it doesn't exist.
   */
  private ensureElement(): void {
    if (this.element) {
      return;
    }

    this.element = document.createElement('div');
    this.element.className = FPS_DISPLAY_CLASS;
    this.element.textContent = 'FPS: --';
    document.body.appendChild(this.element);
  }
}
