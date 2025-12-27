/**
 * Source Registry
 *
 * Provides access to bundled source files for the Code Snippet Engine.
 * Source files are imported as raw strings using Vite's ?raw suffix.
 *
 * @see ADR-002 (Bundled Source Code for Snippet Extraction)
 * @see FR-002 (Code Snippet Display)
 */

// Import demo source files as raw strings
import particleDemoSource from '../demos/ParticleDemo.ts?raw';
import objectDemoSource from '../demos/ObjectDemo.ts?raw';
import fluidDemoSource from '../demos/FluidDemo.ts?raw';
import combinedDemoSource from '../demos/CombinedDemo.ts?raw';

/**
 * Registry mapping source file paths to their raw content.
 * File paths are relative from src/ directory.
 */
export const sourceRegistry: Map<string, string> = new Map([
  ['demos/ParticleDemo.ts', particleDemoSource],
  ['demos/ObjectDemo.ts', objectDemoSource],
  ['demos/FluidDemo.ts', fluidDemoSource],
  ['demos/CombinedDemo.ts', combinedDemoSource],
]);

/**
 * Get the raw source content for a given file path.
 *
 * @param filePath - Relative path from src/ (e.g., 'demos/ParticleDemo.ts')
 * @returns The raw source content, or undefined if not found
 */
export function getSourceFile(filePath: string): string | undefined {
  return sourceRegistry.get(filePath);
}

/**
 * Check if a source file exists in the registry.
 *
 * @param filePath - Relative path from src/
 * @returns true if the file exists in the registry
 */
export function hasSourceFile(filePath: string): boolean {
  return sourceRegistry.has(filePath);
}

/**
 * Get all available source file paths.
 *
 * @returns Array of all registered source file paths
 */
export function getAvailableSourceFiles(): string[] {
  return Array.from(sourceRegistry.keys());
}
