/**
 * Wizard Navigator Component
 *
 * Provides navigation controls for the wizard learning experience.
 * Supports linear navigation (prev/next), direct step access via
 * concept list, and tier-based filtering.
 *
 * @see FR-001 (Wizard Navigation)
 * @see FR-004 (Flexible Navigation)
 * @see FR-006 (Concept Categorization)
 */

import type { WizardStep, ComplexityTier } from '../wizard/types';

/**
 * CSS styles for the wizard navigator.
 */
export function getWizardNavigatorStyles(): string {
  return `
    .wizard-navigator {
      display: flex;
      flex-direction: column;
      gap: 16px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    .wizard-nav-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
    }

    .wizard-nav-controls {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .wizard-nav-button {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 16px;
      background-color: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 6px;
      color: #c9d1d9;
      font-family: inherit;
      font-size: 14px;
      cursor: pointer;
      transition: background-color 0.15s ease, border-color 0.15s ease;
    }

    .wizard-nav-button:hover:not(:disabled) {
      background-color: rgba(255, 255, 255, 0.12);
      border-color: rgba(255, 255, 255, 0.25);
    }

    .wizard-nav-button:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }

    .wizard-nav-indicator {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
    }

    .wizard-nav-step-count {
      font-size: 12px;
      color: #8b949e;
    }

    .wizard-nav-step-title {
      font-size: 16px;
      font-weight: 500;
      color: #c9d1d9;
    }

    .wizard-nav-concept-toggle {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      background: none;
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 6px;
      color: #8b949e;
      font-family: inherit;
      font-size: 13px;
      cursor: pointer;
      transition: color 0.15s ease, border-color 0.15s ease;
    }

    .wizard-nav-concept-toggle:hover {
      color: #c9d1d9;
      border-color: rgba(255, 255, 255, 0.25);
    }

    .wizard-nav-concept-toggle--open {
      color: #58a6ff;
      border-color: #58a6ff;
    }

    .wizard-nav-concept-toggle-icon {
      transition: transform 0.2s ease;
    }

    .wizard-nav-concept-toggle--open .wizard-nav-concept-toggle-icon {
      transform: rotate(180deg);
    }

    .wizard-nav-concept-list {
      display: none;
      flex-direction: column;
      background-color: #161b22;
      border: 1px solid #30363d;
      border-radius: 8px;
      max-height: 400px;
      overflow-y: auto;
    }

    .wizard-nav-concept-list--open {
      display: flex;
    }

    .wizard-nav-tier-tabs {
      display: flex;
      border-bottom: 1px solid #30363d;
    }

    .wizard-nav-tier-tab {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 10px 16px;
      background: none;
      border: none;
      color: #8b949e;
      font-family: inherit;
      font-size: 13px;
      cursor: pointer;
      transition: color 0.15s ease, background-color 0.15s ease;
    }

    .wizard-nav-tier-tab:hover {
      background-color: rgba(255, 255, 255, 0.04);
      color: #c9d1d9;
    }

    .wizard-nav-tier-tab--active {
      color: #c9d1d9;
      background-color: rgba(255, 255, 255, 0.06);
      box-shadow: inset 0 -2px 0 #58a6ff;
    }

    .wizard-nav-tier-count {
      padding: 2px 6px;
      background-color: rgba(255, 255, 255, 0.1);
      border-radius: 10px;
      font-size: 11px;
    }

    .wizard-nav-step-list {
      display: flex;
      flex-direction: column;
      padding: 8px 0;
    }

    .wizard-nav-step-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 16px;
      background: none;
      border: none;
      text-align: left;
      color: #c9d1d9;
      font-family: inherit;
      font-size: 14px;
      cursor: pointer;
      transition: background-color 0.15s ease;
    }

    .wizard-nav-step-item:hover {
      background-color: rgba(255, 255, 255, 0.04);
    }

    .wizard-nav-step-item--current {
      background-color: rgba(88, 166, 255, 0.1);
    }

    .wizard-nav-step-item--current::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 3px;
      background-color: #58a6ff;
    }

    .wizard-nav-step-item {
      position: relative;
    }

    .wizard-nav-tier-badge {
      padding: 2px 8px;
      border-radius: 10px;
      font-size: 11px;
      font-weight: 500;
      text-transform: uppercase;
    }

    .wizard-nav-tier-badge--micro {
      background-color: rgba(46, 160, 67, 0.2);
      color: #7ee787;
    }

    .wizard-nav-tier-badge--medium {
      background-color: rgba(210, 153, 34, 0.2);
      color: #e3b341;
    }

    .wizard-nav-tier-badge--advanced {
      background-color: rgba(163, 113, 247, 0.2);
      color: #d2a8ff;
    }

    .wizard-nav-step-title-text {
      flex: 1;
    }

    .wizard-nav-step-order {
      color: #6e7681;
      font-size: 12px;
      min-width: 24px;
    }
  `;
}

