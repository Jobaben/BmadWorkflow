/**
 * Wizard Layout Component
 *
 * Provides the split-view layout for the wizard learning experience.
 * Uses CSS Grid to create a responsive layout with header, demo viewport,
 * learning panel, and footer areas.
 *
 * @see FR-007 (Integrated Demo Rendering)
 * @see NFR-006 (Desktop Responsiveness)
 * @see ADR-004 (CSS Grid Layout for Split View)
 */

/**
 * CSS styles for the wizard layout.
 */
export function getWizardLayoutStyles(): string {
  return `
    .wizard-layout {
      display: grid;
      grid-template-rows: auto 1fr auto;
      grid-template-columns: 1fr 1fr;
      grid-template-areas:
        "header header"
        "viewport panel"
        "footer footer";
      width: 100%;
      height: 100%;
      min-width: 1024px;
      background-color: #0d1117;
      color: #c9d1d9;
    }

    .wizard-layout-header {
      grid-area: header;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 24px;
      background-color: #161b22;
      border-bottom: 1px solid #30363d;
      min-height: 56px;
    }

    .wizard-layout-header-nav {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .wizard-layout-header-title {
      font-size: 16px;
      font-weight: 500;
      color: #c9d1d9;
    }

    .wizard-layout-nav-button {
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

    .wizard-layout-nav-button:hover {
      background-color: rgba(255, 255, 255, 0.12);
      border-color: rgba(255, 255, 255, 0.25);
    }

    .wizard-layout-nav-button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .wizard-layout-viewport {
      grid-area: viewport;
      display: flex;
      flex-direction: column;
      background-color: #000;
      border-right: 1px solid #30363d;
      overflow: hidden;
      position: relative;
    }

    .wizard-layout-panel {
      grid-area: panel;
      display: flex;
      flex-direction: column;
      background-color: #0d1117;
      overflow-y: auto;
      overflow-x: hidden;
    }

    .wizard-layout-panel-content {
      flex: 1;
      padding: 24px;
      overflow-y: auto;
    }

    .wizard-layout-footer {
      grid-area: footer;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 12px 24px;
      background-color: #161b22;
      border-top: 1px solid #30363d;
      min-height: 48px;
    }

    .wizard-layout-tier-nav {
      display: flex;
      align-items: center;
      gap: 24px;
    }

    .wizard-layout-tier-button {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 12px;
      background: none;
      border: none;
      color: #8b949e;
      font-family: inherit;
      font-size: 14px;
      cursor: pointer;
      transition: color 0.15s ease;
    }

    .wizard-layout-tier-button:hover {
      color: #c9d1d9;
    }

    .wizard-layout-tier-button--active {
      color: #58a6ff;
    }

    .wizard-layout-tier-indicator {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      border: 2px solid currentColor;
    }

    .wizard-layout-tier-button--active .wizard-layout-tier-indicator {
      background-color: currentColor;
    }

    /* Responsive adjustments for smaller desktops */
    @media (max-width: 1200px) {
      .wizard-layout-header {
        padding: 10px 16px;
      }

      .wizard-layout-panel-content {
        padding: 16px;
      }
    }
  `;
}

/**
 * Check if styles have been injected.
 */
let wizardLayoutStylesInjected = false;

/**
 * Inject wizard layout styles into the document head.
 */
export function injectWizardLayoutStyles(): void {
  if (wizardLayoutStylesInjected || typeof document === 'undefined') {
    return;
  }

  const styleElement = document.createElement('style');
  styleElement.id = 'wizard-layout-styles';
  styleElement.textContent = getWizardLayoutStyles();
  document.head.appendChild(styleElement);
  wizardLayoutStylesInjected = true;
}

