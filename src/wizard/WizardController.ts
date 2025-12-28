/**
 * Wizard Controller (State Machine)
 *
 * Central orchestrator for the wizard learning experience.
 * Manages step state, coordinates component updates, and handles navigation.
 *
 * Implements the Mediator pattern to decouple wizard components.
 * Navigation methods are async due to code snippet loading.
 *
 * @zone ASYNC
 * @reason Navigation triggers async content loading via AsyncContentLoader
 *
 * This controller coordinates between async loading (AsyncContentLoader) and
 * sync display (LearningPanel, WizardNavigator). Content is loaded async and
 * stored in ContentBuffer for sync access during render.
 *
 * @see FR-001 (Wizard Navigation)
 * @see FR-004 (Flexible Navigation)
 * @see story-028 AC3: Wizard integration uses AsyncContentLoader
 */

import type { WizardStep } from './types';
import type { ConceptRegistry } from './ConceptRegistry';
import type { CodeSnippetEngine, HighlightedCode } from './CodeSnippetEngine';
import type { DemoAdapter } from './DemoAdapter';
import type { WizardNavigator } from '../wizard-ui/WizardNavigator';
import type { LearningPanel } from '../wizard-ui/LearningPanel';
import type { AsyncContentLoader } from '../async/AsyncContentLoader';
import type { StepContent } from '../async/types';

/**
 * Event emitted when the wizard step changes.
 */
export interface StepChangeEvent {
  /** The step we're navigating from (null on initial load) */
  previousStep: WizardStep | null;
  /** The step we're navigating to */
  currentStep: WizardStep;
}

/**
 * Callback type for step change events.
 */
export type StepChangeCallback = (event: StepChangeEvent) => void;

/**
 * Configuration for WizardController.
 */
export interface WizardControllerConfig {
  /** Registry containing all wizard steps */
  registry: ConceptRegistry;
  /** Adapter for controlling demo instances */
  adapter: DemoAdapter;
  /** Navigator UI component */
  navigator: WizardNavigator;
  /** Learning panel UI component */
  panel: LearningPanel;
  /** Engine for retrieving code snippets */
  engine: CodeSnippetEngine;
  /**
   * Optional async content loader for optimized content loading.
   * When provided, content is loaded via AsyncContentLoader with
   * cancellation support and ContentBuffer caching.
   *
   * @see story-028 AC3: Wizard integration uses AsyncContentLoader
   */
  asyncLoader?: AsyncContentLoader;
}

/**
 * WizardController orchestrates the wizard learning experience.
 *
 * Responsibilities:
 * - Manage current step state
 * - Coordinate component updates on navigation
 * - Maintain step history for back navigation
 * - Emit step change events
 *
 * @example
 * ```typescript
 * const controller = new WizardController({
 *   registry,
 *   adapter,
 *   navigator,
 *   panel,
 *   engine,
 * });
 *
 * controller.onStepChange((event) => {
 *   console.log(`Navigated from ${event.previousStep?.id} to ${event.currentStep.id}`);
 * });
 *
 * await controller.start();
 * await controller.nextStep();
 * ```
 */
export class WizardController {
  /** Registry containing all wizard steps */
  private readonly registry: ConceptRegistry;

  /** Adapter for controlling demos */
  private readonly adapter: DemoAdapter;

  /** Navigator UI component */
  private readonly navigator: WizardNavigator;

  /** Learning panel UI component */
  private readonly panel: LearningPanel;

  /** Code snippet engine */
  private readonly engine: CodeSnippetEngine;

  /**
   * Optional async content loader for optimized loading.
   * When provided, uses AsyncContentLoader instead of direct engine calls.
   *
   * @see story-028 AC3: Wizard integration uses AsyncContentLoader
   */
  private readonly asyncLoader?: AsyncContentLoader;

  /** Current step ID */
  private currentStepId: string | null = null;

  /** Step navigation history (for back navigation) */
  private stepHistory: string[] = [];

  /** Position in history (for forward after back) */
  private historyPosition: number = -1;

  /** Step change callbacks */
  private stepChangeCallbacks: Set<StepChangeCallback> = new Set();

  /** Whether a navigation is currently in progress */
  private isNavigating: boolean = false;

  /** Whether the controller has been started */
  private started: boolean = false;

  /** Whether the controller has been disposed */
  private disposed: boolean = false;

  /** Bound handler for navigator callbacks */
  private boundNavigateHandler: (stepId: string) => void;

  /**
   * Create a new WizardController.
   *
   * @param config - Configuration with required dependencies
   */
  constructor(config: WizardControllerConfig) {
    this.registry = config.registry;
    this.adapter = config.adapter;
    this.navigator = config.navigator;
    this.panel = config.panel;
    this.engine = config.engine;
    this.asyncLoader = config.asyncLoader;

    // Create bound handler for navigator
    this.boundNavigateHandler = (stepId: string) => {
      this.goToStep(stepId).catch((err) => {
        console.error('WizardController: Navigation error:', err);
      });
    };
  }