/**
 * Inject wizard navigator styles into the document head.
 * Uses DOM check to determine if already injected, making it test-friendly.
 */
export function injectWizardNavigatorStyles(): void {
  if (typeof document === 'undefined') {
    return;
  }

  // Check DOM for existing style element (test-friendly approach)
  if (document.getElementById('wizard-navigator-styles')) {
    return;
  }

  const styleElement = document.createElement('style');
  styleElement.id = 'wizard-navigator-styles';
  styleElement.textContent = getWizardNavigatorStyles();
  document.head.appendChild(styleElement);
}

/**
 * WizardNavigator provides navigation controls for the wizard.
 *
 * Features:
 * - Previous/Next buttons for linear navigation
 * - Step indicator showing current position
 * - Expandable concept list for direct navigation
 * - Tier filtering (micro/medium/advanced)
 *
 * @example
 * ```typescript
 * const navigator = new WizardNavigator(container);
 * navigator.setSteps(steps);
 * navigator.setCurrentStep(steps[0]);
 * navigator.onNavigate((stepId) => controller.goToStep(stepId));
 * ```
 */
export class WizardNavigator {
  private container: HTMLElement;
  private rootElement: HTMLElement;
  private steps: WizardStep[] = [];
  private currentStep: WizardStep | null = null;
  private currentTierFilter: ComplexityTier | 'all' = 'all';
  private isConceptListOpen = false;

  // DOM elements
  private prevButton: HTMLButtonElement;
  private nextButton: HTMLButtonElement;
  private stepCountElement: HTMLElement;
  private stepTitleElement: HTMLElement;
  private conceptToggleButton: HTMLButtonElement;
  private conceptListElement: HTMLElement;
  private stepListElement: HTMLElement;
  private tierTabs: Map<ComplexityTier | 'all', HTMLButtonElement> = new Map();

  // Callbacks
  private navigateCallbacks: ((stepId: string) => void)[] = [];

  /**
   * Create a new WizardNavigator.
   *
   * @param container - The HTML element to render the navigator into
   */
  constructor(container: HTMLElement) {
    this.container = container;

    // Inject styles
    injectWizardNavigatorStyles();

    // Create structure
    this.rootElement = this.createRootElement();
    this.prevButton = this.createNavButton('prev');
    this.nextButton = this.createNavButton('next');

    const indicatorElements = this.createStepIndicator();
    this.stepCountElement = indicatorElements.stepCount;
    this.stepTitleElement = indicatorElements.stepTitle;

    this.conceptToggleButton = this.createConceptToggle();
    this.conceptListElement = this.createConceptList();
    this.stepListElement = this.conceptListElement.querySelector('.wizard-nav-step-list')!;

    // Assemble
    this.assembleNavigator();

    // Add to container
    this.container.appendChild(this.rootElement);
  }

  /**
   * Create the root navigator element.
   */
  private createRootElement(): HTMLElement {
    const root = document.createElement('div');
    root.className = 'wizard-navigator';
    return root;
  }

  /**
   * Create a navigation button.
   */
  private createNavButton(type: 'prev' | 'next'): HTMLButtonElement {
    const button = document.createElement('button');
    button.className = 'wizard-nav-button';
    button.type = 'button';

    if (type === 'prev') {
      button.innerHTML = '&#9664; Previous';
      button.addEventListener('click', () => this.navigatePrevious());
    } else {
      button.innerHTML = 'Next &#9654;';
      button.addEventListener('click', () => this.navigateNext());
    }

    return button;
  }

  /**
   * Create the step indicator elements.
   */
  private createStepIndicator(): { stepCount: HTMLElement; stepTitle: HTMLElement } {
    const stepCount = document.createElement('span');
    stepCount.className = 'wizard-nav-step-count';
    stepCount.textContent = 'Step 1 of 1';

    const stepTitle = document.createElement('span');
    stepTitle.className = 'wizard-nav-step-title';
    stepTitle.textContent = '';

    return { stepCount, stepTitle };
  }

  /**
   * Create the concept list toggle button.
   */
  private createConceptToggle(): HTMLButtonElement {
    const button = document.createElement('button');
    button.className = 'wizard-nav-concept-toggle';
    button.type = 'button';
    button.innerHTML = `
      All Concepts
      <span class="wizard-nav-concept-toggle-icon">&#9660;</span>
    `;

    button.addEventListener('click', () => this.toggleConceptList());

    return button;
  }

