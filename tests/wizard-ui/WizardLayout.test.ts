/**
 * WizardLayout Unit Tests
 *
 * Tests the wizard layout component for story-015:
 * - AC1: Split-view layout displays demo and content simultaneously
 * - AC2: Layout uses CSS Grid for structure
 * - AC3: Layout is responsive to minimum 1024px width
 * - AC4: Navigation header is visible
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  WizardLayout,
  getWizardLayoutStyles,
  injectWizardLayoutStyles,
} from '../../src/wizard-ui/WizardLayout';

describe('WizardLayout', () => {
  let container: HTMLElement;
  let layout: WizardLayout | undefined;

  beforeEach(() => {
    container = document.createElement('div');
    container.id = 'test-container';
    document.body.appendChild(container);
    layout = undefined; // Reset layout for each test
  });

  afterEach(() => {
    if (layout) {
      layout.dispose();
      layout = undefined;
    }
    if (container.parentNode) {
      document.body.removeChild(container);
    }
  });

  describe('constructor', () => {
    it('should create layout structure', () => {
      layout = new WizardLayout(container);

      expect(container.querySelector('.wizard-layout')).toBeTruthy();
    });

    it('should create all layout areas (AC1)', () => {
      layout = new WizardLayout(container);

      expect(container.querySelector('.wizard-layout-header')).toBeTruthy();
      expect(container.querySelector('.wizard-layout-viewport')).toBeTruthy();
      expect(container.querySelector('.wizard-layout-panel')).toBeTruthy();
      expect(container.querySelector('.wizard-layout-footer')).toBeTruthy();
    });

    it('should inject styles automatically', () => {
      layout = new WizardLayout(container);

      const styleElement = document.getElementById('wizard-layout-styles');
      expect(styleElement).toBeTruthy();
    });
  });

  describe('getWizardLayoutStyles()', () => {
    it('should return CSS Grid styles (AC2)', () => {
      const styles = getWizardLayoutStyles();

      expect(styles).toContain('display: grid');
      expect(styles).toContain('grid-template-rows');
      expect(styles).toContain('grid-template-columns');
      expect(styles).toContain('grid-template-areas');
    });

    it('should include min-width 1024px (AC3)', () => {
      const styles = getWizardLayoutStyles();

      expect(styles).toContain('min-width: 1024px');
    });

    it('should define all grid areas', () => {
      const styles = getWizardLayoutStyles();

      expect(styles).toContain('grid-area: header');
      expect(styles).toContain('grid-area: viewport');
      expect(styles).toContain('grid-area: panel');
      expect(styles).toContain('grid-area: footer');
    });
  });

  describe('getViewportContainer()', () => {
    it('should return viewport element', () => {
      layout = new WizardLayout(container);

      const viewport = layout.getViewportContainer();

      expect(viewport).toBeTruthy();
      expect(viewport.className).toBe('wizard-layout-viewport');
    });
  });

  describe('getPanelContainer()', () => {
    it('should return panel content element', () => {
      layout = new WizardLayout(container);

      const panel = layout.getPanelContainer();

      expect(panel).toBeTruthy();
      expect(panel.className).toBe('wizard-layout-panel-content');
    });
  });

  describe('getHeaderContainer()', () => {
    it('should return header element (AC4)', () => {
      layout = new WizardLayout(container);

      const header = layout.getHeaderContainer();

      expect(header).toBeTruthy();
      expect(header.className).toBe('wizard-layout-header');
    });
  });

  describe('getFooterContainer()', () => {
    it('should return footer element', () => {
      layout = new WizardLayout(container);

      const footer = layout.getFooterContainer();

      expect(footer).toBeTruthy();
      expect(footer.className).toBe('wizard-layout-footer');
    });
  });

  describe('Navigation (AC4)', () => {
    it('should have prev and next buttons', () => {
      layout = new WizardLayout(container);

      const prevButton = container.querySelector('.wizard-layout-nav-button');
      const buttons = container.querySelectorAll('.wizard-layout-nav-button');

      expect(buttons.length).toBe(2);
      expect(prevButton?.textContent).toContain('Prev');
    });

    it('should have step title display', () => {
      layout = new WizardLayout(container);

      const title = container.querySelector('.wizard-layout-header-title');

      expect(title).toBeTruthy();
    });
  });

  describe('setStepInfo()', () => {
    it('should update step title', () => {
      layout = new WizardLayout(container);

      layout.setStepInfo(3, 15, 'Particle Emission');

      const title = container.querySelector('.wizard-layout-header-title');
      expect(title?.textContent).toBe('Step 3 of 15: Particle Emission');
    });

    it('should work without title', () => {
      layout = new WizardLayout(container);

      layout.setStepInfo(1, 5);

      const title = container.querySelector('.wizard-layout-header-title');
      expect(title?.textContent).toBe('Step 1 of 5');
    });
  });

  describe('setNavigationState()', () => {
    it('should disable prev button when canPrev is false', () => {
      layout = new WizardLayout(container);

      layout.setNavigationState(false, true);

      const buttons = container.querySelectorAll(
        '.wizard-layout-nav-button'
      ) as NodeListOf<HTMLButtonElement>;
      expect(buttons[0].disabled).toBe(true);
      expect(buttons[1].disabled).toBe(false);
    });

    it('should disable next button when canNext is false', () => {
      layout = new WizardLayout(container);

      layout.setNavigationState(true, false);

      const buttons = container.querySelectorAll(
        '.wizard-layout-nav-button'
      ) as NodeListOf<HTMLButtonElement>;
      expect(buttons[0].disabled).toBe(false);
      expect(buttons[1].disabled).toBe(true);
    });
  });

  describe('onPrevious() / onNext()', () => {
    it('should call callback when prev button clicked', () => {
      layout = new WizardLayout(container);
      const callback = vi.fn();

      layout.onPrevious(callback);

      const buttons = container.querySelectorAll('.wizard-layout-nav-button');
      (buttons[0] as HTMLButtonElement).click();

      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('should call callback when next button clicked', () => {
      layout = new WizardLayout(container);
      const callback = vi.fn();

      layout.onNext(callback);

      const buttons = container.querySelectorAll('.wizard-layout-nav-button');
      (buttons[1] as HTMLButtonElement).click();

      expect(callback).toHaveBeenCalledTimes(1);
    });
  });

  describe('Tier Navigation', () => {
    it('should have three tier buttons', () => {
      layout = new WizardLayout(container);

      const tierButtons = container.querySelectorAll('.wizard-layout-tier-button');

      expect(tierButtons.length).toBe(3);
    });

    it('should have micro tier active by default', () => {
      layout = new WizardLayout(container);

      const microButton = container.querySelector('[data-tier="micro"]');

      expect(microButton?.classList.contains('wizard-layout-tier-button--active')).toBe(true);
    });
  });

  describe('setActiveTier()', () => {
    it('should activate the specified tier', () => {
      layout = new WizardLayout(container);

      layout.setActiveTier('advanced');

      const advancedButton = container.querySelector('[data-tier="advanced"]');
      const microButton = container.querySelector('[data-tier="micro"]');

      expect(advancedButton?.classList.contains('wizard-layout-tier-button--active')).toBe(true);
      expect(microButton?.classList.contains('wizard-layout-tier-button--active')).toBe(false);
    });
  });

  describe('onTierSelect()', () => {
    it('should call callback with tier id when tier button clicked', () => {
      layout = new WizardLayout(container);
      const callback = vi.fn();

      layout.onTierSelect(callback);

      const mediumButton = container.querySelector('[data-tier="medium"]') as HTMLButtonElement;
      mediumButton.click();

      expect(callback).toHaveBeenCalledWith('medium');
    });
  });

  describe('dispose()', () => {
    it('should remove layout from container', () => {
      const testLayout = new WizardLayout(container);

      testLayout.dispose();

      expect(container.querySelector('.wizard-layout')).toBeNull();
      // Note: Not assigning to layout since we already disposed it
    });
  });

  describe('injectWizardLayoutStyles()', () => {
    it('should inject styles only once', () => {
      // First call happens in constructor
      layout = new WizardLayout(container);

      // Call again
      injectWizardLayoutStyles();

      const styleElements = document.querySelectorAll('#wizard-layout-styles');
      expect(styleElements.length).toBe(1);
    });
  });
});
