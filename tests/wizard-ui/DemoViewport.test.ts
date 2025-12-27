/**
 * DemoViewport Unit Tests
 *
 * Tests the demo viewport component for story-015:
 * - AC5: Demo viewport contains the 3D canvas
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  DemoViewport,
  getDemoViewportStyles,
  injectDemoViewportStyles,
} from '../../src/wizard-ui/DemoViewport';

describe('DemoViewport', () => {
  let container: HTMLElement;
  let viewport: DemoViewport;

  beforeEach(() => {
    container = document.createElement('div');
    container.id = 'test-container';
    document.body.appendChild(container);
  });

  afterEach(() => {
    if (viewport) {
      viewport.dispose();
    }
    document.body.removeChild(container);
  });

  describe('constructor', () => {
    it('should create viewport structure', () => {
      viewport = new DemoViewport(container);

      expect(container.querySelector('.demo-viewport')).toBeTruthy();
    });

    it('should create canvas container', () => {
      viewport = new DemoViewport(container);

      expect(container.querySelector('.demo-viewport-canvas-container')).toBeTruthy();
    });

    it('should create controls container', () => {
      viewport = new DemoViewport(container);

      expect(container.querySelector('.demo-viewport-controls')).toBeTruthy();
    });

    it('should create overlay container', () => {
      viewport = new DemoViewport(container);

      expect(container.querySelector('.demo-viewport-overlay')).toBeTruthy();
    });

    it('should inject styles automatically', () => {
      viewport = new DemoViewport(container);

      const styleElement = document.getElementById('demo-viewport-styles');
      expect(styleElement).toBeTruthy();
    });
  });

  describe('getDemoViewportStyles()', () => {
    it('should return viewport styles', () => {
      const styles = getDemoViewportStyles();

      expect(styles).toContain('.demo-viewport');
      expect(styles).toContain('position: relative');
      expect(styles).toContain('width: 100%');
      expect(styles).toContain('height: 100%');
    });

    it('should include canvas container styles', () => {
      const styles = getDemoViewportStyles();

      expect(styles).toContain('.demo-viewport-canvas-container');
    });
  });

  describe('attachCanvas() (AC5)', () => {
    it('should attach canvas to container', () => {
      viewport = new DemoViewport(container);
      const canvas = document.createElement('canvas');

      viewport.attachCanvas(canvas);

      expect(container.querySelector('canvas')).toBe(canvas);
    });

    it('should store reference to attached canvas', () => {
      viewport = new DemoViewport(container);
      const canvas = document.createElement('canvas');

      viewport.attachCanvas(canvas);

      expect(viewport.getCanvas()).toBe(canvas);
    });

    it('should replace existing canvas when attaching new one', () => {
      viewport = new DemoViewport(container);
      const canvas1 = document.createElement('canvas');
      const canvas2 = document.createElement('canvas');

      viewport.attachCanvas(canvas1);
      viewport.attachCanvas(canvas2);

      expect(viewport.getCanvas()).toBe(canvas2);
      expect(container.querySelectorAll('canvas').length).toBe(1);
    });
  });

  describe('detachCanvas()', () => {
    it('should remove canvas from container', () => {
      viewport = new DemoViewport(container);
      const canvas = document.createElement('canvas');

      viewport.attachCanvas(canvas);
      const detached = viewport.detachCanvas();

      expect(detached).toBe(canvas);
      expect(container.querySelector('canvas')).toBeNull();
    });

    it('should return null if no canvas attached', () => {
      viewport = new DemoViewport(container);

      const detached = viewport.detachCanvas();

      expect(detached).toBeNull();
    });

    it('should clear canvas reference', () => {
      viewport = new DemoViewport(container);
      const canvas = document.createElement('canvas');

      viewport.attachCanvas(canvas);
      viewport.detachCanvas();

      expect(viewport.getCanvas()).toBeNull();
    });
  });

  describe('getCanvasContainer()', () => {
    it('should return canvas container element', () => {
      viewport = new DemoViewport(container);

      const canvasContainer = viewport.getCanvasContainer();

      expect(canvasContainer.className).toBe('demo-viewport-canvas-container');
    });
  });

  describe('getControlsContainer()', () => {
    it('should return controls container element', () => {
      viewport = new DemoViewport(container);

      const controlsContainer = viewport.getControlsContainer();

      expect(controlsContainer.className).toBe('demo-viewport-controls');
    });
  });

  describe('getOverlayContainer()', () => {
    it('should return overlay container element', () => {
      viewport = new DemoViewport(container);

      const overlayContainer = viewport.getOverlayContainer();

      expect(overlayContainer.className).toBe('demo-viewport-overlay');
    });
  });

  describe('resize()', () => {
    it('should not throw when called', () => {
      viewport = new DemoViewport(container);

      expect(() => viewport.resize()).not.toThrow();
    });

    it('should trigger resize callbacks', () => {
      viewport = new DemoViewport(container);
      const callback = vi.fn();

      viewport.onResize(callback);
      viewport.resize();

      expect(callback).toHaveBeenCalled();
    });
  });

  describe('onResize()', () => {
    it('should register resize callback', () => {
      viewport = new DemoViewport(container);
      const callback = vi.fn();

      viewport.onResize(callback);
      viewport.resize();

      expect(callback).toHaveBeenCalledWith(expect.any(Number), expect.any(Number));
    });

    it('should support multiple callbacks', () => {
      viewport = new DemoViewport(container);
      const callback1 = vi.fn();
      const callback2 = vi.fn();

      viewport.onResize(callback1);
      viewport.onResize(callback2);
      viewport.resize();

      expect(callback1).toHaveBeenCalled();
      expect(callback2).toHaveBeenCalled();
    });
  });

  describe('offResize()', () => {
    it('should remove resize callback', () => {
      viewport = new DemoViewport(container);
      const callback = vi.fn();

      viewport.onResize(callback);
      viewport.offResize(callback);
      viewport.resize();

      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('getDimensions()', () => {
    it('should return width and height', () => {
      viewport = new DemoViewport(container);

      const dimensions = viewport.getDimensions();

      expect(dimensions).toHaveProperty('width');
      expect(dimensions).toHaveProperty('height');
      expect(typeof dimensions.width).toBe('number');
      expect(typeof dimensions.height).toBe('number');
    });
  });

  describe('showStatus() / hideStatus()', () => {
    it('should create and show status element', () => {
      viewport = new DemoViewport(container);

      viewport.showStatus('Loading...');

      const status = container.querySelector('.demo-viewport-status');
      expect(status).toBeTruthy();
      expect(status?.textContent).toBe('Loading...');
    });

    it('should update status message', () => {
      viewport = new DemoViewport(container);

      viewport.showStatus('Loading...');
      viewport.showStatus('Ready');

      const status = container.querySelector('.demo-viewport-status');
      expect(status?.textContent).toBe('Ready');
    });

    it('should hide status element', () => {
      viewport = new DemoViewport(container);

      viewport.showStatus('Loading...');
      viewport.hideStatus();

      const status = container.querySelector('.demo-viewport-status') as HTMLElement;
      expect(status?.style.display).toBe('none');
    });
  });

  describe('dispose()', () => {
    it('should remove viewport from container', () => {
      viewport = new DemoViewport(container);

      viewport.dispose();

      expect(container.querySelector('.demo-viewport')).toBeNull();
    });

    it('should clear resize callbacks', () => {
      viewport = new DemoViewport(container);
      const callback = vi.fn();

      viewport.onResize(callback);
      viewport.dispose();

      // Create new viewport and verify old callback not called
      const newViewport = new DemoViewport(container);
      newViewport.resize();

      expect(callback).not.toHaveBeenCalled();
      newViewport.dispose();
    });

    it('should clear canvas reference', () => {
      viewport = new DemoViewport(container);
      const canvas = document.createElement('canvas');

      viewport.attachCanvas(canvas);
      viewport.dispose();

      expect(viewport.getCanvas()).toBeNull();
    });
  });

  describe('injectDemoViewportStyles()', () => {
    it('should inject styles only once', () => {
      // First call happens in constructor
      viewport = new DemoViewport(container);

      // Call again
      injectDemoViewportStyles();

      const styleElements = document.querySelectorAll('#demo-viewport-styles');
      expect(styleElements.length).toBe(1);
    });
  });
});