  /**
   * Create the concept list dropdown.
   */
  private createConceptList(): HTMLElement {
    const list = document.createElement('div');
    list.className = 'wizard-nav-concept-list';

    // Tier tabs
    const tierTabs = document.createElement('div');
    tierTabs.className = 'wizard-nav-tier-tabs';

    const tiers: { id: ComplexityTier | 'all'; label: string }[] = [
      { id: 'all', label: 'All' },
      { id: 'micro' as ComplexityTier, label: 'Micro' },
      { id: 'medium' as ComplexityTier, label: 'Medium' },
      { id: 'advanced' as ComplexityTier, label: 'Advanced' },
    ];

    for (const tier of tiers) {
      const tab = document.createElement('button');
      tab.className = 'wizard-nav-tier-tab';
      if (tier.id === 'all') {
        tab.classList.add('wizard-nav-tier-tab--active');
      }
      tab.type = 'button';
      tab.dataset.tier = tier.id;
      tab.innerHTML = `
        ${tier.label}
        <span class="wizard-nav-tier-count">0</span>
      `;
      tab.addEventListener('click', () => this.setTierFilter(tier.id));
      tierTabs.appendChild(tab);
      this.tierTabs.set(tier.id, tab);
    }

    list.appendChild(tierTabs);

    // Step list
    const stepList = document.createElement('div');
    stepList.className = 'wizard-nav-step-list';
    list.appendChild(stepList);

    return list;
  }

  /**
   * Assemble the navigator structure.
   */
  private assembleNavigator(): void {
    // Header with navigation controls
    const header = document.createElement('div');
    header.className = 'wizard-nav-header';

    const leftControls = document.createElement('div');
    leftControls.className = 'wizard-nav-controls';
    leftControls.appendChild(this.prevButton);

    const indicator = document.createElement('div');
    indicator.className = 'wizard-nav-indicator';
    indicator.appendChild(this.stepCountElement);
    indicator.appendChild(this.stepTitleElement);

    const rightControls = document.createElement('div');
    rightControls.className = 'wizard-nav-controls';
    rightControls.appendChild(this.nextButton);
    rightControls.appendChild(this.conceptToggleButton);

    header.appendChild(leftControls);
    header.appendChild(indicator);
    header.appendChild(rightControls);

    this.rootElement.appendChild(header);
    this.rootElement.appendChild(this.conceptListElement);
  }

  /**
   * Set the available steps.
   */
  setSteps(steps: WizardStep[]): void {
    this.steps = [...steps].sort((a, b) => a.order - b.order);
    this.updateTierCounts();
    this.renderStepList();
    this.updateNavigationState();
  }

  /**
   * Set the current step.
   */
  setCurrentStep(step: WizardStep): void {
    this.currentStep = step;
    this.updateStepIndicator();
    this.updateNavigationState();
    this.updateCurrentHighlight();
  }

  /**
   * Register a callback for navigation events.
   */
  onNavigate(callback: (stepId: string) => void): void {
    this.navigateCallbacks.push(callback);
  }

  /**
   * Remove a navigation callback.
   */
  offNavigate(callback: (stepId: string) => void): void {
    const index = this.navigateCallbacks.indexOf(callback);
    if (index !== -1) {
      this.navigateCallbacks.splice(index, 1);
    }
  }

  /**
   * Navigate to the previous step.
   */
  private navigatePrevious(): void {
    if (!this.currentStep || this.steps.length === 0) return;

    const currentIndex = this.steps.findIndex((s) => s.id === this.currentStep!.id);
    if (currentIndex > 0) {
      const prevStep = this.steps[currentIndex - 1];
      this.emitNavigate(prevStep.id);
    }
  }

  /**
   * Navigate to the next step.
   */
  private navigateNext(): void {
    if (!this.currentStep || this.steps.length === 0) return;

    const currentIndex = this.steps.findIndex((s) => s.id === this.currentStep!.id);
    if (currentIndex < this.steps.length - 1) {
      const nextStep = this.steps[currentIndex + 1];
      this.emitNavigate(nextStep.id);
    }
  }

  /**
   * Navigate directly to a step.
   */
  private navigateToStep(stepId: string): void {
    this.emitNavigate(stepId);
    this.closeConceptList();
  }

  /**
   * Emit a navigation event.
   */
  private emitNavigate(stepId: string): void {
    for (const callback of this.navigateCallbacks) {
      callback(stepId);
    }
  }

  /**
   * Toggle the concept list visibility.
   */
  private toggleConceptList(): void {
    this.isConceptListOpen = !this.isConceptListOpen;

    if (this.isConceptListOpen) {
      this.conceptListElement.classList.add('wizard-nav-concept-list--open');
      this.conceptToggleButton.classList.add('wizard-nav-concept-toggle--open');
    } else {
      this.conceptListElement.classList.remove('wizard-nav-concept-list--open');
      this.conceptToggleButton.classList.remove('wizard-nav-concept-toggle--open');
    }
  }