  /**
   * Start the wizard, optionally at a specific step.
   *
   * @param initialStepId - Optional step ID to start at. If not provided,
   *                        starts at the first step in order.
   */
  async start(initialStepId?: string): Promise<void> {
    if (this.disposed) {
      console.warn('WizardController: Cannot start, controller is disposed');
      return;
    }

    if (this.started) {
      console.warn('WizardController: Already started');
      return;
    }

    // Initialize the code snippet engine
    await this.engine.initialize();

    // Set up navigator with all steps
    const allSteps = this.registry.getAllSteps();
    this.navigator.setSteps(allSteps);

    // Register navigator callback
    this.navigator.onNavigate(this.boundNavigateHandler);

    // Determine initial step
    let targetStepId = initialStepId;
    if (!targetStepId) {
      const firstStep = allSteps[0];
      if (!firstStep) {
        console.warn('WizardController: No steps available');
        this.started = true;
        return;
      }
      targetStepId = firstStep.id;
    }

    this.started = true;

    // Navigate to initial step
    await this.goToStep(targetStepId);
  }

  /**
   * Navigate to a specific step by ID.
   *
   * @param stepId - The ID of the step to navigate to
   * @throws Error if step not found
   */
  async goToStep(stepId: string): Promise<void> {
    if (this.disposed) {
      console.warn('WizardController: Cannot navigate, controller is disposed');
      return;
    }

    if (this.isNavigating) {
      console.warn('WizardController: Navigation already in progress');
      return;
    }

    const targetStep = this.registry.getStep(stepId);
    if (!targetStep) {
      throw new Error(`WizardController: Step not found: ${stepId}`);
    }

    // Get current step before updating
    const previousStep = this.getCurrentStep();

    // Skip if navigating to current step
    if (previousStep?.id === stepId) {
      return;
    }

    this.isNavigating = true;

    try {
      // Update history
      this.updateHistory(stepId);

      // Update current step
      this.currentStepId = stepId;

      // Coordinate component updates
      await this.updateComponents(targetStep);

      // Emit step change event
      this.emitStepChange(previousStep, targetStep);

      // Preload adjacent steps if using async loader (story-028 AC3)
      this.preloadAdjacentSteps(stepId);
    } finally {
      this.isNavigating = false;
    }
  }

  /**
   * Navigate to the next step in sequence.
   */
  async nextStep(): Promise<void> {
    if (!this.currentStepId) {
      console.warn('WizardController: No current step');
      return;
    }

    const nextStep = this.registry.getNextStep(this.currentStepId);
    if (!nextStep) {
      console.log('WizardController: Already at last step');
      return;
    }

    await this.goToStep(nextStep.id);
  }

  /**
   * Navigate to the previous step in sequence.
   */
  async previousStep(): Promise<void> {
    if (!this.currentStepId) {
      console.warn('WizardController: No current step');
      return;
    }

    const prevStep = this.registry.getPreviousStep(this.currentStepId);
    if (!prevStep) {
      console.log('WizardController: Already at first step');
      return;
    }

    await this.goToStep(prevStep.id);
  }

  /**
   * Navigate back in history.
   */
  async goBack(): Promise<void> {
    if (this.historyPosition <= 0) {
      console.log('WizardController: No history to go back to');
      return;
    }

    this.historyPosition--;
    const stepId = this.stepHistory[this.historyPosition];

    // Navigate without updating history
    await this.navigateWithoutHistory(stepId);
  }

  /**
   * Navigate forward in history.
   */
  async goForward(): Promise<void> {
    if (this.historyPosition >= this.stepHistory.length - 1) {
      console.log('WizardController: No history to go forward to');
      return;
    }

    this.historyPosition++;
    const stepId = this.stepHistory[this.historyPosition];

    // Navigate without updating history
    await this.navigateWithoutHistory(stepId);
  }

  /**
   * Get the current wizard step.
   *
   * @returns The current step, or null if not started
   */
  getCurrentStep(): WizardStep | null {
    if (!this.currentStepId) {
      return null;
    }
    return this.registry.getStep(this.currentStepId) ?? null;
  }

  /**
   * Get the current step ID.
   *
   * @returns The current step ID, or null if not started
   */
  getCurrentStepId(): string | null {
    return this.currentStepId;
  }

  /**
   * Check if we can navigate back in history.
   */
  canGoBack(): boolean {
    return this.historyPosition > 0;
  }

  /**
   * Check if we can navigate forward in history.
   */
  canGoForward(): boolean {
    return this.historyPosition < this.stepHistory.length - 1;
  }

  /**
   * Check if there is a next step in sequence.
   */
  hasNextStep(): boolean {
    if (!this.currentStepId) return false;
    return this.registry.getNextStep(this.currentStepId) !== undefined;
  }

  /**
   * Check if there is a previous step in sequence.
   */
  hasPreviousStep(): boolean {
    if (!this.currentStepId) return false;
    return this.registry.getPreviousStep(this.currentStepId) !== undefined;
  }

