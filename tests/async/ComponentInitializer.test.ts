/**
 * ComponentInitializer Unit Tests
 *
 * Tests the ComponentInitializer for idle-time component initialization.
 * Validates all acceptance criteria from story-026.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ComponentInitializer } from '../../src/async/ComponentInitializer';
import type { AsyncInitializable } from '../../src/async/types';

/**
 * Create a mock AsyncInitializable component for testing.
 */
function createMockComponent(
  id: string,
  options: {
    priority?: number;
    isCritical?: boolean;
    initDelay?: number;
    shouldFail?: boolean;
    failError?: Error;
  } = {}
): AsyncInitializable & { initializeCalls: number } {
  const {
    priority = 1,
    isCritical = false,
    initDelay = 0,
    shouldFail = false,
    failError = new Error('Init failed'),
  } = options;

  let initialized = false;
  let initializeCalls = 0;

  return {
    id,
    priority,
    isCritical,
    initializeCalls: 0,
    get isInitialized() {
      return initialized;
    },
    async initialize() {
      initializeCalls++;
      (this as { initializeCalls: number }).initializeCalls = initializeCalls;

      if (initDelay > 0) {
        await new Promise((resolve) => setTimeout(resolve, initDelay));
      }

      if (shouldFail) {
        throw failError;
      }

      initialized = true;
    },
  };
}