  /**
   * Close the concept list.
   */
  private closeConceptList(): void {
    if (this.isConceptListOpen) {
      this.isConceptListOpen = false;
      this.conceptListElement.classList.remove('wizard-nav-concept-list--open');
      this.conceptToggleButton.classList.remove('wizard-nav-concept-toggle--open');
    }
  }

  /**
   * Set the tier filter.
   */
  private setTierFilter(tier: ComplexityTier | 'all'): void {
    this.currentTierFilter = tier;

    // Update tab states
    for (const [id, tab] of this.tierTabs) {
      if (id === tier) {
        tab.classList.add('wizard-nav-tier-tab--active');
      } else {
        tab.classList.remove('wizard-nav-tier-tab--active');
      }
    }

    this.renderStepList();
  }

  /**
   * Update tier counts in the tabs.
   */
  private updateTierCounts(): void {
    const counts = {
      all: this.steps.length,
      micro: 0,
      medium: 0,
      advanced: 0,
    };

    for (const step of this.steps) {
      counts[step.tier]++;
    }

    for (const [id, tab] of this.tierTabs) {
      const countElement = tab.querySelector('.wizard-nav-tier-count');
      if (countElement) {
        countElement.textContent = String(counts[id]);
      }
    }
  }

  /**
   * Render the step list based on current filter.
   */
  private renderStepList(): void {
    this.stepListElement.innerHTML = '';

    const filteredSteps =
      this.currentTierFilter === 'all'
        ? this.steps
        : this.steps.filter((s) => s.tier === this.currentTierFilter);

    for (const step of filteredSteps) {
      const item = this.createStepItem(step);
      this.stepListElement.appendChild(item);
    }
  }

  /**
   * Create a step list item.
   */
  private createStepItem(step: WizardStep): HTMLButtonElement {
    const item = document.createElement('button');
    item.className = 'wizard-nav-step-item';
    item.type = 'button';
    item.dataset.stepId = step.id;

    if (this.currentStep && step.id === this.currentStep.id) {
      item.classList.add('wizard-nav-step-item--current');
    }

    const orderSpan = document.createElement('span');
    orderSpan.className = 'wizard-nav-step-order';
    orderSpan.textContent = String(step.order);

    const titleSpan = document.createElement('span');
    titleSpan.className = 'wizard-nav-step-title-text';
    titleSpan.textContent = step.title;

    const tierBadge = document.createElement('span');
    tierBadge.className = `wizard-nav-tier-badge wizard-nav-tier-badge--${step.tier}`;
    tierBadge.textContent = step.tier;

    item.appendChild(orderSpan);
    item.appendChild(titleSpan);
    item.appendChild(tierBadge);

    item.addEventListener('click', () => this.navigateToStep(step.id));

    return item;
  }

  /**
   * Update the step indicator display.
   */
  private updateStepIndicator(): void {
    if (!this.currentStep) {
      this.stepCountElement.textContent = 'Step 0 of 0';
      this.stepTitleElement.textContent = '';
      return;
    }

    const currentIndex = this.steps.findIndex((s) => s.id === this.currentStep!.id);
    this.stepCountElement.textContent = `Step ${currentIndex + 1} of ${this.steps.length}`;
    this.stepTitleElement.textContent = this.currentStep.title;
  }

  /**
   * Update navigation button states.
   */
  private updateNavigationState(): void {
    if (!this.currentStep || this.steps.length === 0) {
      this.prevButton.disabled = true;
      this.nextButton.disabled = true;
      return;
    }

    const currentIndex = this.steps.findIndex((s) => s.id === this.currentStep!.id);
    this.prevButton.disabled = currentIndex <= 0;
    this.nextButton.disabled = currentIndex >= this.steps.length - 1;
  }

  /**
   * Update current step highlight in concept list.
   */
  private updateCurrentHighlight(): void {
    const items = this.stepListElement.querySelectorAll('.wizard-nav-step-item');
    for (const item of items) {
      const button = item as HTMLButtonElement;
      if (this.currentStep && button.dataset.stepId === this.currentStep.id) {
        button.classList.add('wizard-nav-step-item--current');
      } else {
        button.classList.remove('wizard-nav-step-item--current');
      }
    }
  }

  /**
   * Get the currently selected tier filter.
   */
  getCurrentTierFilter(): ComplexityTier | 'all' {
    return this.currentTierFilter;
  }

  /**
   * Check if the concept list is open.
   */
  isOpen(): boolean {
    return this.isConceptListOpen;
  }

  /**
   * Dispose the navigator and clean up resources.
   */
  dispose(): void {
    this.navigateCallbacks = [];
    this.tierTabs.clear();
    this.steps = [];
    this.currentStep = null;

    if (this.rootElement.parentElement === this.container) {
      this.container.removeChild(this.rootElement);
    }
  }
}
