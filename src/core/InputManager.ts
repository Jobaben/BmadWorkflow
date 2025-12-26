/**
 * InputManager - Centralized Input Handling
 *
 * Provides unified handling for mouse and keyboard input events.
 * Normalizes mouse coordinates and projects them to 3D world space.
 *
 * Features:
 * - Mouse position in normalized coordinates (-1 to 1)
 * - Mouse position projected to world space (on z=0 plane)
 * - Mouse button state tracking
 * - Keyboard key tracking with Set
 * - Synchronous state access for render loop integration
 */

import { Vector2, Vector3, Camera, Raycaster, Plane } from 'three';
import type { InputState } from '../types';

/**
 * InputManager centralizes input handling for mouse and keyboard events.
 * It provides both normalized screen coordinates and world-space positions
 * for use in interactive demos.
 *
 * Usage:
 * ```typescript
 * const inputManager = new InputManager(canvas, camera);
 * // In render loop:
 * const state = inputManager.getInputState();
 * console.log(state.mousePosition); // Vector2(-1 to 1)
 * console.log(state.mouseWorldPosition); // Vector3 on z=0 plane
 * console.log(state.isMouseDown); // boolean
 * console.log(state.keysPressed); // Set<string>
 * ```
 */
export class InputManager {
  private canvas: HTMLCanvasElement;
  private camera: Camera;
  private raycaster: Raycaster;
  private groundPlane: Plane;

  // Current input state (mutable for performance)
  private mousePosition: Vector2;
  private mouseWorldPosition: Vector3;
  private isMouseDown: boolean;
  private keysPressed: Set<string>;

  // Bound event handlers (for removal during dispose)
  private boundOnMouseMove: (e: MouseEvent) => void;
  private boundOnMouseDown: (e: MouseEvent) => void;
  private boundOnMouseUp: (e: MouseEvent) => void;
  private boundOnMouseLeave: (e: MouseEvent) => void;
  private boundOnKeyDown: (e: KeyboardEvent) => void;
  private boundOnKeyUp: (e: KeyboardEvent) => void;
  private boundOnWindowBlur: () => void;

  /**
   * Creates a new InputManager.
   * @param canvas - The canvas element to listen for mouse events
   * @param camera - The camera used for projecting mouse to world space
   */
  constructor(canvas: HTMLCanvasElement, camera: Camera) {
    this.canvas = canvas;
    this.camera = camera;

    // Initialize raycaster for world-space projection
    this.raycaster = new Raycaster();

    // Ground plane at z=0 for mouse projection
    this.groundPlane = new Plane(new Vector3(0, 0, 1), 0);

    // Initialize input state
    this.mousePosition = new Vector2(0, 0);
    this.mouseWorldPosition = new Vector3(0, 0, 0);
    this.isMouseDown = false;
    this.keysPressed = new Set<string>();

    // Bind event handlers
    this.boundOnMouseMove = this.onMouseMove.bind(this);
    this.boundOnMouseDown = this.onMouseDown.bind(this);
    this.boundOnMouseUp = this.onMouseUp.bind(this);
    this.boundOnMouseLeave = this.onMouseLeave.bind(this);
    this.boundOnKeyDown = this.onKeyDown.bind(this);
    this.boundOnKeyUp = this.onKeyUp.bind(this);
    this.boundOnWindowBlur = this.onWindowBlur.bind(this);

    // Add event listeners
    this.addEventListeners();
  }

  /**
   * Gets the current input state.
   * Returns a snapshot of mouse and keyboard state for synchronous access.
   * @returns Current input state
   */
  getInputState(): InputState {
    // Return state with a copy of keysPressed to prevent external mutation
    return {
      mousePosition: this.mousePosition.clone(),
      mouseWorldPosition: this.mouseWorldPosition.clone(),
      isMouseDown: this.isMouseDown,
      keysPressed: new Set(this.keysPressed),
    };
  }

  /**
   * Updates the camera reference.
   * Call this if the camera changes after initialization.
   * @param camera - The new camera to use for projections
   */
  setCamera(camera: Camera): void {
    this.camera = camera;
  }

