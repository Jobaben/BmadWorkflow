/**
 * DemoRenderer - WebGL Renderer Wrapper
 *
 * Wraps Three.js WebGLRenderer with consistent configuration,
 * WebGL feature detection, and resize handling.
 */

import { WebGLRenderer, Scene, PerspectiveCamera } from 'three';

/** Maximum pixel ratio to use (limits memory usage on HiDPI displays) */
const MAX_PIXEL_RATIO = 2;

/** Debounce delay for resize events in milliseconds */
const RESIZE_DEBOUNCE_MS = 100;

/**
 * Detects if WebGL is available in the current browser.
 * @returns true if WebGL is supported, false otherwise
 */
export function isWebGLAvailable(): boolean {
  try {
    const canvas = document.createElement('canvas');
    const context =
      canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    return context !== null && context instanceof WebGLRenderingContext;
  } catch {
    return false;
  }
}

/**
 * Creates and displays a fallback message when WebGL is not available.
 * @param container - The container element to display the message in
 */
export function showWebGLFallback(container: HTMLElement): void {
  const message = document.createElement('div');
  message.id = 'webgl-fallback';
  message.innerHTML = `
    <h1>WebGL Not Supported</h1>
    <p>Your browser or device does not support WebGL, which is required for this application.</p>
    <p>Please try:</p>
    <ul>
      <li>Updating your browser to the latest version</li>
      <li>Enabling hardware acceleration in your browser settings</li>
      <li>Using a different browser (Chrome, Firefox, Edge, or Safari)</li>
    </ul>
  `;
  message.style.cssText = `
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
    color: #ffffff;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background: rgba(0, 0, 0, 0.8);
    padding: 2rem;
    border-radius: 8px;
    max-width: 400px;
  `;
  container.appendChild(message);
}

/**
 * DemoRenderer wraps Three.js WebGLRenderer with consistent configuration
 * for the 3D Animation Learning Foundation.
 *
 * Features:
 * - Automatic WebGL context creation with antialiasing
 * - HiDPI display support with capped pixel ratio
 * - Debounced window resize handling
 * - Clean disposal of resources
 */
export class DemoRenderer {
  private renderer: WebGLRenderer;
  private camera: PerspectiveCamera | null = null;
  private resizeTimeout: ReturnType<typeof setTimeout> | null = null;
  private boundOnResize: () => void;

  /**
   * Creates a new DemoRenderer.
   * @param canvas - The canvas element to render to
   * @throws Error if WebGL is not available
   */
  constructor(canvas: HTMLCanvasElement) {
    if (!isWebGLAvailable()) {
      throw new Error('WebGL is not available');
    }

    this.renderer = new WebGLRenderer({
      canvas,
      antialias: true,
      powerPreference: 'high-performance',
    });

    // Configure pixel ratio (capped for performance on HiDPI displays)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, MAX_PIXEL_RATIO));

    // Set initial size
    this.updateSize();

    // Bind resize handler
    this.boundOnResize = this.onWindowResize.bind(this);
    window.addEventListener('resize', this.boundOnResize);
  }

  /**
   * Sets the camera reference for resize updates.
   * @param camera - The perspective camera to update on resize
   */
  setCamera(camera: PerspectiveCamera): void {
    this.camera = camera;
  }

  /**
   * Renders a scene using the stored camera.
   * @param scene - The Three.js scene to render
   * @throws Error if camera is not set
   */
  render(scene: Scene): void {
    if (!this.camera) {
      throw new Error('Camera not set. Call setCamera() before rendering.');
    }
    this.renderer.render(scene, this.camera);
  }

  /**
   * Manually triggers a resize update.
   * Called automatically on window resize (debounced).
   */
  resize(): void {
    this.updateSize();
  }

  /**
   * Disposes of the renderer and removes event listeners.
   * Call this when the renderer is no longer needed.
   */
  dispose(): void {
    window.removeEventListener('resize', this.boundOnResize);
    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout);
    }
    this.renderer.dispose();
  }

  /**
   * Gets the underlying Three.js WebGLRenderer.
   * Use sparingly - prefer using DemoRenderer methods.
   * @returns The WebGLRenderer instance
   */
  getRenderer(): WebGLRenderer {
    return this.renderer;
  }

  /**
   * Gets the current canvas dimensions.
   * @returns Object with width and height
   */
  getSize(): { width: number; height: number } {
    return {
      width: window.innerWidth,
      height: window.innerHeight,
    };
  }

  /**
   * Updates renderer and camera sizes to match viewport.
   */
  private updateSize(): void {
    const width = window.innerWidth;
    const height = window.innerHeight;

    this.renderer.setSize(width, height);

    if (this.camera) {
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
    }
  }

  /**
   * Debounced resize event handler.
   */
  private onWindowResize(): void {
    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout);
    }

    this.resizeTimeout = setTimeout(() => {
      this.updateSize();
      this.resizeTimeout = null;
    }, RESIZE_DEBOUNCE_MS);
  }
}
