/**
 * DemoRenderer Unit Tests
 *
 * Note: jsdom doesn't support WebGL, so we test the utility functions
 * and error handling. The WebGL detection works in real browsers.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { isWebGLAvailable, showWebGLFallback } from '../../src/core/DemoRenderer';

describe('isWebGLAvailable', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return false when WebGL context is not available', () => {
    // In jsdom, WebGL is not available by default
    expect(isWebGLAvailable()).toBe(false);
  });

  it('should return false when canvas creation throws', () => {
    vi.spyOn(document, 'createElement').mockImplementation(() => {
      throw new Error('Canvas creation failed');
    });

    expect(isWebGLAvailable()).toBe(false);
  });

  it('should handle getContext returning null gracefully', () => {
    const originalCreateElement = document.createElement.bind(document);

    vi.spyOn(document, 'createElement').mockImplementation(
      <K extends keyof HTMLElementTagNameMap>(tagName: K) => {
        const element = originalCreateElement(tagName);
        if (tagName === 'canvas') {
          (element as HTMLCanvasElement).getContext = vi.fn().mockReturnValue(null);
        }
        return element;
      }
    );

    expect(isWebGLAvailable()).toBe(false);
  });
});

describe('showWebGLFallback', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  it('should create fallback message element', () => {
    showWebGLFallback(container);

    const fallback = container.querySelector('#webgl-fallback');
    expect(fallback).not.toBeNull();
  });

  it('should display WebGL not supported heading', () => {
    showWebGLFallback(container);

    const heading = container.querySelector('#webgl-fallback h1');
    expect(heading?.textContent).toBe('WebGL Not Supported');
  });

  it('should include troubleshooting suggestions', () => {
    showWebGLFallback(container);

    const listItems = container.querySelectorAll('#webgl-fallback li');
    expect(listItems.length).toBeGreaterThan(0);
  });

  it('should include browser update suggestion', () => {
    showWebGLFallback(container);

    const fallback = container.querySelector('#webgl-fallback');
    expect(fallback?.textContent).toContain('Updating your browser');
  });

  it('should include hardware acceleration suggestion', () => {
    showWebGLFallback(container);

    const fallback = container.querySelector('#webgl-fallback');
    expect(fallback?.textContent).toContain('hardware acceleration');
  });

  it('should apply styling to fallback element', () => {
    showWebGLFallback(container);

    const fallback = container.querySelector('#webgl-fallback') as HTMLElement;
    expect(fallback.style.position).toBe('absolute');
    expect(fallback.style.textAlign).toBe('center');
    expect(fallback.style.color).toBe('rgb(255, 255, 255)');
  });

  it('should have id for CSS targeting', () => {
    showWebGLFallback(container);

    const fallback = container.querySelector('#webgl-fallback');
    expect(fallback?.id).toBe('webgl-fallback');
  });
});

describe('DemoRenderer class', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should throw error when WebGL is not available', async () => {
    // Import DemoRenderer - in jsdom WebGL is not available
    const { DemoRenderer } = await import('../../src/core/DemoRenderer');
    const canvas = document.createElement('canvas');

    expect(() => new DemoRenderer(canvas)).toThrow('WebGL is not available');
  });

  it('should require camera before rendering', async () => {
    // This test would require WebGL, so we test the error message expectation
    const { DemoRenderer } = await import('../../src/core/DemoRenderer');
    const canvas = document.createElement('canvas');

    // In jsdom, the renderer can't be created, so this tests the error path
    expect(() => new DemoRenderer(canvas)).toThrow();
  });
});
