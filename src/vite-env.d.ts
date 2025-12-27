/// <reference types="vite/client" />

/**
 * Type declaration for Vite raw imports
 * Allows importing source files as strings using the ?raw suffix
 *
 * @example
 * import particleDemoSource from './demos/ParticleDemo.ts?raw';
 * // particleDemoSource is a string containing the file contents
 */
declare module '*?raw' {
  const content: string;
  export default content;
}
