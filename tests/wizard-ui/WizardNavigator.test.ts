/**
 * WizardNavigator Unit Tests
 *
 * Tests the wizard navigator component for story-016:
 * - AC1: Previous and Next buttons navigate between steps
 * - AC2: Current step position is clearly shown
 * - AC3: Step title is displayed
 * - AC4: Concept list allows direct navigation
 * - AC5: Complexity tier is indicated
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  WizardNavigator,
  getWizardNavigatorStyles,
  injectWizardNavigatorStyles,
} from '../../src/wizard-ui/WizardNavigator';
import type { WizardStep } from '../../src/wizard/types';
import { ComplexityTier } from '../../src/wizard/types';
import { DemoType } from '../../src/types';

// Helper to create mock steps
function createMockSteps(count: number): WizardStep[] {
  const tiers: ComplexityTier[] = [ComplexityTier.Micro, ComplexityTier.Medium, ComplexityTier.Advanced];
  return Array.from({ length: count }, (_, i) => ({
    id: `step-${i + 1}`,
    title: `Step ${i + 1} Title`,
    tier: tiers[i % 3],
    demoType: DemoType.Particles,
    description: `Description for step ${i + 1}`,
    learningObjectives: ['Objective 1'],
    codeSnippets: [],
    annotations: [],
    order: i + 1,
  }));
}

describe('WizardNavigator', () => {
  let container: HTMLElement;
  let navigator: WizardNavigator;
  let mockSteps: WizardStep[];

  beforeEach(() => {
    container = document.createElement('div');
    container.id = 'test-container';
    document.body.appendChild(container);
    mockSteps = createMockSteps(5);
  });

  afterEach(() => {
    if (navigator) {
      navigator.dispose();
    }
    document.body.removeChild(container);
  });

  describe('constructor', () => {
    it('should create navigator structure', () => {
      navigator = new WizardNavigator(container);

      expect(container.querySelector('.wizard-navigator')).toBeTruthy();
    });

    it('should create navigation buttons', () => {
      navigator = new WizardNavigator(container);

      expect(container.querySelector('.wizard-nav-button')).toBeTruthy();
      const buttons = container.querySelectorAll('.wizard-nav-button');
      expect(buttons.length).toBe(2);
    });

    it('should inject styles automatically', () => {
      navigator = new WizardNavigator(container);

      const styleElement = document.getElementById('wizard-navigator-styles');
      expect(styleElement).toBeTruthy();
    });
  });

  describe('getWizardNavigatorStyles()', () => {
    it('should return navigator styles', () => {
      const styles = getWizardNavigatorStyles();

      expect(styles).toContain('.wizard-navigator');
      expect(styles).toContain('.wizard-nav-button');
      expect(styles).toContain('.wizard-nav-step-count');
    });

    it('should include tier badge styles (AC5)', () => {
      const styles = getWizardNavigatorStyles();

      expect(styles).toContain('.wizard-nav-tier-badge--micro');
      expect(styles).toContain('.wizard-nav-tier-badge--medium');
      expect(styles).toContain('.wizard-nav-tier-badge--advanced');
    });
  });

  describe('setSteps()', () => {
    it('should accept steps array', () => {
      navigator = new WizardNavigator(container);

      expect(() => navigator.setSteps(mockSteps)).not.toThrow();
    });

    it('should update tier counts', () => {
      navigator = new WizardNavigator(container);

      navigator.setSteps(mockSteps);

      const tierCounts = container.querySelectorAll('.wizard-nav-tier-count');
      // All tab should show total count
      expect(tierCounts[0].textContent).toBe('5');
    });
  });

  describe('setCurrentStep()', () => {
    it('should update step indicator (AC2)', () => {
      navigator = new WizardNavigator(container);
      navigator.setSteps(mockSteps);

      navigator.setCurrentStep(mockSteps[2]);

      const stepCount = container.querySelector('.wizard-nav-step-count');
      expect(stepCount?.textContent).toBe('Step 3 of 5');
    });

    it('should display step title (AC3)', () => {
      navigator = new WizardNavigator(container);
      navigator.setSteps(mockSteps);

      navigator.setCurrentStep(mockSteps[0]);

      const stepTitle = container.querySelector('.wizard-nav-step-title');
      expect(stepTitle?.textContent).toBe('Step 1 Title');
    });
  });

  describe('Navigation Buttons (AC1)', () => {
    it('should disable previous button on first step', () => {
      navigator = new WizardNavigator(container);
      navigator.setSteps(mockSteps);
      navigator.setCurrentStep(mockSteps[0]);

      const buttons = container.querySelectorAll('.wizard-nav-button') as NodeListOf<HTMLButtonElement>;
      expect(buttons[0].disabled).toBe(true); // Previous
      expect(buttons[1].disabled).toBe(false); // Next
    });

    it('should disable next button on last step', () => {
      navigator = new WizardNavigator(container);
      navigator.setSteps(mockSteps);
      navigator.setCurrentStep(mockSteps[4]);

      const buttons = container.querySelectorAll('.wizard-nav-button') as NodeListOf<HTMLButtonElement>;
      expect(buttons[0].disabled).toBe(false); // Previous
      expect(buttons[1].disabled).toBe(true); // Next
    });

    it('should enable both buttons for middle steps', () => {
      navigator = new WizardNavigator(container);
      navigator.setSteps(mockSteps);
      navigator.setCurrentStep(mockSteps[2]);

      const buttons = container.querySelectorAll('.wizard-nav-button') as NodeListOf<HTMLButtonElement>;
      expect(buttons[0].disabled).toBe(false);
      expect(buttons[1].disabled).toBe(false);
    });

    it('should emit navigate event when next clicked', () => {
      navigator = new WizardNavigator(container);
      navigator.setSteps(mockSteps);
      navigator.setCurrentStep(mockSteps[0]);
      const callback = vi.fn();

      navigator.onNavigate(callback);
      const buttons = container.querySelectorAll('.wizard-nav-button') as NodeListOf<HTMLButtonElement>;
      buttons[1].click(); // Next button

      expect(callback).toHaveBeenCalledWith('step-2');
    });

    it('should emit navigate event when previous clicked', () => {
      navigator = new WizardNavigator(container);
      navigator.setSteps(mockSteps);
      navigator.setCurrentStep(mockSteps[2]);
      const callback = vi.fn();

      navigator.onNavigate(callback);
      const buttons = container.querySelectorAll('.wizard-nav-button') as NodeListOf<HTMLButtonElement>;
      buttons[0].click(); // Previous button

      expect(callback).toHaveBeenCalledWith('step-2');
    });
  });

  describe('Concept List (AC4)', () => {
    it('should have concept toggle button', () => {
      navigator = new WizardNavigator(container);

      const toggle = container.querySelector('.wizard-nav-concept-toggle');
      expect(toggle).toBeTruthy();
    });

    it('should toggle concept list on click', () => {
      navigator = new WizardNavigator(container);

      const toggle = container.querySelector('.wizard-nav-concept-toggle') as HTMLButtonElement;
      const list = container.querySelector('.wizard-nav-concept-list');

      expect(list?.classList.contains('wizard-nav-concept-list--open')).toBe(false);

      toggle.click();

      expect(list?.classList.contains('wizard-nav-concept-list--open')).toBe(true);
    });

    it('should show all steps in concept list', () => {
      navigator = new WizardNavigator(container);
      navigator.setSteps(mockSteps);

      // Open the list
      const toggle = container.querySelector('.wizard-nav-concept-toggle') as HTMLButtonElement;
      toggle.click();

      const stepItems = container.querySelectorAll('.wizard-nav-step-item');
      expect(stepItems.length).toBe(5);
    });

    it('should navigate on step item click', () => {
      navigator = new WizardNavigator(container);
      navigator.setSteps(mockSteps);
      navigator.setCurrentStep(mockSteps[0]);
      const callback = vi.fn();

      navigator.onNavigate(callback);

      // Open the list
      const toggle = container.querySelector('.wizard-nav-concept-toggle') as HTMLButtonElement;
      toggle.click();

      // Click on step 3
      const stepItems = container.querySelectorAll('.wizard-nav-step-item') as NodeListOf<HTMLButtonElement>;
      stepItems[2].click();

      expect(callback).toHaveBeenCalledWith('step-3');
    });

    it('should close concept list after navigation', () => {
      navigator = new WizardNavigator(container);
      navigator.setSteps(mockSteps);
      navigator.setCurrentStep(mockSteps[0]);

      // Open the list
      const toggle = container.querySelector('.wizard-nav-concept-toggle') as HTMLButtonElement;
      toggle.click();
      expect(navigator.isOpen()).toBe(true);

      // Click on a step
      const stepItems = container.querySelectorAll('.wizard-nav-step-item') as NodeListOf<HTMLButtonElement>;
      stepItems[2].click();

      expect(navigator.isOpen()).toBe(false);
    });

    it('should highlight current step in list', () => {
      navigator = new WizardNavigator(container);
      navigator.setSteps(mockSteps);
      navigator.setCurrentStep(mockSteps[2]);

      // Open the list
      const toggle = container.querySelector('.wizard-nav-concept-toggle') as HTMLButtonElement;
      toggle.click();

      const currentItem = container.querySelector('.wizard-nav-step-item--current');
      expect(currentItem).toBeTruthy();
      expect((currentItem as HTMLButtonElement).dataset.stepId).toBe('step-3');
    });
  });

  describe('Tier Badges (AC5)', () => {
    it('should display tier badge for each step', () => {
      navigator = new WizardNavigator(container);
      navigator.setSteps(mockSteps);

      // Open the list
      const toggle = container.querySelector('.wizard-nav-concept-toggle') as HTMLButtonElement;
      toggle.click();

      const tierBadges = container.querySelectorAll('.wizard-nav-tier-badge');
      expect(tierBadges.length).toBe(5);
    });

    it('should apply correct tier class', () => {
      navigator = new WizardNavigator(container);
      navigator.setSteps(mockSteps);

      // Open the list
      const toggle = container.querySelector('.wizard-nav-concept-toggle') as HTMLButtonElement;
      toggle.click();

      const microBadge = container.querySelector('.wizard-nav-tier-badge--micro');
      const mediumBadge = container.querySelector('.wizard-nav-tier-badge--medium');
      const advancedBadge = container.querySelector('.wizard-nav-tier-badge--advanced');

      expect(microBadge).toBeTruthy();
      expect(mediumBadge).toBeTruthy();
      expect(advancedBadge).toBeTruthy();
    });
  });

  describe('Tier Filter', () => {
    it('should have tier tabs', () => {
      navigator = new WizardNavigator(container);

      const tierTabs = container.querySelectorAll('.wizard-nav-tier-tab');
      expect(tierTabs.length).toBe(4); // All, Micro, Medium, Advanced
    });

    it('should filter steps by tier', () => {
      navigator = new WizardNavigator(container);
      navigator.setSteps(mockSteps);

      // Open the list
      const toggle = container.querySelector('.wizard-nav-concept-toggle') as HTMLButtonElement;
      toggle.click();

      // Click on Micro tab
      const microTab = container.querySelector('[data-tier="micro"]') as HTMLButtonElement;
      microTab.click();

      // Should only show micro steps
      const stepItems = container.querySelectorAll('.wizard-nav-step-item');
      expect(stepItems.length).toBe(2); // Steps 1 and 4 are micro
    });

    it('should show all steps when All tab clicked', () => {
      navigator = new WizardNavigator(container);
      navigator.setSteps(mockSteps);

      // Open the list
      const toggle = container.querySelector('.wizard-nav-concept-toggle') as HTMLButtonElement;
      toggle.click();

      // Click on Micro tab first
      const microTab = container.querySelector('[data-tier="micro"]') as HTMLButtonElement;
      microTab.click();

      // Then click All tab
      const allTab = container.querySelector('[data-tier="all"]') as HTMLButtonElement;
      allTab.click();

      const stepItems = container.querySelectorAll('.wizard-nav-step-item');
      expect(stepItems.length).toBe(5);
    });

    it('should update active tab styling', () => {
      navigator = new WizardNavigator(container);
      navigator.setSteps(mockSteps);

      // Open the list
      const toggle = container.querySelector('.wizard-nav-concept-toggle') as HTMLButtonElement;
      toggle.click();

      // Click on Medium tab
      const mediumTab = container.querySelector('[data-tier="medium"]') as HTMLButtonElement;
      mediumTab.click();

      expect(mediumTab.classList.contains('wizard-nav-tier-tab--active')).toBe(true);
    });

    it('should return current tier filter', () => {
      navigator = new WizardNavigator(container);
      navigator.setSteps(mockSteps);

      expect(navigator.getCurrentTierFilter()).toBe('all');

      // Open and click micro tab
      const toggle = container.querySelector('.wizard-nav-concept-toggle') as HTMLButtonElement;
      toggle.click();
      const microTab = container.querySelector('[data-tier="micro"]') as HTMLButtonElement;
      microTab.click();

      expect(navigator.getCurrentTierFilter()).toBe('micro');
    });
  });

  describe('onNavigate() / offNavigate()', () => {
    it('should register callback', () => {
      navigator = new WizardNavigator(container);
      navigator.setSteps(mockSteps);
      navigator.setCurrentStep(mockSteps[0]);
      const callback = vi.fn();

      navigator.onNavigate(callback);

      const buttons = container.querySelectorAll('.wizard-nav-button') as NodeListOf<HTMLButtonElement>;
      buttons[1].click();

      expect(callback).toHaveBeenCalled();
    });

    it('should support multiple callbacks', () => {
      navigator = new WizardNavigator(container);
      navigator.setSteps(mockSteps);
      navigator.setCurrentStep(mockSteps[0]);
      const callback1 = vi.fn();
      const callback2 = vi.fn();

      navigator.onNavigate(callback1);
      navigator.onNavigate(callback2);

      const buttons = container.querySelectorAll('.wizard-nav-button') as NodeListOf<HTMLButtonElement>;
      buttons[1].click();

      expect(callback1).toHaveBeenCalled();
      expect(callback2).toHaveBeenCalled();
    });

    it('should remove callback', () => {
      navigator = new WizardNavigator(container);
      navigator.setSteps(mockSteps);
      navigator.setCurrentStep(mockSteps[0]);
      const callback = vi.fn();

      navigator.onNavigate(callback);
      navigator.offNavigate(callback);

      const buttons = container.querySelectorAll('.wizard-nav-button') as NodeListOf<HTMLButtonElement>;
      buttons[1].click();

      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle single step', () => {
      navigator = new WizardNavigator(container);
      const singleStep = createMockSteps(1);
      navigator.setSteps(singleStep);
      navigator.setCurrentStep(singleStep[0]);

      const buttons = container.querySelectorAll('.wizard-nav-button') as NodeListOf<HTMLButtonElement>;
      expect(buttons[0].disabled).toBe(true);
      expect(buttons[1].disabled).toBe(true);
    });

    it('should handle empty steps', () => {
      navigator = new WizardNavigator(container);
      navigator.setSteps([]);

      const buttons = container.querySelectorAll('.wizard-nav-button') as NodeListOf<HTMLButtonElement>;
      expect(buttons[0].disabled).toBe(true);
      expect(buttons[1].disabled).toBe(true);
    });

    it('should handle setCurrentStep before setSteps', () => {
      navigator = new WizardNavigator(container);

      expect(() => navigator.setCurrentStep(mockSteps[0])).not.toThrow();
    });
  });

  describe('dispose()', () => {
    it('should remove navigator from container', () => {
      navigator = new WizardNavigator(container);

      navigator.dispose();

      expect(container.querySelector('.wizard-navigator')).toBeNull();
    });

    it('should clear callbacks', () => {
      navigator = new WizardNavigator(container);
      navigator.setSteps(mockSteps);
      navigator.setCurrentStep(mockSteps[0]);
      const callback = vi.fn();

      navigator.onNavigate(callback);
      navigator.dispose();

      // Recreate to verify old callback not called
      const newNavigator = new WizardNavigator(container);
      newNavigator.setSteps(mockSteps);
      newNavigator.setCurrentStep(mockSteps[0]);

      const buttons = container.querySelectorAll('.wizard-nav-button') as NodeListOf<HTMLButtonElement>;
      buttons[1].click();

      expect(callback).not.toHaveBeenCalled();
      newNavigator.dispose();
    });
  });

  describe('injectWizardNavigatorStyles()', () => {
    it('should inject styles only once', () => {
      navigator = new WizardNavigator(container);

      injectWizardNavigatorStyles();

      const styleElements = document.querySelectorAll('#wizard-navigator-styles');
      expect(styleElements.length).toBe(1);
    });
  });
});
