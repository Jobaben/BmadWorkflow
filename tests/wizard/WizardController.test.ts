/**
 * WizardController Unit Tests
 *
 * Tests the WizardController implementation against story-019 acceptance criteria:
 * - AC1: Controller manages current step state
 * - AC2: Step navigation updates all components
 * - AC3: Direct step navigation works
 * - AC4: Step history enables back navigation
 * - AC5: Step change emits events
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { WizardController } from '../../src/wizard/WizardController';
import type { StepChangeEvent, WizardControllerConfig } from '../../src/wizard/WizardController';
import type { WizardStep } from '../../src/wizard/types';
import { ComplexityTier } from '../../src/wizard/types';
import { ConceptRegistry } from '../../src/wizard/ConceptRegistry';
import type { CodeSnippetEngine, HighlightedCode } from '../../src/wizard/CodeSnippetEngine';
import type { DemoAdapter } from '../../src/wizard/DemoAdapter';
import type { WizardNavigator } from '../../src/wizard-ui/WizardNavigator';
import type { LearningPanel } from '../../src/wizard-ui/LearningPanel';
import type { AsyncContentLoader } from '../../src/async/AsyncContentLoader';
import type { StepContent } from '../../src/async/types';
import { DemoType } from '../../src/types';

// Helper to create mock WizardStep
function createMockStep(id: string, order: number): WizardStep {
  return {
    id,
    title: `Step ${id}`,
    tier: ComplexityTier.Micro,
    demoType: DemoType.Particles,
    description: `Description for ${id}`,
    learningObjectives: ['Learn something'],
    codeSnippets: [
      {
        id: `snippet-${id}`,
        sourceFile: 'demos/test.ts',
        startLine: 1,
        endLine: 10,
      },
    ],
    annotations: [],
    order,
  };
}

// Create mock dependencies
function createMockConfig(steps: WizardStep[]): WizardControllerConfig & {
  mockNavigator: {
    setSteps: ReturnType<typeof vi.fn>;
    setCurrentStep: ReturnType<typeof vi.fn>;
    onNavigate: ReturnType<typeof vi.fn>;
    offNavigate: ReturnType<typeof vi.fn>;
    navigateCallback: ((stepId: string) => void) | null;
  };
  mockPanel: {
    renderStep: ReturnType<typeof vi.fn>;
  };
  mockAdapter: {
    loadDemoForStep: ReturnType<typeof vi.fn>;
  };
  mockEngine: {
    initialize: ReturnType<typeof vi.fn>;
    getSnippet: ReturnType<typeof vi.fn>;
  };
} {
  const navigateCallback: { current: ((stepId: string) => void) | null } = { current: null };

  const mockNavigator = {
    setSteps: vi.fn(),
    setCurrentStep: vi.fn(),
    onNavigate: vi.fn((cb: (stepId: string) => void) => {
      navigateCallback.current = cb;
    }),
    offNavigate: vi.fn(),
    navigateCallback: null as ((stepId: string) => void) | null,
  };

  // Expose the callback via a getter
  Object.defineProperty(mockNavigator, 'navigateCallback', {
    get: () => navigateCallback.current,
  });

  const mockPanel = {
    renderStep: vi.fn(),
  };

  const mockAdapter = {
    loadDemoForStep: vi.fn(),
  };

  const mockHighlightedCode: HighlightedCode = {
    html: '<code>test</code>',
    plainText: 'test',
    lineCount: 10,
    annotations: [],
  };

  const mockEngine = {
    initialize: vi.fn().mockResolvedValue(undefined),
    getSnippet: vi.fn().mockResolvedValue(mockHighlightedCode),
  };

  const registry = new ConceptRegistry(steps);

  return {
    registry,
    adapter: mockAdapter as unknown as DemoAdapter,
    navigator: mockNavigator as unknown as WizardNavigator,
    panel: mockPanel as unknown as LearningPanel,
    engine: mockEngine as unknown as CodeSnippetEngine,
    mockNavigator,
    mockPanel,
    mockAdapter,
    mockEngine,
  };
}

describe('WizardController', () => {
  let controller: WizardController;
  let config: ReturnType<typeof createMockConfig>;
  let testSteps: WizardStep[];

  beforeEach(() => {
    testSteps = [
      createMockStep('step-1', 1),
      createMockStep('step-2', 2),
      createMockStep('step-3', 3),
      createMockStep('step-4', 4),
      createMockStep('step-5', 5),
    ];
    config = createMockConfig(testSteps);
    controller = new WizardController(config);
  });

  afterEach(() => {
    controller.dispose();
  });

  describe('AC1: Controller manages current step state', () => {
    it('should return null before start', () => {
      expect(controller.getCurrentStep()).toBeNull();
      expect(controller.getCurrentStepId()).toBeNull();
    });

    it('should return current step after start', async () => {
      await controller.start();

      expect(controller.getCurrentStep()).not.toBeNull();
      expect(controller.getCurrentStep()?.id).toBe('step-1');
      expect(controller.getCurrentStepId()).toBe('step-1');
    });

    it('should update current step after navigation', async () => {
      await controller.start();
      await controller.goToStep('step-3');

      expect(controller.getCurrentStep()?.id).toBe('step-3');
    });

    it('should start at specified step', async () => {
      await controller.start('step-3');

      expect(controller.getCurrentStep()?.id).toBe('step-3');
    });

    it('should track isStarted state', () => {
      expect(controller.isStarted()).toBe(false);
    });

    it('should set isStarted after start', async () => {
      await controller.start();
      expect(controller.isStarted()).toBe(true);
    });
  });

  describe('AC2: Step navigation updates all components', () => {
    it('should initialize navigator with all steps', async () => {
      await controller.start();

      expect(config.mockNavigator.setSteps).toHaveBeenCalledWith(testSteps);
    });

    it('should update navigator on step change', async () => {
      await controller.start();
      await controller.goToStep('step-2');

      expect(config.mockNavigator.setCurrentStep).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'step-2' })
      );
    });

    it('should update learning panel with step and code', async () => {
      await controller.start();

      expect(config.mockPanel.renderStep).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'step-1' }),
        expect.any(Array)
      );
    });

    it('should load demo via adapter', async () => {
      await controller.start();

      expect(config.mockAdapter.loadDemoForStep).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'step-1' })
      );
    });

    it('should load code snippets via engine', async () => {
      await controller.start();

      expect(config.mockEngine.getSnippet).toHaveBeenCalled();
    });

    it('should update all components on navigation', async () => {
      await controller.start();

      config.mockNavigator.setCurrentStep.mockClear();
      config.mockPanel.renderStep.mockClear();
      config.mockAdapter.loadDemoForStep.mockClear();

      await controller.goToStep('step-3');

      expect(config.mockNavigator.setCurrentStep).toHaveBeenCalled();
      expect(config.mockPanel.renderStep).toHaveBeenCalled();
      expect(config.mockAdapter.loadDemoForStep).toHaveBeenCalled();
    });
  });

  describe('AC3: Direct step navigation works', () => {
    it('should navigate to specific step by ID', async () => {
      await controller.start();
      await controller.goToStep('step-4');

      expect(controller.getCurrentStepId()).toBe('step-4');
    });

    it('should throw error for non-existent step', async () => {
      await controller.start();

      await expect(controller.goToStep('non-existent')).rejects.toThrow(
        /Step not found/
      );
    });

    it('should navigate via nextStep', async () => {
      await controller.start();
      await controller.nextStep();

      expect(controller.getCurrentStepId()).toBe('step-2');
    });

    it('should navigate via previousStep', async () => {
      await controller.start('step-3');
      await controller.previousStep();

      expect(controller.getCurrentStepId()).toBe('step-2');
    });

    it('should handle nextStep at last step', async () => {
      await controller.start('step-5');

      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      await controller.nextStep();
      consoleSpy.mockRestore();

      expect(controller.getCurrentStepId()).toBe('step-5');
    });

    it('should handle previousStep at first step', async () => {
      await controller.start('step-1');

      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      await controller.previousStep();
      consoleSpy.mockRestore();

      expect(controller.getCurrentStepId()).toBe('step-1');
    });

    it('should skip navigation to same step', async () => {
      await controller.start('step-2');

      config.mockNavigator.setCurrentStep.mockClear();

      await controller.goToStep('step-2');

      expect(config.mockNavigator.setCurrentStep).not.toHaveBeenCalled();
    });

    it('should respond to navigator callbacks', async () => {
      await controller.start();

      // Simulate navigator triggering navigation
      config.mockNavigator.navigateCallback?.('step-4');

      // Wait for async navigation
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(controller.getCurrentStepId()).toBe('step-4');
    });
  });

  describe('AC4: Step history enables back navigation', () => {
    it('should track navigation history', async () => {
      await controller.start('step-1');
      await controller.goToStep('step-2');
      await controller.goToStep('step-3');

      expect(controller.canGoBack()).toBe(true);
    });

    it('should navigate back in history', async () => {
      await controller.start('step-1');
      await controller.goToStep('step-2');
      await controller.goToStep('step-3');

      await controller.goBack();

      expect(controller.getCurrentStepId()).toBe('step-2');
    });

    it('should navigate forward in history', async () => {
      await controller.start('step-1');
      await controller.goToStep('step-2');
      await controller.goToStep('step-3');
      await controller.goBack();

      await controller.goForward();

      expect(controller.getCurrentStepId()).toBe('step-3');
    });

    it('should clear forward history on new navigation', async () => {
      await controller.start('step-1');
      await controller.goToStep('step-2');
      await controller.goToStep('step-3');
      await controller.goBack(); // Now at step-2

      await controller.goToStep('step-5'); // New navigation

      expect(controller.canGoForward()).toBe(false);
    });

    it('should handle goBack at beginning of history', async () => {
      await controller.start('step-1');

      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      await controller.goBack();
      consoleSpy.mockRestore();

      expect(controller.getCurrentStepId()).toBe('step-1');
    });

    it('should handle goForward at end of history', async () => {
      await controller.start('step-1');
      await controller.goToStep('step-2');

      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      await controller.goForward();
      consoleSpy.mockRestore();

      expect(controller.getCurrentStepId()).toBe('step-2');
    });

    it('should report canGoBack correctly', async () => {
      await controller.start('step-1');
      expect(controller.canGoBack()).toBe(false);

      await controller.goToStep('step-2');
      expect(controller.canGoBack()).toBe(true);
    });

    it('should report canGoForward correctly', async () => {
      await controller.start('step-1');
      await controller.goToStep('step-2');
      expect(controller.canGoForward()).toBe(false);

      await controller.goBack();
      expect(controller.canGoForward()).toBe(true);
    });
  });

  describe('AC5: Step change emits events', () => {
    it('should emit step change on initial load', async () => {
      const listener = vi.fn();
      controller.onStepChange(listener);

      await controller.start();

      expect(listener).toHaveBeenCalledWith({
        previousStep: null,
        currentStep: expect.objectContaining({ id: 'step-1' }),
      });
    });

    it('should emit step change on navigation', async () => {
      await controller.start();

      const listener = vi.fn();
      controller.onStepChange(listener);

      await controller.goToStep('step-3');

      expect(listener).toHaveBeenCalledWith({
        previousStep: expect.objectContaining({ id: 'step-1' }),
        currentStep: expect.objectContaining({ id: 'step-3' }),
      });
    });

    it('should emit step change on back navigation', async () => {
      await controller.start('step-1');
      await controller.goToStep('step-2');

      const listener = vi.fn();
      controller.onStepChange(listener);

      await controller.goBack();

      expect(listener).toHaveBeenCalledWith({
        previousStep: expect.objectContaining({ id: 'step-2' }),
        currentStep: expect.objectContaining({ id: 'step-1' }),
      });
    });

    it('should allow removing step change listeners', async () => {
      const listener = vi.fn();
      controller.onStepChange(listener);
      controller.offStepChange(listener);

      await controller.start();

      expect(listener).not.toHaveBeenCalled();
    });

    it('should handle listener errors gracefully', async () => {
      const errorListener = () => {
        throw new Error('Listener error');
      };
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      controller.onStepChange(errorListener);

      await expect(controller.start()).resolves.not.toThrow();

      consoleSpy.mockRestore();
    });
  });

  describe('Helper Methods', () => {
    it('hasNextStep should return correct value', async () => {
      await controller.start('step-1');
      expect(controller.hasNextStep()).toBe(true);

      await controller.goToStep('step-5');
      expect(controller.hasNextStep()).toBe(false);
    });

    it('hasPreviousStep should return correct value', async () => {
      await controller.start('step-1');
      expect(controller.hasPreviousStep()).toBe(false);

      await controller.goToStep('step-3');
      expect(controller.hasPreviousStep()).toBe(true);
    });

    it('isNavigationInProgress should track navigation state', async () => {
      expect(controller.isNavigationInProgress()).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty step registry', async () => {
      const emptyConfig = createMockConfig([]);
      const emptyController = new WizardController(emptyConfig);

      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      await emptyController.start();
      consoleSpy.mockRestore();

      expect(emptyController.getCurrentStep()).toBeNull();
      emptyController.dispose();
    });

    it('should warn on duplicate start', async () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      await controller.start();
      await controller.start();

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Already started')
      );
      consoleSpy.mockRestore();
    });

    it('should handle navigation during navigation', async () => {
      await controller.start();

      // Mock slow navigation
      config.mockEngine.getSnippet.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const nav1 = controller.goToStep('step-2');
      const nav2 = controller.goToStep('step-3');

      await Promise.all([nav1, nav2]);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Navigation already in progress')
      );
      consoleSpy.mockRestore();
    });

    it('should handle snippet loading errors gracefully', async () => {
      config.mockEngine.getSnippet.mockRejectedValue(new Error('Load error'));
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      await controller.start();

      consoleSpy.mockRestore();

      // Should still complete navigation
      expect(controller.getCurrentStepId()).toBe('step-1');
    });

    it('should cleanup on dispose', async () => {
      await controller.start();

      controller.dispose();

      expect(config.mockNavigator.offNavigate).toHaveBeenCalled();
      expect(controller.getCurrentStep()).toBeNull();
    });

    it('should handle operations after dispose', async () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      await controller.start();
      controller.dispose();

      await controller.goToStep('step-2');

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('disposed')
      );
      consoleSpy.mockRestore();
    });

    it('should handle double dispose', () => {
      expect(() => {
        controller.dispose();
        controller.dispose();
      }).not.toThrow();
    });
  });
});

/**
 * story-028 AC3: Wizard integration uses AsyncContentLoader
 *
 * Tests that WizardController properly integrates with AsyncContentLoader
 * when provided.
 */
