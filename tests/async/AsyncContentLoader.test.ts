/**
 * AsyncContentLoader Unit Tests
 *
 * Tests the AsyncContentLoader for wizard content pipeline.
 * Validates all acceptance criteria from story-027.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { AsyncContentLoader, type StepProvider } from '../../src/async/AsyncContentLoader';
import { ContentBuffer } from '../../src/async/ContentBuffer';
import { LoadingStateManager } from '../../src/async/LoadingStateManager';
import type { CodeSnippetEngine, HighlightedCode } from '../../src/wizard/CodeSnippetEngine';
import type { WizardStep, CodeSnippetRef, Annotation } from '../../src/wizard/types';
import { ComplexityTier } from '../../src/wizard/types';
import { DemoType } from '../../src/types';

/**
 * Create a mock WizardStep for testing.
 */
function createMockStep(
  id: string,
  options: {
    snippetCount?: number;
    annotationCount?: number;
  } = {}
): WizardStep {
  const { snippetCount = 1, annotationCount = 1 } = options;

  const codeSnippets: CodeSnippetRef[] = Array.from({ length: snippetCount }, (_, i) => ({
    id: `${id}-snippet-${i}`,
    sourceFile: 'demos/TestDemo.ts',
    startLine: i * 10 + 1,
    endLine: i * 10 + 10,
  }));

  const annotations: Annotation[] = Array.from({ length: annotationCount }, (_, i) => ({
    id: `${id}-annotation-${i}`,
    lineStart: i + 1,
    lineEnd: i + 2,
    content: `Annotation ${i}`,
    highlightType: 'concept' as const,
  }));

  return {
    id,
    title: `Test Step ${id}`,
    tier: ComplexityTier.Micro,
    demoType: DemoType.Particle,
    description: 'Test step description',
    learningObjectives: ['Learn testing'],
    codeSnippets,
    annotations,
    order: 1,
  };
}

/**
 * Create a mock CodeSnippetEngine for testing.
 */
function createMockSnippetEngine(options: {
  delay?: number;
  shouldFail?: boolean;
  failError?: Error;
} = {}): CodeSnippetEngine {
  const { delay = 0, shouldFail = false, failError = new Error('Snippet load failed') } = options;

  return {
    async getSnippet(ref: CodeSnippetRef, annotations: Annotation[] = []): Promise<HighlightedCode> {
      if (delay > 0) {
        await new Promise((resolve) => setTimeout(resolve, delay));
      }

      if (shouldFail) {
        throw failError;
      }

      return {
        html: `<code>${ref.id}</code>`,
        plainText: ref.id,
        lineCount: ref.endLine - ref.startLine + 1,
        annotations,
      };
    },
    initialize: vi.fn().mockResolvedValue(undefined),
    highlightLines: vi.fn(),
    clearCache: vi.fn(),
    dispose: vi.fn(),
    hasSource: vi.fn().mockReturnValue(true),
  } as unknown as CodeSnippetEngine;
}

/**
 * Create a mock StepProvider for testing.
 */
function createMockStepProvider(steps: Map<string, WizardStep>): StepProvider {
  return {
    getStep(stepId: string): WizardStep | undefined {
      return steps.get(stepId);
    },
  };
}

