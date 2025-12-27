/**
 * Demo Viewport Component
 *
 * Container for the 3D demo rendering within the wizard layout.
 * Manages canvas attachment, sizing, and resize handling.
 *
 * @see FR-007 (Integrated Demo Rendering)
 * @see AC5 (Demo viewport contains the 3D canvas)
 */

/**
 * CSS styles for the demo viewport.
 */
export function getDemoViewportStyles(): string {
  return `
    .demo-viewport {
      position: relative;
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      background-color: #000;
      overflow: hidden;
    }

    .demo-viewport-canvas-container {
      flex: 1;
      position: relative;
      overflow: hidden;
    }

    .demo-viewport-canvas-container canvas {
      display: block;
      width: 100%;
      height: 100%;
    }

    .demo-viewport-controls {
      position: absolute;
      top: 10px;
      left: 10px;
      z-index: 10;
      pointer-events: auto;
    }

    .demo-viewport-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      pointer-events: none;
      z-index: 5;
    }

    .demo-viewport-status {
      position: absolute;
      bottom: 10px;
      left: 10px;
      padding: 4px 10px;
      background-color: rgba(0, 0, 0, 0.7);
      color: #00ff00;
      font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
      font-size: 11px;
      border-radius: 4px;
      z-index: 10;
    }
  `;
}

/**
 * Check if styles have been injected.
 */
let demoViewportStylesInjected = false;

/**
 * Inject demo viewport styles into the document head.
 */
export function injectDemoViewportStyles(): void {
  if (demoViewportStylesInjected || typeof document === 'undefined') {
    return;
  }

  const styleElement = document.createElement('style');
  styleElement.id = 'demo-viewport-styles';
  styleElement.textContent = getDemoViewportStyles();
  document.head.appendChild(styleElement);
  demoViewportStylesInjected = true;
}

/**
 * DemoViewport manages the 3D canvas within the wizard layout.
 *
 * Responsibilities:
 * - Size canvas appropriately within split layout
 * - Handle viewport resize events
 * - Provide container for demo overlays and controls
 *
 * @example
 * ```typescript
 * const viewport = new DemoViewport(container);
 * viewport.attachCanvas(rendererCanvas);
 * viewport.onResize((width, height) => {
 *   renderer.setSize(width, height);
 * });
 * ```
 */
export class DemoViewport {
  private container: HTMLElement;
  private rootElement: HTMLElement;
  private canvasContainer: HTMLElement;
  private controlsContainer: HTMLElement;
  private overlayContainer: HTMLElement;
  private statusElement: HTMLElement | null = null;

  private attachedCanvas: HTMLCanvasElement | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private resizeCallbacks: ((width: number, height: number) => void)[] = [];

  /**
   * Create a new DemoViewport.
   *
   * @param container - The HTML element to render the viewport into
   */
  constructor(container: HTMLElement) {
    this.container = container;

    // Inject styles
    injectDemoViewportStyles();

    // Create viewport structure
    this.rootElement = this.createRootElement();
    this.canvasContainer = this.createCanvasContainer();
    this.controlsContainer = this.createControlsContainer();
    this.overlayContainer = this.createOverlayContainer();

    // Assemble
    this.rootElement.appendChild(this.canvasContainer);
    this.rootElement.appendChild(this.controlsContainer);
    this.rootElement.appendChild(this.overlayContainer);
    this.container.appendChild(this.rootElement);

    // Setup resize observer
    this.setupResizeObserver();
  }

  /**
   * Create the root viewport element.
   */
  private createRootElement(): HTMLElement {
    const root = document.createElement('div');
    root.className = 'demo-viewport';
    return root;
  }

  /**
   * Create the canvas container.
   */
  private createCanvasContainer(): HTMLElement {
    const container = document.createElement('div');
    container.className = 'demo-viewport-canvas-container';
    return container;
  }

  /**
   * Create the controls container.
   */
  private createControlsContainer(): HTMLElement {
    const container = document.createElement('div');
    container.className = 'demo-viewport-controls';
    return container;
  }