  /**
   * Register a callback for step change events.
   *
   * @param callback - Function to call when step changes
   */
  onStepChange(callback: StepChangeCallback): void {
    this.stepChangeCallbacks.add(callback);
  }

  /**
   * Remove a step change callback.
   *
   * @param callback - Function to remove
   */
  offStepChange(callback: StepChangeCallback): void {
    this.stepChangeCallbacks.delete(callback);
  }

  /**
   * Check if the controller has been started.
   */
  isStarted(): boolean {
    return this.started;
  }

  /**
   * Check if a navigation is in progress.
   */
  isNavigationInProgress(): boolean {
    return this.isNavigating;
  }

  /**
   * Dispose of the controller and clean up resources.
   */
  dispose(): void {
    if (this.disposed) {
      return;
    }

    // Remove navigator callback
    this.navigator.offNavigate(this.boundNavigateHandler);

    // Clear callbacks
    this.stepChangeCallbacks.clear();

    // Clear state
    this.currentStepId = null;
    this.stepHistory = [];
    this.historyPosition = -1;

    this.disposed = true;
  }

  /**
   * Update all components for a new step.
   */
  private async updateComponents(step: WizardStep): Promise<void> {
    // Update navigator (sync)
    this.navigator.setCurrentStep(step);

    // Load code snippets (async)
    const highlightedCode = await this.loadCodeSnippets(step);

    // Update learning panel (sync)
    this.panel.renderStep(step, highlightedCode);

    // Update demo adapter (sync)
    this.adapter.loadDemoForStep(step);
  }

  /**
   * Load code snippets for a step.
   * Uses AsyncContentLoader if available, otherwise falls back to direct engine calls.
   *
   * @see story-028 AC3: Wizard integration uses AsyncContentLoader
   */
  private async loadCodeSnippets(step: WizardStep): Promise<HighlightedCode[]> {
    // Use AsyncContentLoader if available (story-028 AC3)
    if (this.asyncLoader) {
      try {
        const content: StepContent = await this.asyncLoader.loadStep(step.id);
        return content.snippets;
      } catch (error) {
        // Handle abort gracefully
        if (error instanceof DOMException && error.name === 'AbortError') {
          return [];
        }
        console.error(`WizardController: Error loading step ${step.id}:`, error);
        return [];
      }
    }

    // Fallback to direct engine calls (backwards compatibility)
    const snippets: HighlightedCode[] = [];

    for (const ref of step.codeSnippets) {
      try {
        const highlighted = await this.engine.getSnippet(ref, step.annotations);
        snippets.push(highlighted);
      } catch (error) {
        console.error(`WizardController: Error loading snippet ${ref.id}:`, error);
        // Continue with other snippets
      }
    }

    return snippets;
  }

  /**
   * Preload adjacent steps for smoother navigation.
   * Uses AsyncContentLoader's preloadSteps() to load during idle time.
   *
   * @see story-028 AC3: Wizard integration uses AsyncContentLoader
   */
  private preloadAdjacentSteps(currentStepId: string): void {
    if (!this.asyncLoader) {
      return;
    }

    const adjacentStepIds: string[] = [];

    const nextStep = this.registry.getNextStep(currentStepId);
    if (nextStep) {
      adjacentStepIds.push(nextStep.id);
    }

    const prevStep = this.registry.getPreviousStep(currentStepId);
    if (prevStep) {
      adjacentStepIds.push(prevStep.id);
    }

    if (adjacentStepIds.length > 0) {
      this.asyncLoader.preloadSteps(adjacentStepIds);
    }
  }

  /**
   * Update navigation history.
   */
  private updateHistory(stepId: string): void {
    // If we're not at the end of history, truncate forward history
    if (this.historyPosition < this.stepHistory.length - 1) {
      this.stepHistory = this.stepHistory.slice(0, this.historyPosition + 1);
    }

    // Add new step to history
    this.stepHistory.push(stepId);
    this.historyPosition = this.stepHistory.length - 1;
  }

  /**
   * Navigate without updating history (for back/forward).
   */
  private async navigateWithoutHistory(stepId: string): Promise<void> {
    if (this.disposed) {
      return;
    }

    if (this.isNavigating) {
      console.warn('WizardController: Navigation already in progress');
      return;
    }

    const targetStep = this.registry.getStep(stepId);
    if (!targetStep) {
      console.error(`WizardController: Step not found in history: ${stepId}`);
      return;
    }

    const previousStep = this.getCurrentStep();

    this.isNavigating = true;

    try {
      this.currentStepId = stepId;
      await this.updateComponents(targetStep);
      this.emitStepChange(previousStep, targetStep);
    } finally {
      this.isNavigating = false;
    }
  }

  /**
   * Emit step change event to all callbacks.
   */
  private emitStepChange(previousStep: WizardStep | null, currentStep: WizardStep): void {
    const event: StepChangeEvent = { previousStep, currentStep };

    for (const callback of this.stepChangeCallbacks) {
      try {
        callback(event);
      } catch (error) {
        console.error('WizardController: Error in step change callback:', error);
      }
    }
  }
}
