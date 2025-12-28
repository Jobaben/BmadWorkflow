/**
 * Test Setup
 *
 * Provides polyfills and mocks for the jsdom test environment.
 * These are required for testing browser-specific APIs.
 */

import { vi, beforeEach } from 'vitest';

/**
 * Reset injected style flags between tests by clearing style elements
 */
beforeEach(() => {
  // Guard against non-DOM environments
  if (typeof document === 'undefined') {
    return;
  }

  // Remove any injected style elements from previous tests
  const styleIds = [
    'wizard-layout-styles',
    'demo-viewport-styles',
    'learning-panel-styles',
    'code-display-styles',
    'parameter-control-styles',
    'wizard-navigator-styles',
  ];

  for (const id of styleIds) {
    const existing = document.getElementById(id);
    if (existing) {
      existing.remove();
    }
  }
});

/**
 * Mock ResizeObserver for jsdom environment
 * ResizeObserver is not implemented in jsdom
 */
class MockResizeObserver {
  callback: ResizeObserverCallback;

  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
  }

  observe(_target: Element): void {
    // No-op in tests
  }

  unobserve(_target: Element): void {
    // No-op in tests
  }

  disconnect(): void {
    // No-op in tests
  }
}

// Install the mock globally
global.ResizeObserver = MockResizeObserver as unknown as typeof ResizeObserver;

/**
 * Mock matchMedia for jsdom environment
 */
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

/**
 * Mock requestAnimationFrame for jsdom environment
 */
if (typeof window.requestAnimationFrame === 'undefined') {
  window.requestAnimationFrame = (callback: FrameRequestCallback): number => {
    return setTimeout(() => callback(performance.now()), 16) as unknown as number;
  };
}

if (typeof window.cancelAnimationFrame === 'undefined') {
  window.cancelAnimationFrame = (handle: number): void => {
    clearTimeout(handle);
  };
}
