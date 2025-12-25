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
  isWebGLAvailable,
  showWebGLFallback,
} from './core';
import { FPSDisplay } from './ui';

// Import types to verify they compile correctly
import type { DemoType, Demo, ParameterSchema } from './types';

/** Reference to the demo renderer for cleanup */
let demoRenderer: DemoRenderer | null = null;

/** Reference to the GUI for cleanup */
let gui: GUI | null = null;

/** Reference to the animation loop for cleanup */
let animationLoop: AnimationLoop | null = null;

/** Reference to the FPS display for cleanup */
let fpsDisplay: FPSDisplay | null = null;

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

  // Register the frame callback
  animationLoop.onFrame((deltaTime: number) => {
    // Update FPS monitor
    fpsMonitor.frame(deltaTime);
    fpsDisplay?.update();

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
  console.log('Using DemoRenderer, SceneManager, and AnimationLoop');
  console.log('Animation loop running:', animationLoop.isRunning());
}

/**
 * Cleanup resources on page unload.
 */
function cleanup(): void {
  if (animationLoop) {
    animationLoop.stop();
    animationLoop = null;
  }
  if (fpsDisplay) {
    fpsDisplay.dispose();
    fpsDisplay = null;
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