/**
 * WizardLayout manages the split-view layout for the wizard experience.
 *
 * Layout structure:
 * ```
 * ┌────────────────────────────────────────────────────────┐
 * │  [◀ Prev]   Step X of Y: Title              [Next ▶]   │ <- Header
 * ├──────────────────────────┬─────────────────────────────┤
 * │                          │                             │
 * │     3D Demo Viewport     │      Learning Panel         │ <- Main
 * │     (Canvas + Controls)  │      (Content + Code)       │
 * │                          │                             │
 * ├──────────────────────────┴─────────────────────────────┤
 * │  ● Micro    ○ Medium    ○ Advanced                     │ <- Footer
 * └────────────────────────────────────────────────────────┘
 * ```
 *
 * @example
 * ```typescript
 * const layout = new WizardLayout(document.getElementById('app')!);
 * const viewport = layout.getViewportContainer();
 * const panel = layout.getPanelContainer();
 * ```
 */
export class WizardLayout {
  private container: HTMLElement;
  private rootElement: HTMLElement;
  private headerElement: HTMLElement;
  private viewportElement: HTMLElement;
  private panelElement: HTMLElement;
  private panelContentElement: HTMLElement;
  private footerElement: HTMLElement;

  // Navigation elements
  private prevButton: HTMLButtonElement;
  private nextButton: HTMLButtonElement;
  private stepTitle: HTMLElement;

  // Tier navigation
  private tierButtons: Map<string, HTMLButtonElement> = new Map();

  /**
   * Create a new WizardLayout.
   *
   * @param container - The HTML element to render the layout into
   */
  constructor(container: HTMLElement) {
    this.container = container;

    // Inject styles
    injectWizardLayoutStyles();

    // Create layout structure
    this.rootElement = this.createRootElement();
    this.headerElement = this.createHeader();
    this.viewportElement = this.createViewport();
    this.panelElement = this.createPanel();
    this.footerElement = this.createFooter();

    // Create navigation elements
    const navElements = this.createNavigationElements();
    this.prevButton = navElements.prevButton;
    this.nextButton = navElements.nextButton;
    this.stepTitle = navElements.stepTitle;

    // Assemble the layout
    this.assembleLayout();

    // Create panel content area
    this.panelContentElement = document.createElement('div');
    this.panelContentElement.className = 'wizard-layout-panel-content';
    this.panelElement.appendChild(this.panelContentElement);

    // Add to container
    this.container.appendChild(this.rootElement);
  }

  /**
   * Create the root grid container.
   */
  private createRootElement(): HTMLElement {
    const root = document.createElement('div');
    root.className = 'wizard-layout';
    return root;
  }

  /**
   * Create the header area.
   */
  private createHeader(): HTMLElement {
    const header = document.createElement('header');
    header.className = 'wizard-layout-header';
    return header;
  }

  /**
   * Create navigation elements for the header.
   */
  private createNavigationElements(): {
    prevButton: HTMLButtonElement;
    nextButton: HTMLButtonElement;
    stepTitle: HTMLElement;
  } {
    const prevButton = document.createElement('button');
    prevButton.className = 'wizard-layout-nav-button';
    prevButton.innerHTML = '&#9664; Prev';
    prevButton.type = 'button';

    const nextButton = document.createElement('button');
    nextButton.className = 'wizard-layout-nav-button';
    nextButton.innerHTML = 'Next &#9654;';
    nextButton.type = 'button';

    const stepTitle = document.createElement('span');
    stepTitle.className = 'wizard-layout-header-title';
    stepTitle.textContent = 'Step 1 of 1';

    return { prevButton, nextButton, stepTitle };
  }

  /**
   * Create the viewport area for the demo.
   */
  private createViewport(): HTMLElement {
    const viewport = document.createElement('div');
    viewport.className = 'wizard-layout-viewport';
    return viewport;
  }

  /**
   * Create the panel area for learning content.
   */
  private createPanel(): HTMLElement {
    const panel = document.createElement('div');
    panel.className = 'wizard-layout-panel';
    return panel;
  }