  /**
   * Disposes of the InputManager and removes all event listeners.
   * Call this when the InputManager is no longer needed.
   */
  dispose(): void {
    this.removeEventListeners();
    this.keysPressed.clear();
  }

  /**
   * Adds all event listeners to the canvas and window.
   */
  private addEventListeners(): void {
    // Mouse events on canvas
    this.canvas.addEventListener('mousemove', this.boundOnMouseMove);
    this.canvas.addEventListener('mousedown', this.boundOnMouseDown);
    this.canvas.addEventListener('mouseup', this.boundOnMouseUp);
    this.canvas.addEventListener('mouseleave', this.boundOnMouseLeave);

    // Keyboard events on window (to capture even when canvas not focused)
    window.addEventListener('keydown', this.boundOnKeyDown);
    window.addEventListener('keyup', this.boundOnKeyUp);

    // Clear keys when window loses focus
    window.addEventListener('blur', this.boundOnWindowBlur);
  }

  /**
   * Removes all event listeners.
   */
  private removeEventListeners(): void {
    this.canvas.removeEventListener('mousemove', this.boundOnMouseMove);
    this.canvas.removeEventListener('mousedown', this.boundOnMouseDown);
    this.canvas.removeEventListener('mouseup', this.boundOnMouseUp);
    this.canvas.removeEventListener('mouseleave', this.boundOnMouseLeave);

    window.removeEventListener('keydown', this.boundOnKeyDown);
    window.removeEventListener('keyup', this.boundOnKeyUp);
    window.removeEventListener('blur', this.boundOnWindowBlur);
  }

  /**
   * Converts mouse event coordinates to normalized device coordinates (-1 to 1).
   * @param event - The mouse event
   */
  private updateMousePosition(event: MouseEvent): void {
    const rect = this.canvas.getBoundingClientRect();

    // Calculate normalized coordinates (-1 to 1)
    // x: -1 at left edge, +1 at right edge
    // y: +1 at top edge, -1 at bottom edge (WebGL coordinate system)
    this.mousePosition.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mousePosition.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    // Update world position
    this.updateWorldPosition();
  }

  /**
   * Projects the normalized mouse position to world space on the z=0 plane.
   */
  private updateWorldPosition(): void {
    // Set up raycaster from camera through mouse position
    this.raycaster.setFromCamera(this.mousePosition, this.camera);

    // Find intersection with ground plane at z=0
    const intersection = new Vector3();
    const ray = this.raycaster.ray;

    if (ray.intersectPlane(this.groundPlane, intersection)) {
      this.mouseWorldPosition.copy(intersection);
    }
  }

  /**
   * Handles mouse move events.
   */
  private onMouseMove(event: MouseEvent): void {
    this.updateMousePosition(event);
  }

  /**
   * Handles mouse down events.
   */
  private onMouseDown(event: MouseEvent): void {
    // Track primary button (left click)
    if (event.button === 0) {
      this.isMouseDown = true;
    }
    this.updateMousePosition(event);
  }

  /**
   * Handles mouse up events.
   */
  private onMouseUp(event: MouseEvent): void {
    // Track primary button (left click)
    if (event.button === 0) {
      this.isMouseDown = false;
    }
    this.updateMousePosition(event);
  }

  /**
   * Handles mouse leave events (mouse exits canvas).
   */
  private onMouseLeave(_event: MouseEvent): void {
    // Reset mouse down state when mouse leaves canvas
    this.isMouseDown = false;
  }

  /**
   * Handles key down events.
   */
  private onKeyDown(event: KeyboardEvent): void {
    // Add key to pressed set (using key value, e.g., 'a', 'ArrowUp', 'Space')
    this.keysPressed.add(event.key);
  }

  /**
   * Handles key up events.
   */
  private onKeyUp(event: KeyboardEvent): void {
    // Remove key from pressed set
    this.keysPressed.delete(event.key);
  }

  /**
   * Handles window blur (focus lost) events.
   * Clears all pressed keys to prevent stuck keys.
   */
  private onWindowBlur(): void {
    this.keysPressed.clear();
  }
}