describe('WizardController with AsyncContentLoader (story-028 AC3)', () => {
  let controller: WizardController;
  let config: ReturnType<typeof createMockConfig>;
  let testSteps: WizardStep[];
  let mockAsyncLoader: {
    loadStep: ReturnType<typeof vi.fn>;
    preloadSteps: ReturnType<typeof vi.fn>;
  };

  function createMockAsyncLoader() {
    const mockContent: StepContent = {
      stepId: 'step-1',
      snippets: [
        {
          html: '<code>async loaded</code>',
          plainText: 'async loaded',
          lineCount: 5,
          annotations: [],
        },
      ],
      annotations: [],
      loadedAt: Date.now(),
    };

    return {
      loadStep: vi.fn((stepId: string) => {
        return Promise.resolve({
          ...mockContent,
          stepId,
        });
      }),
      preloadSteps: vi.fn(),
      cancelPending: vi.fn(),
      hasContent: vi.fn().mockReturnValue(false),
      getContent: vi.fn().mockReturnValue(undefined),
      isLoading: vi.fn().mockReturnValue(false),
      onLoadStart: vi.fn(),
      offLoadStart: vi.fn(),
      onLoadComplete: vi.fn(),
      offLoadComplete: vi.fn(),
      onLoadError: vi.fn(),
      offLoadError: vi.fn(),
      dispose: vi.fn(),
    };
  }

  beforeEach(() => {
    testSteps = [
      createMockStep('step-1', 1),
      createMockStep('step-2', 2),
      createMockStep('step-3', 3),
    ];
    config = createMockConfig(testSteps);
    mockAsyncLoader = createMockAsyncLoader();
    controller = new WizardController({
      ...config,
      asyncLoader: mockAsyncLoader as unknown as AsyncContentLoader,
    });
  });

  afterEach(() => {
    controller.dispose();
  });

  describe('loadStep integration', () => {
    it('should use AsyncContentLoader.loadStep when available', async () => {
      await controller.start();

      expect(mockAsyncLoader.loadStep).toHaveBeenCalledWith('step-1');
      // Should NOT use direct engine calls
      expect(config.mockEngine.getSnippet).not.toHaveBeenCalled();
    });

    it('should use AsyncContentLoader for navigation', async () => {
      await controller.start();
      mockAsyncLoader.loadStep.mockClear();

      await controller.goToStep('step-2');

      expect(mockAsyncLoader.loadStep).toHaveBeenCalledWith('step-2');
    });

    it('should pass loaded content to panel', async () => {
      await controller.start();

      expect(config.mockPanel.renderStep).toHaveBeenCalled();
      const callArgs = config.mockPanel.renderStep.mock.calls[0];
      expect(callArgs[0].id).toBe('step-1');
      // Second argument is the highlighted code array
      expect(callArgs[1]).toBeDefined();
    });
  });

  describe('preloadSteps integration', () => {
    it('should preload adjacent steps after navigation', async () => {
      await controller.start();

      // Should preload step-2 (next)
      expect(mockAsyncLoader.preloadSteps).toHaveBeenCalled();
      const preloadedSteps = mockAsyncLoader.preloadSteps.mock.calls[0][0];
      expect(preloadedSteps).toContain('step-2');
    });

    it('should preload both prev and next steps', async () => {
      await controller.start();
      mockAsyncLoader.preloadSteps.mockClear();

      await controller.goToStep('step-2');

      const preloadedSteps = mockAsyncLoader.preloadSteps.mock.calls[0][0];
      expect(preloadedSteps).toContain('step-1'); // previous
      expect(preloadedSteps).toContain('step-3'); // next
    });
  });

  describe('error handling', () => {
    it('should handle AbortError gracefully', async () => {
      const abortError = new DOMException('Aborted', 'AbortError');
      mockAsyncLoader.loadStep.mockRejectedValueOnce(abortError);

      await controller.start();

      // Should not throw
      expect(config.mockPanel.renderStep).toHaveBeenCalled();
      // Should receive empty snippets array due to abort
      const callArgs = config.mockPanel.renderStep.mock.calls[0];
      expect(callArgs[1]).toEqual([]);
    });

    it('should handle load errors and log them', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const loadError = new Error('Load failed');
      mockAsyncLoader.loadStep.mockRejectedValueOnce(loadError);

      await controller.start();

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error loading step'),
        expect.anything()
      );
      consoleSpy.mockRestore();
    });
  });

  describe('fallback behavior', () => {
    it('should use direct engine calls when asyncLoader is not provided', async () => {
      // Create controller without asyncLoader
      const controllerWithoutAsync = new WizardController(config);

      await controllerWithoutAsync.start();

      expect(config.mockEngine.getSnippet).toHaveBeenCalled();
      controllerWithoutAsync.dispose();
    });
  });
});
