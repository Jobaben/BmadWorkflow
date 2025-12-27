/**
 * 3D Animation Learning Foundation - Entry Point
 *
 * This is the main entry point for the application.
 * It uses DemoRenderer, SceneManager, AnimationLoop, and FPS monitoring.
 */

import './style.css';
import {
  DemoRenderer,
  SceneManager,
  AnimationLoop,
  FPSMonitor,
  InputManager,
  isWebGLAvailable,
  showWebGLFallback,
} from './core';
import { FPSDisplay, DemoSelector, ControlPanel } from './ui';
import { ParticleDemo, ObjectDemo, FluidDemo, CombinedDemo } from './demos';

// Import types and enums
import { DemoType } from './types';
import type { Demo, DemoInfo } from './types';

/** Reference to the demo renderer for cleanup */
let demoRenderer: DemoRenderer | null = null;

/** Reference to the control panel for cleanup */
let controlPanel: ControlPanel | null = null;

/** Reference to the animation loop for cleanup */
let animationLoop: AnimationLoop | null = null;

/** Reference to the FPS display for cleanup */
let fpsDisplay: FPSDisplay | null = null;

/** Reference to the input manager for cleanup */
let inputManager: InputManager | null = null;

/** Reference to the demo selector for cleanup */
let demoSelector: DemoSelector | null = null;

/** Reference to the scene manager */
let sceneManager: SceneManager | null = null;

/** Bound keyboard handler for cleanup */
let boundKeyHandler: ((e: KeyboardEvent) => void) | null = null;

/** Map of available demos */
const demos: Map<DemoType, Demo> = new Map();

/** Currently active demo */
let activeDemo: Demo | null = null;

/**
 * Resets the current demo to its initial state.
 * Also resets control panel parameters to their default values.
 * This is called when pressing the R key or clicking Reset in control panel.
 */
function resetCurrentDemo(): void {
  if (controlPanel) {
    // resetToDefaults will reset UI values and call the registered reset callbacks
    controlPanel.resetToDefaults();
  } else if (activeDemo) {
    // Fallback if no control panel
    activeDemo.reset();
  }
}

/**
 * Handles global keyboard events for application-wide shortcuts.
 * - R key: Reset current demo
 * - F key: Toggle FPS display
 * @param event - The keyboard event
 */
function handleKeyDown(event: KeyboardEvent): void {
  // Don't trigger shortcuts if user is typing in an input field
  const target = event.target as HTMLElement;
  if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
    return;
  }

  switch (event.key.toLowerCase()) {
    case 'r':
      // R key triggers reset
      resetCurrentDemo();
      break;
    case 'f':
      // F key toggles FPS display
      if (fpsDisplay) {
        fpsDisplay.toggle();
      }
      break;
  }
}

/**
 * Switches to a new demo.
 * Stops the current demo, cleans up, and starts the new one.
 *
 * @param demoType - The type of demo to switch to
 */
function switchDemo(demoType: DemoType): void {
  if (!sceneManager) return;

  // Stop and remove current demo
  if (activeDemo) {
    activeDemo.stop();
    const objects = activeDemo.getSceneObjects();
    objects.forEach((obj) => sceneManager!.removeObject(obj));
  }

  // Get the new demo
  const newDemo = demos.get(demoType);
  if (!newDemo) {
    console.warn(`Demo not found: ${demoType}`);
    return;
  }

  // Set as active demo
  activeDemo = newDemo;

  // Add demo objects to scene
  const objects = activeDemo.getSceneObjects();
  objects.forEach((obj) => sceneManager!.addObject(obj));

  // Start the demo
  activeDemo.start();

  // Update control panel with new demo's parameters
  if (controlPanel) {
    controlPanel.setParameters(activeDemo.getParameterSchema());
  }
}

/**
 * Initialize the application when the DOM is ready.
 */