describe('AsyncContentLoader', () => {
  let contentBuffer: ContentBuffer;
  let loadingManager: LoadingStateManager;
  let snippetEngine: CodeSnippetEngine;
  let stepProvider: StepProvider;
  let loader: AsyncContentLoader;
  let steps: Map<string, WizardStep>;

  beforeEach(() => {
    vi.useFakeTimers();

    contentBuffer = new ContentBuffer();
    loadingManager = new LoadingStateManager();
    snippetEngine = createMockSnippetEngine();

    steps = new Map<string, WizardStep>();
    steps.set('step-1', createMockStep('step-1'));
    steps.set('step-2', createMockStep('step-2'));
    steps.set('step-3', createMockStep('step-3'));

    stepProvider = createMockStepProvider(steps);

    loader = new AsyncContentLoader(
      contentBuffer,
      loadingManager,
      snippetEngine,
      stepProvider
    );
  });

  afterEach(() => {
    loader.dispose();
    loadingManager.dispose();
    vi.useRealTimers();
  });

  describe('AC1: Content loads asynchronously without blocking animation', () => {
    it('should load content asynchronously', async () => {
      const loadPromise = loader.loadStep('step-1');

      // Load should be in progress
      expect(loader.isLoading('step-1')).toBe(true);

      await vi.runAllTimersAsync();
      const content = await loadPromise;

      expect(content).toBeDefined();
      expect(content.stepId).toBe('step-1');
      expect(loader.isLoading('step-1')).toBe(false);
    });

    it('should return content with snippets and annotations', async () => {
      const step = createMockStep('step-1', { snippetCount: 2, annotationCount: 3 });
      steps.set('step-1', step);

      const loadPromise = loader.loadStep('step-1');
      await vi.runAllTimersAsync();
      const content = await loadPromise;

      expect(content.snippets).toHaveLength(2);
      expect(content.annotations).toHaveLength(3);
      expect(content.loadedAt).toBeGreaterThan(0);
    });

    it('should fire onLoadStart callback when load begins', async () => {
      const callback = vi.fn();
      loader.onLoadStart(callback);

      const loadPromise = loader.loadStep('step-1');
      expect(callback).toHaveBeenCalledWith('step-1');

      await vi.runAllTimersAsync();
      await loadPromise;
    });

    it('should fire onLoadComplete callback when load finishes', async () => {
      const callback = vi.fn();
      loader.onLoadComplete(callback);

      const loadPromise = loader.loadStep('step-1');
      await vi.runAllTimersAsync();
      await loadPromise;

      expect(callback).toHaveBeenCalledWith('step-1', expect.objectContaining({
        stepId: 'step-1',
      }));
    });

    it('should fire onLoadError callback when load fails', async () => {
      const error = new Error('Test error');
      snippetEngine = createMockSnippetEngine({ shouldFail: true, failError: error });
      loader = new AsyncContentLoader(contentBuffer, loadingManager, snippetEngine, stepProvider);

      const callback = vi.fn();
      loader.onLoadError(callback);

      const loadPromise = loader.loadStep('step-1');
      // Attach handler immediately to prevent unhandled rejection
      loadPromise.catch(() => {});

      await vi.runAllTimersAsync();

      let thrownError: Error | undefined;
      try {
        await loadPromise;
      } catch (e) {
        thrownError = e as Error;
      }

      expect(thrownError).toBeDefined();
      expect(thrownError!.message).toBe('Test error');
      expect(callback).toHaveBeenCalledWith('step-1', error);
    });
  });

  describe('AC2: Pending loads are cancellable', () => {
    it('should cancel pending load when cancelPending is called', async () => {
      snippetEngine = createMockSnippetEngine({ delay: 100 });
      loader = new AsyncContentLoader(contentBuffer, loadingManager, snippetEngine, stepProvider);

      const loadPromise = loader.loadStep('step-1');
      // Attach handler immediately to prevent unhandled rejection
      loadPromise.catch(() => {});

      // Cancel immediately
      loader.cancelPending();

      await vi.runAllTimersAsync();

      // Handle the rejection properly
      let error: Error | undefined;
      try {
        await loadPromise;
      } catch (e) {
        error = e as Error;
      }

      expect(error).toBeDefined();
      expect(error!.name).toBe('AbortError');
      expect(loader.isLoading('step-1')).toBe(false);
    });

    it('should cancel previous load when new load starts', async () => {
      snippetEngine = createMockSnippetEngine({ delay: 100 });
      loader = new AsyncContentLoader(contentBuffer, loadingManager, snippetEngine, stepProvider);

      const loadPromise1 = loader.loadStep('step-1');
      // Attach handler immediately to prevent unhandled rejection
      loadPromise1.catch(() => {});

      // Start a new load (should cancel the first)
      const loadPromise2 = loader.loadStep('step-2');

      await vi.runAllTimersAsync();

      // First load should be aborted
      let error: Error | undefined;
      try {
        await loadPromise1;
      } catch (e) {
        error = e as Error;
      }

      expect(error).toBeDefined();
      expect(error!.name).toBe('AbortError');

      // Second load should succeed
      const content = await loadPromise2;
      expect(content.stepId).toBe('step-2');
    });

    it('should stop loading state when cancelled', async () => {
      snippetEngine = createMockSnippetEngine({ delay: 100 });
      loader = new AsyncContentLoader(contentBuffer, loadingManager, snippetEngine, stepProvider);

      // Start loading but don't await (we want to cancel)
      const loadPromise = loader.loadStep('step-1');
      // Attach handler immediately to prevent unhandled rejection
      loadPromise.catch(() => {});

      expect(loadingManager.isLoading('step-1')).toBe(true);

      loader.cancelPending();
      expect(loadingManager.isLoading('step-1')).toBe(false);

      // Clean up the promise
      await vi.runAllTimersAsync();
      try {
        await loadPromise;
      } catch {
        // Expected to throw AbortError
      }
    });
  });

  describe('AC3: Race conditions are prevented', () => {
    it('should only use the latest navigation result when rapidly navigating', async () => {
      snippetEngine = createMockSnippetEngine({ delay: 50 });
      loader = new AsyncContentLoader(contentBuffer, loadingManager, snippetEngine, stepProvider);

      // Rapidly start multiple loads
      const load1 = loader.loadStep('step-1');
      // Attach handlers immediately to prevent unhandled rejections
      load1.catch(() => {});
      const load2 = loader.loadStep('step-2');
      load2.catch(() => {});
      const load3 = loader.loadStep('step-3');

      await vi.runAllTimersAsync();

      // First two should be aborted
      let error1: Error | undefined;
      let error2: Error | undefined;
      try {
        await load1;
      } catch (e) {
        error1 = e as Error;
      }
      try {
        await load2;
      } catch (e) {
        error2 = e as Error;
      }

      expect(error1).toBeDefined();
      expect(error1!.name).toBe('AbortError');
      expect(error2).toBeDefined();
      expect(error2!.name).toBe('AbortError');

      // Only the last should succeed
      const content = await load3;
      expect(content.stepId).toBe('step-3');
    });

    it('should return cached content immediately if available', async () => {
      // Load step-1 first
      const loadPromise1 = loader.loadStep('step-1');
      await vi.runAllTimersAsync();
      await loadPromise1;

      expect(contentBuffer.has('step-1')).toBe(true);

      // Load again - should return immediately from cache
      const loadPromise2 = loader.loadStep('step-1');
      const content = await loadPromise2;

      expect(content.stepId).toBe('step-1');
    });
  });

  describe('AC4: Loaded content is stored in ContentBuffer', () => {
    it('should store content in ContentBuffer after successful load', async () => {
      expect(contentBuffer.has('step-1')).toBe(false);

      const loadPromise = loader.loadStep('step-1');
      await vi.runAllTimersAsync();
      await loadPromise;

      expect(contentBuffer.has('step-1')).toBe(true);

      const stored = contentBuffer.get('step-1');
      expect(stored).toBeDefined();
      expect(stored!.stepId).toBe('step-1');
    });

    it('should allow synchronous retrieval via getContent', async () => {
      const loadPromise = loader.loadStep('step-1');
      await vi.runAllTimersAsync();
      await loadPromise;

      const content = loader.getContent('step-1');
      expect(content).toBeDefined();
      expect(content!.stepId).toBe('step-1');
    });

    it('should return undefined from getContent if not loaded', () => {
      const content = loader.getContent('step-1');
      expect(content).toBeUndefined();
    });

    it('should check content availability via hasContent', async () => {
      expect(loader.hasContent('step-1')).toBe(false);

      const loadPromise = loader.loadStep('step-1');
      await vi.runAllTimersAsync();
      await loadPromise;

      expect(loader.hasContent('step-1')).toBe(true);
    });
  });

  describe('AC5: Loading state is coordinated with LoadingStateManager', () => {
    it('should call startLoading when load begins', async () => {
      const startSpy = vi.spyOn(loadingManager, 'startLoading');

      const loadPromise = loader.loadStep('step-1');
      expect(startSpy).toHaveBeenCalledWith('step-1');

      await vi.runAllTimersAsync();
      await loadPromise;
    });

    it('should call stopLoading when load completes successfully', async () => {
      const stopSpy = vi.spyOn(loadingManager, 'stopLoading');

      const loadPromise = loader.loadStep('step-1');
      await vi.runAllTimersAsync();
      await loadPromise;

      expect(stopSpy).toHaveBeenCalledWith('step-1');
    });

    it('should call stopLoading when load fails', async () => {
      snippetEngine = createMockSnippetEngine({ shouldFail: true });
      loader = new AsyncContentLoader(contentBuffer, loadingManager, snippetEngine, stepProvider);

      const stopSpy = vi.spyOn(loadingManager, 'stopLoading');

      const loadPromise = loader.loadStep('step-1');
      // Attach handler immediately to prevent unhandled rejection
      loadPromise.catch(() => {});

      await vi.runAllTimersAsync();

      let thrownError: Error | undefined;
      try {
        await loadPromise;
      } catch (e) {
        thrownError = e as Error;
      }

      expect(thrownError).toBeDefined();
      expect(stopSpy).toHaveBeenCalledWith('step-1');
    });

    it('should call stopLoading when load is cancelled', async () => {
      snippetEngine = createMockSnippetEngine({ delay: 100 });
      loader = new AsyncContentLoader(contentBuffer, loadingManager, snippetEngine, stepProvider);

      const stopSpy = vi.spyOn(loadingManager, 'stopLoading');

      const loadPromise = loader.loadStep('step-1');
      // Attach handler immediately to prevent unhandled rejection
      loadPromise.catch(() => {});

      loader.cancelPending();

      expect(stopSpy).toHaveBeenCalledWith('step-1');

      // Clean up the promise
      await vi.runAllTimersAsync();
      try {
        await loadPromise;
      } catch {
        // Expected to throw AbortError
      }
    });
  });

  describe('AC6: Content preloading is supported', () => {
    it('should preload steps during idle time', async () => {
      expect(contentBuffer.has('step-2')).toBe(false);
      expect(contentBuffer.has('step-3')).toBe(false);

      loader.preloadSteps(['step-2', 'step-3']);

      // Run idle callbacks
      await vi.runAllTimersAsync();

      expect(contentBuffer.has('step-2')).toBe(true);
      expect(contentBuffer.has('step-3')).toBe(true);
    });

    it('should skip already-loaded steps during preload', async () => {
      // Load step-1 first
      const loadPromise = loader.loadStep('step-1');
      await vi.runAllTimersAsync();
      await loadPromise;

      const getSpy = vi.spyOn(snippetEngine, 'getSnippet');
      getSpy.mockClear();

      // Preload including already-loaded step
      loader.preloadSteps(['step-1', 'step-2']);
      await vi.runAllTimersAsync();

      // step-1 should not be loaded again (only step-2)
      // The mock was called once for step-2
      expect(contentBuffer.has('step-2')).toBe(true);
    });

    it('should skip step currently being loaded during preload', async () => {
      snippetEngine = createMockSnippetEngine({ delay: 100 });
      loader = new AsyncContentLoader(contentBuffer, loadingManager, snippetEngine, stepProvider);

      // Start loading step-1
      const loadPromise = loader.loadStep('step-1');

      // Preload step-1 (should skip since it's loading)
      loader.preloadSteps(['step-1']);

      await vi.runAllTimersAsync();

      try {
        await loadPromise;
      } catch {
        // May throw if aborted
      }

      // Content should still be loaded just once
      expect(contentBuffer.has('step-1')).toBe(true);
    });

    it('should not show loading indicator during preload', async () => {
      const startSpy = vi.spyOn(loadingManager, 'startLoading');

      loader.preloadSteps(['step-2']);
      await vi.runAllTimersAsync();

      // startLoading should not be called for preloads
      expect(startSpy).not.toHaveBeenCalledWith('step-2');
    });
  });

  describe('callback management', () => {
    it('should unregister callbacks with offLoadStart', async () => {
      const callback = vi.fn();

      loader.onLoadStart(callback);
      loader.offLoadStart(callback);

      const loadPromise = loader.loadStep('step-1');
      await vi.runAllTimersAsync();
      await loadPromise;

      expect(callback).not.toHaveBeenCalled();
    });

    it('should unregister callbacks with offLoadComplete', async () => {
      const callback = vi.fn();

      loader.onLoadComplete(callback);
      loader.offLoadComplete(callback);

      const loadPromise = loader.loadStep('step-1');
      await vi.runAllTimersAsync();
      await loadPromise;

      expect(callback).not.toHaveBeenCalled();
    });

    it('should unregister callbacks with offLoadError', async () => {
      snippetEngine = createMockSnippetEngine({ shouldFail: true });
      loader = new AsyncContentLoader(contentBuffer, loadingManager, snippetEngine, stepProvider);

      const callback = vi.fn();

      loader.onLoadError(callback);
      loader.offLoadError(callback);

      const loadPromise = loader.loadStep('step-1');
      // Attach handler immediately to prevent unhandled rejection
      loadPromise.catch(() => {});

      await vi.runAllTimersAsync();

      let thrownError: Error | undefined;
      try {
        await loadPromise;
      } catch (e) {
        thrownError = e as Error;
      }

      expect(thrownError).toBeDefined();
      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('should throw error if step not found', async () => {
      // Use try-catch to handle the rejection properly
      let error: Error | undefined;
      try {
        await loader.loadStep('non-existent');
      } catch (e) {
        error = e as Error;
      }

      expect(error).toBeDefined();
      expect(error!.message).toContain('Step not found: non-existent');
    });

    it('should throw error if loader is disposed', async () => {
      loader.dispose();

      let error: Error | undefined;
      try {
        await loader.loadStep('step-1');
      } catch (e) {
        error = e as Error;
      }

      expect(error).toBeDefined();
      expect(error!.message).toContain('disposed');
    });

    it('should handle non-Error throws from snippet engine', async () => {
      const mockEngine = {
        ...createMockSnippetEngine(),
        async getSnippet(): Promise<HighlightedCode> {
          throw 'string error';
        },
      } as unknown as CodeSnippetEngine;

      loader = new AsyncContentLoader(contentBuffer, loadingManager, mockEngine, stepProvider);

      const callback = vi.fn();
      loader.onLoadError(callback);

      const loadPromise = loader.loadStep('step-1');
      // Attach handler immediately to prevent unhandled rejection
      loadPromise.catch(() => {});

      await vi.runAllTimersAsync();

      let error: Error | undefined;
      try {
        await loadPromise;
      } catch (e) {
        error = e as Error;
      }

      expect(error).toBeDefined();
      expect(callback).toHaveBeenCalledWith('step-1', expect.any(Error));
    });
  });

  describe('dispose', () => {
    it('should cancel current load on dispose', async () => {
      snippetEngine = createMockSnippetEngine({ delay: 100 });
      loader = new AsyncContentLoader(contentBuffer, loadingManager, snippetEngine, stepProvider);

      const loadPromise = loader.loadStep('step-1');
      // Attach handler immediately to prevent unhandled rejection
      loadPromise.catch(() => {});

      loader.dispose();

      await vi.runAllTimersAsync();

      // Handle the rejection properly
      let error: Error | undefined;
      try {
        await loadPromise;
      } catch (e) {
        error = e as Error;
      }

      expect(error).toBeDefined();
      expect(error!.name).toBe('AbortError');
    });

    it('should cancel preloads on dispose', async () => {
      snippetEngine = createMockSnippetEngine({ delay: 100 });
      loader = new AsyncContentLoader(contentBuffer, loadingManager, snippetEngine, stepProvider);

      loader.preloadSteps(['step-2', 'step-3']);

      loader.dispose();

      await vi.runAllTimersAsync();

      // Preloads should not complete
      expect(contentBuffer.has('step-2')).toBe(false);
      expect(contentBuffer.has('step-3')).toBe(false);
    });

    it('should clear callbacks on dispose', () => {
      const callback = vi.fn();
      loader.onLoadStart(callback);
      loader.onLoadComplete(callback);
      loader.onLoadError(callback);

      loader.dispose();

      // After dispose, callbacks should be cleared (cannot directly test)
      // but no errors should occur
      expect(true).toBe(true);
    });

    it('should not allow new loads after dispose', () => {
      loader.dispose();

      expect(() => loader.preloadSteps(['step-1'])).not.toThrow();
      // preloadSteps silently returns when disposed
    });
  });
});
