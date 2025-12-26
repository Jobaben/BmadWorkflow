/**
 * 3D Animation Learning Foundation - Entry Point
 *
 * This is the main entry point for the application.
 * It uses DemoRenderer, SceneManager, AnimationLoop, and FPS monitoring.
 */

import './style.css';
import * as THREE from 'three';
import GUI from 'lil-gui';
import {
  DemoRenderer,
  SceneManager,
  AnimationLoop,
  FPSMonitor,
  InputManager,
  isWebGLAvailable,
  showWebGLFallback,
} from './core';
import { FPSDisplay, DemoSelector } from './ui';

// Import types and enums
import { DemoType } from './types';
import type { Demo, ParameterSchema, DemoInfo } from './types';

/** Reference to the demo renderer for cleanup */
let demoRenderer: DemoRenderer | null = null;

/** Reference to the GUI for cleanup */
let gui: GUI | null = null;

/** Reference to the animation loop for cleanup */
let animationLoop: AnimationLoop | null = null;

/** Reference to the FPS display for cleanup */
let fpsDisplay: FPSDisplay | null = null;

/** Reference to the input manager for cleanup */
let inputManager: InputManager | null = null;

/** Reference to the demo selector for cleanup */
let demoSelector: DemoSelector | null = null;

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
  const sceneManager = new SceneManager();

  // Connect camera to renderer for resize updates
  demoRenderer.setCamera(sceneManager.getCamera());

  // Add a simple cube to verify rendering is working
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshStandardMaterial({
    color: 0x4a90d9,
    roughness: 0.5,
    metalness: 0.5,
  });
  const cube = new THREE.Mesh(geometry, material);
  sceneManager.addObject(cube);

  // Initialize the input manager
  inputManager = new InputManager(canvas, sceneManager.getCamera());

  // Add a helper cube that follows the mouse world position
  const helperGeometry = new THREE.BoxGeometry(0.3, 0.3, 0.3);
  const helperMaterial = new THREE.MeshStandardMaterial({
    color: 0xff6b6b,
    roughness: 0.3,
    metalness: 0.7,
    transparent: true,
    opacity: 0.8,
  });
  const helperCube = new THREE.Mesh(helperGeometry, helperMaterial);
  helperCube.position.z = 0; // On the z=0 plane
  sceneManager.addObject(helperCube);

  // Create FPS monitor and display
  const fpsMonitor = new FPSMonitor();
  fpsDisplay = new FPSDisplay(fpsMonitor);
  fpsDisplay.show();

  // Create the animation loop
  animationLoop = new AnimationLoop();

  // Create a simple GUI to control the cube
  gui = new GUI();
  const params = {
    rotationSpeed: 0.01,
    color: '#4a90d9',
    showFPS: true,
  };
  gui.add(params, 'rotationSpeed', 0, 0.1).name('Rotation Speed');
  gui.addColor(params, 'color').name('Color').onChange((value: string) => {
    material.color.set(value);
  });
  gui.add(params, 'showFPS').name('Show FPS').onChange((value: boolean) => {
    if (value) {
      fpsDisplay?.show();
    } else {
      fpsDisplay?.hide();
    }
  });

  // Initialize demo selector
  const demoSelectorContainer = document.getElementById('demo-selector-container');
  if (demoSelectorContainer) {
    demoSelector = new DemoSelector(demoSelectorContainer);

    // Configure available demos
    const demos: DemoInfo[] = [
      { id: DemoType.Particles, label: 'Particles', description: 'Particle system demonstration' },
      { id: DemoType.Objects, label: 'Objects', description: '3D object animation' },
      { id: DemoType.Fluid, label: 'Fluid', description: 'Fluid physics simulation' },
      { id: DemoType.Combined, label: 'Combined', description: 'All demos together' },
    ];
    demoSelector.setDemos(demos);

    // Set initial selection
    demoSelector.setSelected(DemoType.Particles);

    // Handle demo selection changes
    demoSelector.onSelect((id: DemoType) => {
      console.log('Demo selected:', id);
      // TODO: Integrate with DemoController when available
    });
  }

  // Track previous key state for logging changes
  let previousKeysCount = 0;

  // Register the frame callback
  animationLoop.onFrame((deltaTime: number) => {
    // Update FPS monitor
    fpsMonitor.frame(deltaTime);
    fpsDisplay?.update();

    // Get input state and update helper cube
    if (inputManager) {
      const inputState = inputManager.getInputState();

      // Update helper cube position to follow mouse world position
      helperCube.position.x = inputState.mouseWorldPosition.x;
      helperCube.position.y = inputState.mouseWorldPosition.y;

      // Change color based on mouse button state
      if (inputState.isMouseDown) {
        helperMaterial.color.setHex(0x4ecdc4);
      } else {
        helperMaterial.color.setHex(0xff6b6b);
      }

      // Log keyboard state changes (only when keys change)
      if (inputState.keysPressed.size !== previousKeysCount) {
        if (inputState.keysPressed.size > 0) {
          console.log('Keys pressed:', Array.from(inputState.keysPressed).join(', '));
        }
        previousKeysCount = inputState.keysPressed.size;
      }
    }

    // Rotate the cube (frame-rate independent)
    const rotationAmount = params.rotationSpeed * deltaTime * 60;
    cube.rotation.x += rotationAmount;
    cube.rotation.y += rotationAmount;

    // Render the scene
    if (demoRenderer) {
      demoRenderer.render(sceneManager.getScene());
    }
  });

  // Start the animation loop
  animationLoop.start();

  // Log success message
  console.log('3D Animation Learning Foundation initialized successfully');
  console.log('Three.js version:', THREE.REVISION);
  console.log('Using DemoRenderer, SceneManager, AnimationLoop, and InputManager');
  console.log('Animation loop running:', animationLoop.isRunning());
  console.log('Move mouse over canvas - red cube follows mouse position');
  console.log('Click mouse - cube turns teal');
  console.log('Press keys - watch console for key events');
}

/**
 * Cleanup resources on page unload.
 */
function cleanup(): void {
  if (animationLoop) {
    animationLoop.stop();
    animationLoop = null;
  }
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
  if (demoRenderer) {
    demoRenderer.dispose();
    demoRenderer = null;
  }
  if (gui) {
    gui.destroy();
    gui = null;
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', init);

// Cleanup on page unload
window.addEventListener('beforeunload', cleanup);

// Export types to verify they're accessible
export type { DemoType, Demo, ParameterSchema };