function init(): void {
  // Get the app container
  const appContainer = document.getElementById('app');
  if (!appContainer) {
    console.error('App container not found');
    return;
  }

  // Check for WebGL support
  if (!isWebGLAvailable()) {
    showWebGLFallback(appContainer);
    return;
  }

  // Get the canvas element
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  if (!canvas) {
    console.error('Canvas element not found');
    return;
  }

  // Initialize the renderer
  try {
    demoRenderer = new DemoRenderer(canvas);
  } catch (error) {
    console.error('Failed to initialize renderer:', error);
    showWebGLFallback(appContainer);
    return;
  }

  // Initialize the scene manager
  sceneManager = new SceneManager();

  // Connect camera to renderer for resize updates
  demoRenderer.setCamera(sceneManager.getCamera());

  // Initialize the input manager
  inputManager = new InputManager(canvas, sceneManager.getCamera());

  // Create FPS monitor and display
  const fpsMonitor = new FPSMonitor();
  fpsDisplay = new FPSDisplay(fpsMonitor);
  fpsDisplay.show();

  // Create the animation loop
  animationLoop = new AnimationLoop();

  // Initialize demos
  demos.set(DemoType.Particles, new ParticleDemo());
  demos.set(DemoType.Objects, new ObjectDemo());
  demos.set(DemoType.Fluid, new FluidDemo());
  demos.set(DemoType.Combined, new CombinedDemo());

  // Initialize control panel
  const controlPanelContainer = document.getElementById('control-panel-container');
  if (controlPanelContainer) {
    controlPanel = new ControlPanel(controlPanelContainer);

    // Handle parameter changes
    controlPanel.onParameterChange((key: string, value: unknown) => {
      if (activeDemo) {
        activeDemo.setParameter(key, value);
      }
    });

    // Handle reset
    controlPanel.onReset(() => {
      if (activeDemo) {
        activeDemo.reset();
      }
    });
  }

  // Initialize demo selector
  const demoSelectorContainer = document.getElementById('demo-selector-container');
  if (demoSelectorContainer) {
    demoSelector = new DemoSelector(demoSelectorContainer);

    // Configure available demos
    const demoInfos: DemoInfo[] = [
      { id: DemoType.Particles, label: 'Particles', description: 'Particle system demonstration' },
      { id: DemoType.Objects, label: 'Objects', description: '3D object animation' },
      { id: DemoType.Fluid, label: 'Fluid', description: 'Fluid physics simulation' },
      { id: DemoType.Combined, label: 'Combined', description: 'All demos together' },
    ];
    demoSelector.setDemos(demoInfos);

    // Handle demo selection changes
    demoSelector.onSelect((id: DemoType) => {
      switchDemo(id);
    });

    // Set initial selection and switch to it
    demoSelector.setSelected(DemoType.Particles);
    switchDemo(DemoType.Particles);
  }

  // Register the frame callback
  animationLoop.onFrame((deltaTime: number) => {
    // Update FPS monitor
    fpsMonitor.frame(deltaTime);
    fpsDisplay?.update();

    // Get input state and pass to active demo
    if (inputManager && activeDemo) {
      const inputState = inputManager.getInputState();
      activeDemo.onInput(inputState);
    }

    // Update active demo
    if (activeDemo) {
      activeDemo.update(deltaTime);
    }

    // Render the scene
    if (demoRenderer && sceneManager) {
      demoRenderer.render(sceneManager.getScene());
    }
  });

  // Start the animation loop
  animationLoop.start();

  // Register global keyboard shortcut handler for reset (R key)
  boundKeyHandler = handleKeyDown;
  window.addEventListener('keydown', boundKeyHandler);

  // Log success message
  console.log('3D Animation Learning Foundation initialized successfully');
  console.log('Animation loop running:', animationLoop.isRunning());
  console.log('Keyboard shortcuts: R = Reset, F = Toggle FPS');
}

/**
 * Cleanup resources on page unload.
 */
function cleanup(): void {
  // Remove global keyboard handler
  if (boundKeyHandler) {
    window.removeEventListener('keydown', boundKeyHandler);
    boundKeyHandler = null;
  }

  if (animationLoop) {
    animationLoop.stop();
    animationLoop = null;
  }

  // Dispose all demos
  demos.forEach((demo) => {
    if ('dispose' in demo && typeof demo.dispose === 'function') {
      (demo as { dispose: () => void }).dispose();
    }
  });
  demos.clear();
  activeDemo = null;

  if (inputManager) {
    inputManager.dispose();
    inputManager = null;
  }
  if (fpsDisplay) {
    fpsDisplay.dispose();
    fpsDisplay = null;
  }
  if (demoSelector) {
    demoSelector.dispose();
    demoSelector = null;
  }
  if (controlPanel) {
    controlPanel.dispose();
    controlPanel = null;
  }
  if (demoRenderer) {
    demoRenderer.dispose();
    demoRenderer = null;
  }

  sceneManager = null;
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', init);

// Cleanup on page unload
window.addEventListener('beforeunload', cleanup);

// Export types to verify they're accessible
export type { DemoType, Demo };