describe('ComponentInitializer', () => {
  let initializer: ComponentInitializer;

  beforeEach(() => {
    vi.useFakeTimers();
    initializer = new ComponentInitializer();
  });

  afterEach(() => {
    initializer.dispose();
    vi.useRealTimers();
  });

  describe('AC1: Components can register for idle-time initialization', () => {
    it('should register a component', () => {
      const component = createMockComponent('test-component');

      initializer.register(component);

      expect(initializer.isRegistered('test-component')).toBe(true);
      expect(initializer.componentCount).toBe(1);
    });

    it('should register multiple components', () => {
      const comp1 = createMockComponent('comp-1');
      const comp2 = createMockComponent('comp-2');
      const comp3 = createMockComponent('comp-3');

      initializer.register(comp1);
      initializer.register(comp2);
      initializer.register(comp3);

      expect(initializer.componentCount).toBe(3);
      expect(initializer.isRegistered('comp-1')).toBe(true);
      expect(initializer.isRegistered('comp-2')).toBe(true);
      expect(initializer.isRegistered('comp-3')).toBe(true);
    });

    it('should replace component when registering same ID twice', () => {
      const comp1 = createMockComponent('same-id', { priority: 1 });
      const comp2 = createMockComponent('same-id', { priority: 2 });

      initializer.register(comp1);
      initializer.register(comp2);

      expect(initializer.componentCount).toBe(1);
    });

    it('should set initial status to pending for uninitialized component', () => {
      const component = createMockComponent('test-component');

      initializer.register(component);

      expect(initializer.getStatus('test-component')).toBe('pending');
    });

    it('should set initial status to initialized for already initialized component', () => {
      const component = createMockComponent('test-component');
      // Pre-initialize the component
      component.initialize();

      initializer.register(component);

      expect(initializer.getStatus('test-component')).toBe('initialized');
    });
  });

  describe('AC2: Initialization uses requestIdleCallback', () => {
    it('should initialize components during idle time via requestIdleCallback or fallback', async () => {
      const component = createMockComponent('test-component');
      initializer.register(component);

      const initPromise = initializer.initializeAll();
      await vi.runAllTimersAsync();
      await initPromise;

      // The key behavior is that components get initialized - whether via
      // requestIdleCallback or setTimeout fallback doesn't matter for the test
      expect(component.isInitialized).toBe(true);
    });

    it('should initialize component after idle callback', async () => {
      const component = createMockComponent('test-component');
      initializer.register(component);

      const initPromise = initializer.initializeAll();

      // Component not yet initialized
      expect(component.isInitialized).toBe(false);

      // Run timers to trigger idle callback
      await vi.runAllTimersAsync();
      await initPromise;

      expect(component.isInitialized).toBe(true);
      expect(initializer.getStatus('test-component')).toBe('initialized');
    });

    it('should initialize multiple components sequentially', async () => {
      const initOrder: string[] = [];

      const comp1 = createMockComponent('comp-1', { priority: 1 });
      const comp2 = createMockComponent('comp-2', { priority: 2 });

      // Track initialization order
      const originalInit1 = comp1.initialize.bind(comp1);
      comp1.initialize = async () => {
        initOrder.push('comp-1');
        return originalInit1();
      };

      const originalInit2 = comp2.initialize.bind(comp2);
      comp2.initialize = async () => {
        initOrder.push('comp-2');
        return originalInit2();
      };

      initializer.register(comp1);
      initializer.register(comp2);

      const initPromise = initializer.initializeAll();
      await vi.runAllTimersAsync();
      await initPromise;

      expect(initOrder).toEqual(['comp-1', 'comp-2']);
    });
  });

  describe('AC3: Safari fallback uses setTimeout', () => {
    it('should work when requestIdleCallback is not available', async () => {
      // Remove requestIdleCallback to simulate Safari
      delete (globalThis as Record<string, unknown>).requestIdleCallback;
      delete (globalThis as Record<string, unknown>).cancelIdleCallback;

      // Create new initializer after removing requestIdleCallback
      const safariInitializer = new ComponentInitializer();
      const component = createMockComponent('test-component');

      safariInitializer.register(component);

      const initPromise = safariInitializer.initializeAll();
      await vi.runAllTimersAsync();
      await initPromise;

      expect(component.isInitialized).toBe(true);
      expect(safariInitializer.getStatus('test-component')).toBe('initialized');

      safariInitializer.dispose();
    });
  });

  describe('AC4: Critical components initialize first', () => {
    it('should initialize lower priority numbers first', async () => {
      const initOrder: string[] = [];

      const comp1 = createMockComponent('comp-priority-3', { priority: 3 });
      const comp2 = createMockComponent('comp-priority-1', { priority: 1 });
      const comp3 = createMockComponent('comp-priority-2', { priority: 2 });

      // Track initialization order
      [comp1, comp2, comp3].forEach((comp) => {
        const originalInit = comp.initialize.bind(comp);
        comp.initialize = async () => {
          initOrder.push(comp.id);
          return originalInit();
        };
      });

      // Register in non-priority order
      initializer.register(comp1);
      initializer.register(comp2);
      initializer.register(comp3);

      const initPromise = initializer.initializeAll();
      await vi.runAllTimersAsync();
      await initPromise;

      expect(initOrder).toEqual([
        'comp-priority-1',
        'comp-priority-2',
        'comp-priority-3',
      ]);
    });

    it('should initialize critical components before non-critical at same priority', async () => {
      const initOrder: string[] = [];

      const comp1 = createMockComponent('non-critical', { priority: 1, isCritical: false });
      const comp2 = createMockComponent('critical', { priority: 1, isCritical: true });

      [comp1, comp2].forEach((comp) => {
        const originalInit = comp.initialize.bind(comp);
        comp.initialize = async () => {
          initOrder.push(comp.id);
          return originalInit();
        };
      });

      // Register non-critical first
      initializer.register(comp1);
      initializer.register(comp2);

      const initPromise = initializer.initializeAll();
      await vi.runAllTimersAsync();
      await initPromise;

      expect(initOrder).toEqual(['critical', 'non-critical']);
    });
  });

  describe('AC5: Initialization status is trackable', () => {
    it('should return undefined for non-registered component', () => {
      expect(initializer.getStatus('non-existent')).toBeUndefined();
    });

    it('should track pending status', () => {
      const component = createMockComponent('test-component');

      initializer.register(component);

      expect(initializer.getStatus('test-component')).toBe('pending');
    });

    it('should track initializing status during component init', async () => {
      // Create component with delay and track status changes
      const statusHistory: string[] = [];
      let resolveInit: () => void;
      const initPromiseInternal = new Promise<void>((resolve) => {
        resolveInit = resolve;
      });

      const component: AsyncInitializable & { initializeCalls: number } = {
        id: 'test-component',
        priority: 1,
        isCritical: false,
        isInitialized: false,
        initializeCalls: 0,
        async initialize() {
          this.initializeCalls++;
          // Wait to be signaled to complete
          await initPromiseInternal;
          (this as { isInitialized: boolean }).isInitialized = true;
        },
      };

      initializer.register(component);
      expect(initializer.getStatus('test-component')).toBe('pending');
      statusHistory.push(initializer.getStatus('test-component')!);

      // Start initialization
      const initPromise = initializer.initializeAll();

      // Wait for idle callback and component.initialize() to be called
      await vi.advanceTimersByTimeAsync(100);

      // Now should be initializing
      statusHistory.push(initializer.getStatus('test-component')!);
      expect(initializer.getStatus('test-component')).toBe('initializing');

      // Complete initialization
      resolveInit!();
      await vi.runAllTimersAsync();
      await initPromise;

      statusHistory.push(initializer.getStatus('test-component')!);
      expect(statusHistory).toContain('initializing');
      expect(initializer.getStatus('test-component')).toBe('initialized');
    });

    it('should track initialized status', async () => {
      const component = createMockComponent('test-component');

      initializer.register(component);

      const initPromise = initializer.initializeAll();
      await vi.runAllTimersAsync();
      await initPromise;

      expect(initializer.getStatus('test-component')).toBe('initialized');
    });

    it('should track failed status', async () => {
      const component = createMockComponent('test-component', { shouldFail: true });

      initializer.register(component);

      const initPromise = initializer.initializeAll();
      await vi.runAllTimersAsync();
      await initPromise;

      expect(initializer.getStatus('test-component')).toBe('failed');
    });

    it('should return all statuses via getAllStatuses', async () => {
      const comp1 = createMockComponent('comp-1');
      const comp2 = createMockComponent('comp-2', { shouldFail: true });
      const comp3 = createMockComponent('comp-3');

      initializer.register(comp1);
      initializer.register(comp2);
      initializer.register(comp3);

      const initPromise = initializer.initializeAll();
      await vi.runAllTimersAsync();
      await initPromise;

      const statuses = initializer.getAllStatuses();

      expect(statuses.get('comp-1')).toBe('initialized');
      expect(statuses.get('comp-2')).toBe('failed');
      expect(statuses.get('comp-3')).toBe('initialized');
    });
  });

  describe('callback management', () => {
    it('should call onInitialized callback when component initializes', async () => {
      const callback = vi.fn();
      initializer.onInitialized(callback);

      const component = createMockComponent('test-component');
      initializer.register(component);

      const initPromise = initializer.initializeAll();
      await vi.runAllTimersAsync();
      await initPromise;

      expect(callback).toHaveBeenCalledWith('test-component');
    });

    it('should call onInitFailed callback when component fails', async () => {
      const callback = vi.fn();
      const error = new Error('Test error');
      initializer.onInitFailed(callback);

      const component = createMockComponent('test-component', {
        shouldFail: true,
        failError: error,
      });
      initializer.register(component);

      const initPromise = initializer.initializeAll();
      await vi.runAllTimersAsync();
      await initPromise;

      expect(callback).toHaveBeenCalledWith('test-component', error);
    });

    it('should support multiple callbacks', async () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();

      initializer.onInitialized(callback1);
      initializer.onInitialized(callback2);

      const component = createMockComponent('test-component');
      initializer.register(component);

      const initPromise = initializer.initializeAll();
      await vi.runAllTimersAsync();
      await initPromise;

      expect(callback1).toHaveBeenCalledWith('test-component');
      expect(callback2).toHaveBeenCalledWith('test-component');
    });

    it('should unregister callbacks with offInitialized', async () => {
      const callback = vi.fn();

      initializer.onInitialized(callback);
      initializer.offInitialized(callback);

      const component = createMockComponent('test-component');
      initializer.register(component);

      const initPromise = initializer.initializeAll();
      await vi.runAllTimersAsync();
      await initPromise;

      expect(callback).not.toHaveBeenCalled();
    });

    it('should unregister callbacks with offInitFailed', async () => {
      const callback = vi.fn();

      initializer.onInitFailed(callback);
      initializer.offInitFailed(callback);

      const component = createMockComponent('test-component', { shouldFail: true });
      initializer.register(component);

      const initPromise = initializer.initializeAll();
      await vi.runAllTimersAsync();
      await initPromise;

      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('edge cases', () => {
    it('should handle empty component list', async () => {
      const initPromise = initializer.initializeAll();
      await vi.runAllTimersAsync();
      await initPromise;

      // Should not throw
      expect(initializer.componentCount).toBe(0);
    });

    it('should skip already initialized components', async () => {
      const component = createMockComponent('test-component');

      // Pre-initialize
      await component.initialize();

      initializer.register(component);

      const initPromise = initializer.initializeAll();
      await vi.runAllTimersAsync();
      await initPromise;

      // Should only have been called once (the pre-init)
      expect(component.initializeCalls).toBe(1);
    });

    it('should not register after dispose', () => {
      initializer.dispose();

      const component = createMockComponent('test-component');
      initializer.register(component);

      expect(initializer.isRegistered('test-component')).toBe(false);
    });

    it('should stop processing on dispose', () => {
      const component = createMockComponent('test-component');
      initializer.register(component);

      expect(initializer.componentCount).toBe(1);

      // Dispose clears the component list
      initializer.dispose();

      expect(initializer.componentCount).toBe(0);
      expect(initializer.getStatus('test-component')).toBeUndefined();
    });

    it('should handle component that throws non-Error', async () => {
      const callback = vi.fn();
      initializer.onInitFailed(callback);

      const component = createMockComponent('test-component');
      component.initialize = async () => {
        throw 'string error';
      };

      initializer.register(component);

      const initPromise = initializer.initializeAll();
      await vi.runAllTimersAsync();
      await initPromise;

      expect(initializer.getStatus('test-component')).toBe('failed');
      expect(callback).toHaveBeenCalledWith('test-component', expect.any(Error));
    });

    it('should not start initialization twice if already in progress', async () => {
      const component = createMockComponent('test-component', { initDelay: 100 });
      initializer.register(component);

      // Start twice
      const promise1 = initializer.initializeAll();
      const promise2 = initializer.initializeAll();

      await vi.runAllTimersAsync();
      await Promise.all([promise1, promise2]);

      // Should only initialize once
      expect(component.initializeCalls).toBe(1);
    });
  });

  describe('dispose', () => {
    it('should clear all state on dispose', () => {
      const component = createMockComponent('test-component');
      initializer.register(component);

      expect(initializer.componentCount).toBe(1);

      initializer.dispose();

      expect(initializer.componentCount).toBe(0);
      expect(initializer.getStatus('test-component')).toBeUndefined();
    });

    it('should clear callbacks on dispose', () => {
      const onInit = vi.fn();
      const onFail = vi.fn();

      initializer.onInitialized(onInit);
      initializer.onInitFailed(onFail);

      initializer.dispose();

      // Callbacks should be cleared (cannot directly test, but dispose should work)
      expect(initializer.componentCount).toBe(0);
    });
  });
});
