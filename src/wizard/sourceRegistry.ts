/**
 * Source Registry
 *
 * Bundles demo source files as strings for code snippet extraction.
 * Uses Vite's ?raw import to include actual source code at build time.
 *
 * @see ADR-002 (Bundled Source Code for Snippet Extraction)
 * @see FR-002 (Code Snippet Display)
 */

// Import demo source files as raw strings
// Vite handles ?raw imports natively
import particleDemoSource from '../demos/ParticleDemo.ts?raw';
import objectDemoSource from '../demos/ObjectDemo.ts?raw';
import fluidDemoSource from '../demos/FluidDemo.ts?raw';
import combinedDemoSource from '../demos/CombinedDemo.ts?raw';

/**
 * Registry mapping file paths to their raw source content.
 * Keys are relative paths from src/ (matching CodeSnippetRef.sourceFile).
 */
export const sourceRegistry = new Map<string, string>([
  ['demos/ParticleDemo.ts', particleDemoSource],
  ['demos/ObjectDemo.ts', objectDemoSource],
  ['demos/FluidDemo.ts', fluidDemoSource],
  ['demos/CombinedDemo.ts', combinedDemoSource],
]);

/**
 * Gets the raw source content for a file.
 *
 * @param sourceFile - Relative path from src/ (e.g., 'demos/ParticleDemo.ts')
 * @returns The raw source content, or undefined if not found
 */
export function getSourceContent(sourceFile: string): string | undefined {
  return sourceRegistry.get(sourceFile);
}

/**
 * Checks if a source file is available in the registry.
 *
 * @param sourceFile - Relative path from src/
 * @returns True if the file is registered
 */
export function hasSourceFile(sourceFile: string): boolean {
  return sourceRegistry.has(sourceFile);
}

/**
 * Gets all registered source file paths.
 *
 * @returns Array of registered file paths
 */
export function getRegisteredFiles(): string[] {
  return Array.from(sourceRegistry.keys());
}