  /**
   * Create the footer area with tier navigation.
   */
  private createFooter(): HTMLElement {
    const footer = document.createElement('footer');
    footer.className = 'wizard-layout-footer';

    const tierNav = document.createElement('div');
    tierNav.className = 'wizard-layout-tier-nav';

    const tiers = [
      { id: 'micro', label: 'Micro Concepts' },
      { id: 'medium', label: 'Medium Concepts' },
      { id: 'advanced', label: 'Advanced' },
    ];

    for (const tier of tiers) {
      const button = document.createElement('button');
      button.className = 'wizard-layout-tier-button';
      button.type = 'button';
      button.dataset.tier = tier.id;

      const indicator = document.createElement('span');
      indicator.className = 'wizard-layout-tier-indicator';

      button.appendChild(indicator);
      button.appendChild(document.createTextNode(tier.label));
      tierNav.appendChild(button);

      this.tierButtons.set(tier.id, button);
    }

    // Set first tier as active by default
    const firstTierButton = this.tierButtons.get('micro');
    if (firstTierButton) {
      firstTierButton.classList.add('wizard-layout-tier-button--active');
    }

    footer.appendChild(tierNav);
    return footer;
  }

  /**
   * Assemble the layout structure.
   */
  private assembleLayout(): void {
    // Build header with navigation
    const leftNav = document.createElement('div');
    leftNav.className = 'wizard-layout-header-nav';
    leftNav.appendChild(this.prevButton);

    const rightNav = document.createElement('div');
    rightNav.className = 'wizard-layout-header-nav';
    rightNav.appendChild(this.nextButton);

    this.headerElement.appendChild(leftNav);
    this.headerElement.appendChild(this.stepTitle);
    this.headerElement.appendChild(rightNav);

    // Add all sections to root
    this.rootElement.appendChild(this.headerElement);
    this.rootElement.appendChild(this.viewportElement);
    this.rootElement.appendChild(this.panelElement);
    this.rootElement.appendChild(this.footerElement);
  }

  /**
   * Get the container element for the demo viewport.
   * Use this to attach the 3D canvas.
   */
  getViewportContainer(): HTMLElement {
    return this.viewportElement;
  }

  /**
   * Get the container element for the learning panel.
   * Use this to render learning content.
   */
  getPanelContainer(): HTMLElement {
    return this.panelContentElement;
  }

  /**
   * Get the header container element.
   */
  getHeaderContainer(): HTMLElement {
    return this.headerElement;
  }

  /**
   * Get the footer container element.
   */
  getFooterContainer(): HTMLElement {
    return this.footerElement;
  }

  /**
   * Update the step title display.
   *
   * @param currentStep - Current step number (1-indexed)
   * @param totalSteps - Total number of steps
   * @param title - Optional step title to display
   */
  setStepInfo(currentStep: number, totalSteps: number, title?: string): void {
    const titleText = title
      ? `Step ${currentStep} of ${totalSteps}: ${title}`
      : `Step ${currentStep} of ${totalSteps}`;
    this.stepTitle.textContent = titleText;
  }

  /**
   * Set the enabled state of navigation buttons.
   */
  setNavigationState(canPrev: boolean, canNext: boolean): void {
    this.prevButton.disabled = !canPrev;
    this.nextButton.disabled = !canNext;
  }

  /**
   * Set a callback for the previous button.
   */
  onPrevious(callback: () => void): void {
    this.prevButton.addEventListener('click', callback);
  }

  /**
   * Set a callback for the next button.
   */
  onNext(callback: () => void): void {
    this.nextButton.addEventListener('click', callback);
  }

  /**
   * Set the active tier in the footer navigation.
   */
  setActiveTier(tierId: string): void {
    for (const [id, button] of this.tierButtons) {
      if (id === tierId) {
        button.classList.add('wizard-layout-tier-button--active');
      } else {
        button.classList.remove('wizard-layout-tier-button--active');
      }
    }
  }

  /**
   * Set a callback for tier button clicks.
   */
  onTierSelect(callback: (tierId: string) => void): void {
    for (const [id, button] of this.tierButtons) {
      button.addEventListener('click', () => callback(id));
    }
  }

  /**
   * Dispose the layout and clean up resources.
   */
  dispose(): void {
    this.container.removeChild(this.rootElement);
    this.tierButtons.clear();
  }
}
