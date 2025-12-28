/**
 * Demo Adapter for Wizard Integration
 *
 * Provides a clean interface between the wizard layer and the demo layer.
 * Implements the Adapter pattern to allow the wizard to control demos
 * without knowledge of their internal implementation.
 *
 * @zone SYNC
 * @reason Demo lifecycle methods must be synchronous for deterministic behavior
 *
 * @see FR-007 (Integrated Demo Rendering)
 * @see ADR-001 (Layered Architecture)
 */

import type { Object3D } from 'three';
import type { Demo, InputState, DemoType } from '../types';
import type { WizardStep } from './types';

/**
 * Factory function type for creating demo instances.
 */
export type DemoFactory = () => Demo;

/**
 * Event types emitted by the DemoAdapter.
 */
export type DemoAdapterEvent = 'demoLoaded' | 'demoUnloaded' | 'error';

/**
 * Event listener callback type.
 */
export type DemoAdapterEventListener = (data: DemoAdapterEventData) => void;

/**
 * Event data passed to listeners.
 */
export interface DemoAdapterEventData {
  event: DemoAdapterEvent;
  demoType: DemoType | null;
  error?: Error;
}

/**
 * DemoAdapter wraps the demo layer to provide a wizard-friendly API.
 *
 * Responsibilities:
 * - Load and switch between demo instances
 * - Forward parameter changes to active demo
 * - Manage demo lifecycle (start, stop, reset)
 * - Provide access to scene objects for rendering
 * - Forward input and update calls
 *
 * @example
 * ```typescript
 * const demoFactories = new Map<DemoType, DemoFactory>([
 *   [DemoType.Particles, () => new ParticleDemo()],
 *   [DemoType.Objects, () => new ObjectDemo()],
 * ]);
 *
 * const adapter = new DemoAdapter(demoFactories);
 * adapter.loadDemoForStep(wizardStep);
 * scene.add(...adapter.getSceneObjects());
 *
 * // In animation loop:
 * adapter.update(deltaTime);
 * adapter.onInput(inputState);
 * ```
 */
export class DemoAdapter {
  /** Map of demo type to factory function */
  private readonly demoFactories: Map<DemoType, DemoFactory>;

  /** Currently active demo instance */
  private currentDemo: Demo | null = null;

  /** Type of the currently active demo */
  private currentDemoType: DemoType | null = null;

  /** Event listeners */
  private listeners: Map<DemoAdapterEvent, Set<DemoAdapterEventListener>> = new Map();

  /** Whether the adapter has been disposed */
  private disposed: boolean = false;

  /**
   * Create a new DemoAdapter.
   *
   * @param demoFactories - Map of demo types to factory functions
   */
  constructor(demoFactories: Map<DemoType, DemoFactory>) {
    this.demoFactories = demoFactories;

    // Initialize listener sets
    this.listeners.set('demoLoaded', new Set());
    this.listeners.set('demoUnloaded', new Set());
    this.listeners.set('error', new Set());
  }

  /**
   * Load the demo specified by a wizard step.
   *
   * @param step - The wizard step containing the demo type to load
   * @throws Error if the demo type is not registered
   */
  loadDemoForStep(step: WizardStep): void {
    if (this.disposed) {
      console.warn('DemoAdapter: Cannot load demo, adapter is disposed');
      return;
    }

    const demoType = step.demoType;

    // If the same demo type is already loaded, just reset it
    if (this.currentDemoType === demoType && this.currentDemo) {
      this.currentDemo.reset();
      return;
    }

    // Unload current demo if any
    this.unloadCurrentDemo();

    // Get the factory for the requested demo type
    const factory = this.demoFactories.get(demoType);
    if (!factory) {
      const error = new Error(`DemoAdapter: No factory registered for demo type: ${demoType}`);
      this.emit('error', { event: 'error', demoType, error });
      throw error;
    }

    // Create and start the new demo
    try {
      this.currentDemo = factory();
      this.currentDemoType = demoType;
      this.currentDemo.start();

      this.emit('demoLoaded', { event: 'demoLoaded', demoType });
    } catch (error) {
      this.currentDemo = null;
      this.currentDemoType = null;

      const err = error instanceof Error ? error : new Error(String(error));
      this.emit('error', { event: 'error', demoType, error: err });
      throw err;
    }
  }

