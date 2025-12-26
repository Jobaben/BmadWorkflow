/**
 * DemoSelector - Navigation UI for switching between demos
 *
 * Provides a simple button-based interface for selecting which demo to display.
 * Uses vanilla DOM manipulation following ADR-002 (no framework).
 *
 * Features:
 * - Displays available demos as clickable buttons
 * - Visually indicates the currently selected demo
 * - Emits events when selection changes
 * - Non-obtrusive positioning (top-right corner)
 */

import type { DemoType, DemoInfo } from '../types';

/**
 * Callback type for demo selection events.
 */
export type DemoSelectCallback = (id: DemoType) => void;

/**
 * DemoSelector component for navigating between demos.
 *
 * @example
 * ```typescript
 * const selector = new DemoSelector(container);
 * selector.setDemos([
 *   { id: DemoType.Particles, label: 'Particles' },
 *   { id: DemoType.Objects, label: 'Objects' },
 * ]);
 * selector.onSelect((id) => console.log('Selected:', id));
 * ```
 */
export class DemoSelector {
  /** Container element for the selector */
  private readonly container: HTMLElement;

  /** Root element of the selector UI */
  private readonly element: HTMLElement;

  /** Map of demo IDs to their button elements */
  private readonly buttonMap: Map<DemoType, HTMLButtonElement> = new Map();

  /** Currently selected demo ID */
  private selectedId: DemoType | null = null;

  /** Registered selection callbacks */
  private readonly callbacks: DemoSelectCallback[] = [];

  /**
   * Creates a new DemoSelector instance.
   *
   * @param container - The HTML element to append the selector to
   */
  constructor(container: HTMLElement) {
    this.container = container;

    // Create the root element
    this.element = document.createElement('div');
    this.element.className = 'demo-selector';

    // Add title
    const title = document.createElement('div');
    title.className = 'demo-selector__title';
    title.textContent = 'Demos';
    this.element.appendChild(title);

    // Create button container
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'demo-selector__buttons';
    this.element.appendChild(buttonContainer);

    // Append to container
    this.container.appendChild(this.element);
  }

  /**
   * Sets the available demos to display.
   * Clears any existing buttons and creates new ones.
   *
   * @param demos - Array of demo information objects
   */
  setDemos(demos: DemoInfo[]): void {
    // Clear existing buttons
    this.buttonMap.clear();
    const buttonContainer = this.element.querySelector('.demo-selector__buttons');
    if (buttonContainer) {
      buttonContainer.innerHTML = '';

      // Create a button for each demo
      demos.forEach((demo) => {
        const button = this.createButton(demo);
        buttonContainer.appendChild(button);
        this.buttonMap.set(demo.id, button);
      });

      // If we had a selection, try to restore it
      if (this.selectedId && this.buttonMap.has(this.selectedId)) {
        this.updateVisualSelection(this.selectedId);
      }
    }
  }

  /**
   * Sets the currently selected demo.
   * Updates visual state without emitting an event.
   *
   * @param id - The demo type to select
   */
  setSelected(id: DemoType): void {
    if (!this.buttonMap.has(id)) {
      console.warn(`DemoSelector: Unknown demo type "${id}"`);
      return;
    }

    this.updateVisualSelection(id);
    this.selectedId = id;
  }

  /**
   * Registers a callback for demo selection events.
   *
   * @param callback - Function to call when a demo is selected
   */
  onSelect(callback: DemoSelectCallback): void {
    this.callbacks.push(callback);
  }

  /**
   * Gets the currently selected demo ID.
   *
   * @returns The selected demo ID, or null if none selected
   */
  getSelected(): DemoType | null {
    return this.selectedId;
  }

  /**
   * Shows the demo selector.
   */
  show(): void {
    this.element.style.display = 'block';
  }

  /**
   * Hides the demo selector.
   */
  hide(): void {
    this.element.style.display = 'none';
  }

  /**
   * Removes the demo selector from the DOM and cleans up.
   */
  dispose(): void {
    this.callbacks.length = 0;
    this.buttonMap.clear();
    this.element.remove();
  }

  /**
   * Creates a button element for a demo.
   *
   * @param demo - The demo information
   * @returns The created button element
   */
  private createButton(demo: DemoInfo): HTMLButtonElement {
    const button = document.createElement('button');
    button.className = 'demo-selector__button';
    button.textContent = demo.label;
    button.dataset.demoId = demo.id;

    // Add tooltip if description is provided
    if (demo.description) {
      button.title = demo.description;
    }

    // Add click handler
    button.addEventListener('click', () => {
      this.handleButtonClick(demo.id);
    });

    return button;
  }

  /**
   * Handles a button click event.
   *
   * @param id - The clicked demo's ID
   */
  private handleButtonClick(id: DemoType): void {
    // Skip if already selected (no-op for clicking current selection)
    if (id === this.selectedId) {
      return;
    }

    // Update visual state
    this.updateVisualSelection(id);
    this.selectedId = id;

    // Emit selection event
    this.emitSelect(id);
  }

  /**
   * Updates the visual selection state.
   *
   * @param id - The demo ID to show as selected
   */
  private updateVisualSelection(id: DemoType): void {
    // Remove active class from previously selected button
    if (this.selectedId) {
      const prevButton = this.buttonMap.get(this.selectedId);
      if (prevButton) {
        prevButton.classList.remove('demo-selector__button--active');
      }
    }

    // Add active class to newly selected button
    const newButton = this.buttonMap.get(id);
    if (newButton) {
      newButton.classList.add('demo-selector__button--active');
    }
  }

  /**
   * Emits a selection event to all registered callbacks.
   *
   * @param id - The selected demo ID
   */
  private emitSelect(id: DemoType): void {
    this.callbacks.forEach((callback) => {
      try {
        callback(id);
      } catch (error) {
        console.error('DemoSelector: Error in selection callback:', error);
      }
    });
  }
}
