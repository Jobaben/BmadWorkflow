/**
 * Core Module - Foundation Layer Exports
 *
 * Exports the core rendering, scene management, and animation classes.
 */

export { DemoRenderer, isWebGLAvailable, showWebGLFallback } from './DemoRenderer';
export { SceneManager } from './SceneManager';
export { AnimationLoop, type FrameCallback } from './AnimationLoop';
export { FPSMonitor } from './FPSMonitor';
