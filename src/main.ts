/**
 * 3D Animation Learning Foundation - Entry Point
 *
 * This is the main entry point for the application.
 * It initializes Three.js and sets up the basic rendering pipeline.
 */

import './style.css';
import * as THREE from 'three';
import GUI from 'lil-gui';

// Import types to verify they compile correctly
import type { DemoType, Demo, ParameterSchema } from './types';

/**
 * Initialize the application when the DOM is ready.
 */
function init(): void {
  // Get the canvas element
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  if (!canvas) {
    console.error('Canvas element not found');
    return;
  }

  // Create the WebGL renderer
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Create a basic scene
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x1a1a2e);

  // Create a perspective camera
  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.z = 5;

  // Add a simple cube to verify Three.js is working
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshBasicMaterial({
    color: 0x4a90d9,
    wireframe: true,
  });
  const cube = new THREE.Mesh(geometry, material);
  scene.add(cube);

  // Create a simple GUI to verify lil-gui is working
  const gui = new GUI();
  const params = {
    rotationSpeed: 0.01,
    color: '#4a90d9',
  };
  gui.add(params, 'rotationSpeed', 0, 0.1).name('Rotation Speed');
  gui.addColor(params, 'color').name('Color').onChange((value: string) => {
    material.color.set(value);
  });

  // Handle window resize
  function onWindowResize(): void {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }
  window.addEventListener('resize', onWindowResize);

  // Animation loop
  function animate(): void {
    requestAnimationFrame(animate);

    // Rotate the cube
    cube.rotation.x += params.rotationSpeed;
    cube.rotation.y += params.rotationSpeed;

    renderer.render(scene, camera);
  }

  // Start the animation loop
  animate();

  // Log success message
  console.log('3D Animation Learning Foundation initialized successfully');
  console.log('Three.js version:', THREE.REVISION);
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', init);

// Export types to verify they're accessible
export type { DemoType, Demo, ParameterSchema };
