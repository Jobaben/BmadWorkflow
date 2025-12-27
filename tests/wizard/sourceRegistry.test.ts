/**
 * Source Registry Unit Tests
 *
 * Tests the source file registry for story-014:
 * - AC1: Source files are bundled and extractable
 */

import { describe, it, expect } from 'vitest';
import {
  sourceRegistry,
  getSourceFile,
  hasSourceFile,
  getAvailableSourceFiles,
} from '../../src/wizard/sourceRegistry';

describe('sourceRegistry', () => {
  describe('sourceRegistry Map', () => {
    it('should contain ParticleDemo.ts', () => {
      expect(sourceRegistry.has('demos/ParticleDemo.ts')).toBe(true);
    });

    it('should contain ObjectDemo.ts', () => {
      expect(sourceRegistry.has('demos/ObjectDemo.ts')).toBe(true);
    });

    it('should contain FluidDemo.ts', () => {
      expect(sourceRegistry.has('demos/FluidDemo.ts')).toBe(true);
    });

    it('should contain CombinedDemo.ts', () => {
      expect(sourceRegistry.has('demos/CombinedDemo.ts')).toBe(true);
    });

    it('should contain actual source code content', () => {
      const particleSource = sourceRegistry.get('demos/ParticleDemo.ts');
      expect(particleSource).toBeDefined();
      expect(particleSource).toContain('class ParticleDemo');
    });
  });

  describe('getSourceFile()', () => {
    it('should return source content for existing file', () => {
      const source = getSourceFile('demos/ParticleDemo.ts');
      expect(source).toBeDefined();
      expect(typeof source).toBe('string');
      expect(source!.length).toBeGreaterThan(0);
    });

    it('should return undefined for non-existing file', () => {
      const source = getSourceFile('nonexistent/file.ts');
      expect(source).toBeUndefined();
    });

    it('should return actual TypeScript code', () => {
      const source = getSourceFile('demos/ParticleDemo.ts');
      expect(source).toContain('import');
      expect(source).toContain('export class ParticleDemo');
    });
  });

  describe('hasSourceFile()', () => {
    it('should return true for existing files', () => {
      expect(hasSourceFile('demos/ParticleDemo.ts')).toBe(true);
      expect(hasSourceFile('demos/ObjectDemo.ts')).toBe(true);
    });

    it('should return false for non-existing files', () => {
      expect(hasSourceFile('demos/FakeDemo.ts')).toBe(false);
      expect(hasSourceFile('other/file.ts')).toBe(false);
    });
  });

  describe('getAvailableSourceFiles()', () => {
    it('should return array of file paths', () => {
      const files = getAvailableSourceFiles();
      expect(Array.isArray(files)).toBe(true);
      expect(files.length).toBeGreaterThan(0);
    });

    it('should include all demo files', () => {
      const files = getAvailableSourceFiles();
      expect(files).toContain('demos/ParticleDemo.ts');
      expect(files).toContain('demos/ObjectDemo.ts');
      expect(files).toContain('demos/FluidDemo.ts');
      expect(files).toContain('demos/CombinedDemo.ts');
    });

    it('should return expected number of files', () => {
      const files = getAvailableSourceFiles();
      expect(files).toHaveLength(4);
    });
  });

  describe('Source Content Verification', () => {
    it('should have ParticleDemo with particle-related code', () => {
      const source = getSourceFile('demos/ParticleDemo.ts');
      expect(source).toContain('emissionRate');
      expect(source).toContain('particle');
    });

    it('should have ObjectDemo with object-related code', () => {
      const source = getSourceFile('demos/ObjectDemo.ts');
      expect(source).toBeDefined();
      expect(source!.length).toBeGreaterThan(100);
    });

    it('should have FluidDemo with fluid-related code', () => {
      const source = getSourceFile('demos/FluidDemo.ts');
      expect(source).toBeDefined();
      expect(source!.length).toBeGreaterThan(100);
    });

    it('should have CombinedDemo with combined functionality', () => {
      const source = getSourceFile('demos/CombinedDemo.ts');
      expect(source).toBeDefined();
      expect(source!.length).toBeGreaterThan(100);
    });
  });
});
