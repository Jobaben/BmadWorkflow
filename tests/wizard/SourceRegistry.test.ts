/**
 * Source Registry Unit Tests
 *
 * Tests the sourceRegistry implementation against story-014 acceptance criteria:
 * - AC1: Source files are bundled and extractable
 *
 * @see story-014.md Test Task 1
 */

import { describe, it, expect } from 'vitest';
import {
  sourceRegistry,
  getSourceContent,
  hasSourceFile,
  getRegisteredFiles,
} from '../../src/wizard/sourceRegistry';

describe('Source Registry', () => {
  describe('AC1: Source files are bundled and extractable', () => {
    it('should have ParticleDemo.ts registered', () => {
      expect(hasSourceFile('demos/ParticleDemo.ts')).toBe(true);
    });

    it('should have ObjectDemo.ts registered', () => {
      expect(hasSourceFile('demos/ObjectDemo.ts')).toBe(true);
    });

    it('should have FluidDemo.ts registered', () => {
      expect(hasSourceFile('demos/FluidDemo.ts')).toBe(true);
    });

    it('should have CombinedDemo.ts registered', () => {
      expect(hasSourceFile('demos/CombinedDemo.ts')).toBe(true);
    });

    it('should return actual source content for ParticleDemo', () => {
      const content = getSourceContent('demos/ParticleDemo.ts');

      expect(content).toBeDefined();
      expect(typeof content).toBe('string');
      expect(content!.length).toBeGreaterThan(0);
      // Verify it contains expected code markers
      expect(content).toContain('ParticleDemo');
      expect(content).toContain('class');
      expect(content).toContain('export');
    });

    it('should return actual source content for ObjectDemo', () => {
      const content = getSourceContent('demos/ObjectDemo.ts');

      expect(content).toBeDefined();
      expect(content).toContain('ObjectDemo');
    });

    it('should return actual source content for FluidDemo', () => {
      const content = getSourceContent('demos/FluidDemo.ts');

      expect(content).toBeDefined();
      expect(content).toContain('FluidDemo');
    });

    it('should return actual source content for CombinedDemo', () => {
      const content = getSourceContent('demos/CombinedDemo.ts');

      expect(content).toBeDefined();
      expect(content).toContain('CombinedDemo');
    });
  });

  describe('getSourceContent()', () => {
    it('should return undefined for unregistered file', () => {
      const content = getSourceContent('nonexistent/file.ts');
      expect(content).toBeUndefined();
    });

    it('should return undefined for empty path', () => {
      const content = getSourceContent('');
      expect(content).toBeUndefined();
    });
  });

  describe('hasSourceFile()', () => {
    it('should return true for registered files', () => {
      const files = getRegisteredFiles();
      for (const file of files) {
        expect(hasSourceFile(file)).toBe(true);
      }
    });

    it('should return false for unregistered files', () => {
      expect(hasSourceFile('not/a/real/file.ts')).toBe(false);
    });
  });

  describe('getRegisteredFiles()', () => {
    it('should return all registered file paths', () => {
      const files = getRegisteredFiles();

      expect(files).toContain('demos/ParticleDemo.ts');
      expect(files).toContain('demos/ObjectDemo.ts');
      expect(files).toContain('demos/FluidDemo.ts');
      expect(files).toContain('demos/CombinedDemo.ts');
    });

    it('should have at least 4 registered files', () => {
      const files = getRegisteredFiles();
      expect(files.length).toBeGreaterThanOrEqual(4);
    });
  });

  describe('sourceRegistry Map', () => {
    it('should be a Map instance', () => {
      expect(sourceRegistry).toBeInstanceOf(Map);
    });

    it('should have string keys and values', () => {
      for (const [key, value] of sourceRegistry) {
        expect(typeof key).toBe('string');
        expect(typeof value).toBe('string');
      }
    });
  });
});
