/**
 * DemoSelector Unit Tests
 *
 * Tests the DemoSelector component for demo navigation.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { DemoSelector } from '../../src/ui/DemoSelector';
import { DemoType } from '../../src/types';
import type { DemoInfo } from '../../src/types';

describe('DemoSelector', () => {
  let container: HTMLElement;
  let selector: DemoSelector;

  const mockDemos: DemoInfo[] = [
    { id: DemoType.Particles, label: 'Particles', description: 'Particle system' },
    { id: DemoType.Objects, label: 'Objects', description: '3D objects' },
    { id: DemoType.Fluid, label: 'Fluid', description: 'Fluid simulation' },
    { id: DemoType.Combined, label: 'Combined', description: 'All demos' },
  ];

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    selector = new DemoSelector(container);
  });

  afterEach(() => {
    selector.dispose();
    if (container.parentNode) {
      document.body.removeChild(container);
    }
  });

  describe('initialization', () => {
    it('should create a demo-selector element in the container', () => {
      const element = container.querySelector('.demo-selector');
      expect(element).not.toBeNull();
    });

    it('should have a title element', () => {
      const title = container.querySelector('.demo-selector__title');
      expect(title).not.toBeNull();
      expect(title?.textContent).toBe('Demos');
    });

    it('should have a buttons container', () => {
      const buttons = container.querySelector('.demo-selector__buttons');
      expect(buttons).not.toBeNull();
    });
  });

  describe('setDemos', () => {
    it('should create a button for each demo', () => {
      selector.setDemos(mockDemos);

      const buttons = container.querySelectorAll('.demo-selector__button');
      expect(buttons.length).toBe(4);
    });

    it('should display demo labels on buttons', () => {
      selector.setDemos(mockDemos);

      const buttons = container.querySelectorAll('.demo-selector__button');
      expect(buttons[0].textContent).toBe('Particles');
      expect(buttons[1].textContent).toBe('Objects');
      expect(buttons[2].textContent).toBe('Fluid');
      expect(buttons[3].textContent).toBe('Combined');
    });

    it('should set description as title attribute for tooltip', () => {
      selector.setDemos(mockDemos);

      const buttons = container.querySelectorAll('.demo-selector__button');
      expect(buttons[0].getAttribute('title')).toBe('Particle system');
    });

    it('should store demo id in data attribute', () => {
      selector.setDemos(mockDemos);

      const buttons = container.querySelectorAll('.demo-selector__button');
      expect(buttons[0].getAttribute('data-demo-id')).toBe(DemoType.Particles);
    });

    it('should clear previous buttons when called again', () => {
      selector.setDemos(mockDemos);
      selector.setDemos([mockDemos[0], mockDemos[1]]);

      const buttons = container.querySelectorAll('.demo-selector__button');
      expect(buttons.length).toBe(2);
    });
  });

  describe('selection', () => {
    beforeEach(() => {
      selector.setDemos(mockDemos);
    });

    it('should add active class to selected button when setSelected is called', () => {
      selector.setSelected(DemoType.Particles);

      const button = container.querySelector(`[data-demo-id="${DemoType.Particles}"]`);
      expect(button?.classList.contains('demo-selector__button--active')).toBe(true);
    });

    it('should update getSelected to return the selected demo', () => {
      expect(selector.getSelected()).toBeNull();

      selector.setSelected(DemoType.Objects);
      expect(selector.getSelected()).toBe(DemoType.Objects);
    });

    it('should remove active class from previous selection when new one is made', () => {
      selector.setSelected(DemoType.Particles);
      selector.setSelected(DemoType.Objects);

      const particlesBtn = container.querySelector(`[data-demo-id="${DemoType.Particles}"]`);
      const objectsBtn = container.querySelector(`[data-demo-id="${DemoType.Objects}"]`);

      expect(particlesBtn?.classList.contains('demo-selector__button--active')).toBe(false);
      expect(objectsBtn?.classList.contains('demo-selector__button--active')).toBe(true);
    });

    it('should log warning when setting invalid demo id', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      selector.setSelected('invalid' as DemoType);

      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('Unknown demo type'));
      warnSpy.mockRestore();
    });
  });

  describe('click handling', () => {
    beforeEach(() => {
      selector.setDemos(mockDemos);
    });

    it('should update selection when button is clicked', () => {
      const button = container.querySelector(`[data-demo-id="${DemoType.Fluid}"]`) as HTMLButtonElement;
      button.click();

      expect(selector.getSelected()).toBe(DemoType.Fluid);
      expect(button.classList.contains('demo-selector__button--active')).toBe(true);
    });

    it('should not emit event when clicking already selected demo', () => {
      const callback = vi.fn();
      selector.onSelect(callback);
      selector.setSelected(DemoType.Particles);

      const button = container.querySelector(`[data-demo-id="${DemoType.Particles}"]`) as HTMLButtonElement;
      button.click();

      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('onSelect callback', () => {
    beforeEach(() => {
      selector.setDemos(mockDemos);
    });

    it('should call registered callback when demo is selected via click', () => {
      const callback = vi.fn();
      selector.onSelect(callback);

      const button = container.querySelector(`[data-demo-id="${DemoType.Objects}"]`) as HTMLButtonElement;
      button.click();

      expect(callback).toHaveBeenCalledWith(DemoType.Objects);
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('should support multiple callbacks', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();
      selector.onSelect(callback1);
      selector.onSelect(callback2);

      const button = container.querySelector(`[data-demo-id="${DemoType.Fluid}"]`) as HTMLButtonElement;
      button.click();

      expect(callback1).toHaveBeenCalledWith(DemoType.Fluid);
      expect(callback2).toHaveBeenCalledWith(DemoType.Fluid);
    });

    it('should not emit event when setSelected is called programmatically', () => {
      const callback = vi.fn();
      selector.onSelect(callback);

      selector.setSelected(DemoType.Combined);

      expect(callback).not.toHaveBeenCalled();
    });

    it('should handle callback errors gracefully', () => {
      const errorCallback = vi.fn().mockImplementation(() => {
        throw new Error('Callback error');
      });
      const goodCallback = vi.fn();
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      selector.onSelect(errorCallback);
      selector.onSelect(goodCallback);

      const button = container.querySelector(`[data-demo-id="${DemoType.Particles}"]`) as HTMLButtonElement;
      button.click();

      expect(errorSpy).toHaveBeenCalled();
      expect(goodCallback).toHaveBeenCalled();
      errorSpy.mockRestore();
    });
  });

  describe('visibility', () => {
    it('should hide when hide() is called', () => {
      const element = container.querySelector('.demo-selector') as HTMLElement;

      selector.hide();

      expect(element.style.display).toBe('none');
    });

    it('should show when show() is called', () => {
      const element = container.querySelector('.demo-selector') as HTMLElement;

      selector.hide();
      selector.show();

      expect(element.style.display).toBe('block');
    });
  });

  describe('dispose', () => {
    it('should remove element from DOM', () => {
      selector.dispose();

      const element = container.querySelector('.demo-selector');
      expect(element).toBeNull();
    });

    it('should clear callbacks', () => {
      const callback = vi.fn();
      selector.onSelect(callback);
      selector.setDemos(mockDemos);

      selector.dispose();

      // Re-create selector to verify callbacks were cleared
      // (no way to test internal state directly, but callbacks won't fire after dispose)
    });
  });

  describe('edge cases', () => {
    it('should handle demo without description', () => {
      const demosWithoutDesc: DemoInfo[] = [
        { id: DemoType.Particles, label: 'Particles' },
      ];
      selector.setDemos(demosWithoutDesc);

      const button = container.querySelector('.demo-selector__button');
      expect(button?.getAttribute('title')).toBeNull();
    });

    it('should handle empty demo list', () => {
      selector.setDemos([]);

      const buttons = container.querySelectorAll('.demo-selector__button');
      expect(buttons.length).toBe(0);
    });

    it('should restore selection after setDemos if selected demo still exists', () => {
      selector.setDemos(mockDemos);
      selector.setSelected(DemoType.Objects);

      selector.setDemos(mockDemos);

      const button = container.querySelector(`[data-demo-id="${DemoType.Objects}"]`);
      expect(button?.classList.contains('demo-selector__button--active')).toBe(true);
    });
  });
});