  /**
   * Create the overlay container.
   */
  private createOverlayContainer(): HTMLElement {
    const container = document.createElement('div');
    container.className = 'demo-viewport-overlay';
    return container;
  }

  /**
   * Setup the resize observer for the canvas container.
   */
  private setupResizeObserver(): void {
    this.resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        this.handleResize(width, height);
      }
    });

    this.resizeObserver.observe(this.canvasContainer);
  }

  /**
   * Handle resize events.
   */
  private handleResize(width: number, height: number): void {
    // Update canvas size if attached
    if (this.attachedCanvas) {
      this.attachedCanvas.width = width;
      this.attachedCanvas.height = height;
    }

    // Notify callbacks
    for (const callback of this.resizeCallbacks) {
      callback(width, height);
    }
  }

  /**
   * Attach a canvas element to the viewport.
   *
   * @param canvas - The canvas element to attach
   */
  attachCanvas(canvas: HTMLCanvasElement): void {
    // Remove existing canvas if any
    if (this.attachedCanvas && this.attachedCanvas.parentElement === this.canvasContainer) {
      this.canvasContainer.removeChild(this.attachedCanvas);
    }

    this.attachedCanvas = canvas;
    this.canvasContainer.appendChild(canvas);

    // Trigger initial resize
    this.resize();
  }

  /**
   * Detach the current canvas from the viewport.
   *
   * @returns The detached canvas, or null if no canvas was attached
   */
  detachCanvas(): HTMLCanvasElement | null {
    if (this.attachedCanvas && this.attachedCanvas.parentElement === this.canvasContainer) {
      this.canvasContainer.removeChild(this.attachedCanvas);
    }

    const canvas = this.attachedCanvas;
    this.attachedCanvas = null;
    return canvas;
  }

  /**
   * Get the attached canvas element.
   */
  getCanvas(): HTMLCanvasElement | null {
    return this.attachedCanvas;
  }

  /**
   * Get the canvas container element.
   * Useful for appending the canvas before attaching.
   */
  getCanvasContainer(): HTMLElement {
    return this.canvasContainer;
  }

  /**
   * Get the controls container element.
   * Use this to add overlay controls (like lil-gui).
   */
  getControlsContainer(): HTMLElement {
    return this.controlsContainer;
  }

  /**
   * Get the overlay container element.
   * Use this for non-interactive overlays.
   */
  getOverlayContainer(): HTMLElement {
    return this.overlayContainer;
  }

  /**
   * Force a resize recalculation.
   */
  resize(): void {
    const rect = this.canvasContainer.getBoundingClientRect();
    this.handleResize(rect.width, rect.height);
  }

  /**
   * Get the current viewport dimensions.
   */
  getDimensions(): { width: number; height: number } {
    const rect = this.canvasContainer.getBoundingClientRect();
    return { width: rect.width, height: rect.height };
  }

  /**
   * Register a callback for resize events.
   *
   * @param callback - Function called with (width, height) on resize
   */
  onResize(callback: (width: number, height: number) => void): void {
    this.resizeCallbacks.push(callback);
  }

  /**
   * Remove a resize callback.
   */
  offResize(callback: (width: number, height: number) => void): void {
    const index = this.resizeCallbacks.indexOf(callback);
    if (index !== -1) {
      this.resizeCallbacks.splice(index, 1);
    }
  }

  /**
   * Show a status message in the viewport.
   */
  showStatus(message: string): void {
    if (!this.statusElement) {
      this.statusElement = document.createElement('div');
      this.statusElement.className = 'demo-viewport-status';
      this.rootElement.appendChild(this.statusElement);
    }
    this.statusElement.textContent = message;
    this.statusElement.style.display = 'block';
  }

  /**
   * Hide the status message.
   */
  hideStatus(): void {
    if (this.statusElement) {
      this.statusElement.style.display = 'none';
    }
  }

  /**
   * Dispose the viewport and clean up resources.
   */
  dispose(): void {
    // Stop observing
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }

    // Clear callbacks
    this.resizeCallbacks = [];

    // Remove from DOM
    if (this.rootElement.parentElement === this.container) {
      this.container.removeChild(this.rootElement);
    }

    this.attachedCanvas = null;
  }
}