  /**
   * Set a parameter value on the current demo.
   *
   * @param key - The parameter key
   * @param value - The new parameter value
   */
  setParameter(key: string, value: unknown): void {
    if (!this.currentDemo) {
      console.warn('DemoAdapter: Cannot set parameter, no demo loaded');
      return;
    }

    try {
      this.currentDemo.setParameter(key, value);
    } catch (error) {
      console.error(`DemoAdapter: Error setting parameter "${key}":`, error);
    }
  }

  /**
   * Reset the current demo to its initial state.
   */
  resetDemo(): void {
    if (!this.currentDemo) {
      console.warn('DemoAdapter: Cannot reset, no demo loaded');
      return;
    }

    this.currentDemo.reset();
  }

  /**
   * Get the scene objects from the current demo.
   *
   * @returns Array of Three.js objects, or empty array if no demo loaded
   */
  getSceneObjects(): Object3D[] {
    if (!this.currentDemo) {
      return [];
    }

    return this.currentDemo.getSceneObjects();
  }

  /**
   * Update the current demo.
   *
   * @param deltaTime - Time elapsed since last frame in seconds
   */
  update(deltaTime: number): void {
    if (!this.currentDemo) {
      return;
    }

    this.currentDemo.update(deltaTime);
  }

  /**
   * Forward input state to the current demo.
   *
   * @param state - Current input state
   */
  onInput(state: InputState): void {
    if (!this.currentDemo) {
      return;
    }

    this.currentDemo.onInput(state);
  }

  /**
   * Get the currently active demo instance.
   *
   * @returns The current demo or null if none loaded
   */
  getCurrentDemo(): Demo | null {
    return this.currentDemo;
  }

  /**
   * Get the type of the currently active demo.
   *
   * @returns The current demo type or null if none loaded
   */
  getCurrentDemoType(): DemoType | null {
    return this.currentDemoType;
  }

  /**
   * Check if a demo is currently loaded.
   *
   * @returns True if a demo is loaded
   */
  hasDemo(): boolean {
    return this.currentDemo !== null;
  }

  /**
   * Check if a specific demo type is supported.
   *
   * @param demoType - The demo type to check
   * @returns True if a factory is registered for this type
   */
  supportsDemoType(demoType: DemoType): boolean {
    return this.demoFactories.has(demoType);
  }

  /**
   * Get all supported demo types.
   *
   * @returns Array of supported demo types
   */
  getSupportedDemoTypes(): DemoType[] {
    return Array.from(this.demoFactories.keys());
  }

  /**
   * Add an event listener.
   *
   * @param event - Event type to listen for
   * @param listener - Callback function
   */
  on(event: DemoAdapterEvent, listener: DemoAdapterEventListener): void {
    const listeners = this.listeners.get(event);
    if (listeners) {
      listeners.add(listener);
    }
  }

  /**
   * Remove an event listener.
   *
   * @param event - Event type
   * @param listener - Callback function to remove
   */
  off(event: DemoAdapterEvent, listener: DemoAdapterEventListener): void {
    const listeners = this.listeners.get(event);
    if (listeners) {
      listeners.delete(listener);
    }
  }

  /**
   * Unload the current demo and clean up resources.
   */
  unloadCurrentDemo(): void {
    if (this.currentDemo) {
      const previousType = this.currentDemoType;

      try {
        this.currentDemo.stop();
      } catch (error) {
        console.error('DemoAdapter: Error stopping demo:', error);
      }

      this.currentDemo = null;
      this.currentDemoType = null;

      this.emit('demoUnloaded', { event: 'demoUnloaded', demoType: previousType });
    }
  }

  /**
   * Dispose of the adapter and clean up all resources.
   */
  dispose(): void {
    if (this.disposed) {
      return;
    }

    this.unloadCurrentDemo();

    // Clear all listeners
    for (const listeners of this.listeners.values()) {
      listeners.clear();
    }
    this.listeners.clear();

    this.disposed = true;
  }

  /**
   * Emit an event to all registered listeners.
   */
  private emit(event: DemoAdapterEvent, data: DemoAdapterEventData): void {
    const listeners = this.listeners.get(event);
    if (listeners) {
      for (const listener of listeners) {
        try {
          listener(data);
        } catch (error) {
          console.error(`DemoAdapter: Error in ${event} listener:`, error);
        }
      }
    }
  }
}
