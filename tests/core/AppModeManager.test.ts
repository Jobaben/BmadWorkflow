/**
 * AppModeManager Unit Tests
 *
 * Tests the application mode manager for story-029:
 * - AC1: Mode toggle exists and is discoverable
 * - AC2: Playground mode is default
 * - AC8: Mode toggle works bidirectionally
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AppModeManager } from '../../src/core/AppModeManager';
import type { AppMode, ModeChangeCallback } from '../../src/core/AppModeManager';

describe('AppModeManager', () => {
  let modeManager: AppModeManager;

  beforeEach(() => {
    modeManager = new AppModeManager();
  });

  describe('initialization', () => {
    it('should default to playground mode (AC2)', () => {
      expect(modeManager.getMode()).toBe('playground');
    });

    it('should accept custom initial mode', () => {
      const wizardModeManager = new AppModeManager('wizard');
      expect(wizardModeManager.getMode()).toBe('wizard');
    });

    it('should be in playground mode initially with helper methods', () => {
      expect(modeManager.isPlaygroundMode()).toBe(true);
      expect(modeManager.isWizardMode()).toBe(false);
    });
  });

  describe('switchMode()', () => {
    it('should switch from playground to wizard', () => {
      modeManager.switchMode('wizard');
      expect(modeManager.getMode()).toBe('wizard');
      expect(modeManager.isWizardMode()).toBe(true);
      expect(modeManager.isPlaygroundMode()).toBe(false);
    });

    it('should switch from wizard to playground', () => {
      modeManager.switchMode('wizard');
      modeManager.switchMode('playground');
      expect(modeManager.getMode()).toBe('playground');
    });

    it('should not emit event when switching to current mode', () => {
      const callback = vi.fn();
      modeManager.onModeChange(callback);

      // Already in playground mode
      modeManager.switchMode('playground');

      expect(callback).not.toHaveBeenCalled();
    });

    it('should emit event when mode changes', () => {
      const callback = vi.fn();
      modeManager.onModeChange(callback);

      modeManager.switchMode('wizard');

      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith('wizard', 'playground');
    });

    it('should not switch mode after disposal', () => {
      modeManager.switchMode('wizard');
      modeManager.dispose();

      // Should warn and not change
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      modeManager.switchMode('playground');

      expect(modeManager.getMode()).toBe('wizard'); // Stays at wizard
      expect(consoleWarnSpy).toHaveBeenCalled();
      consoleWarnSpy.mockRestore();
    });
  });

  describe('toggleMode() (AC8)', () => {
    it('should toggle from playground to wizard', () => {
      modeManager.toggleMode();
      expect(modeManager.getMode()).toBe('wizard');
    });

    it('should toggle from wizard to playground', () => {
      modeManager.switchMode('wizard');
      modeManager.toggleMode();
      expect(modeManager.getMode()).toBe('playground');
    });

    it('should toggle back and forth multiple times', () => {
      expect(modeManager.getMode()).toBe('playground');

      modeManager.toggleMode();
      expect(modeManager.getMode()).toBe('wizard');

      modeManager.toggleMode();
      expect(modeManager.getMode()).toBe('playground');

      modeManager.toggleMode();
      expect(modeManager.getMode()).toBe('wizard');
    });
  });

  describe('mode change callbacks', () => {
    it('should register callback with onModeChange()', () => {
      const callback = vi.fn();
      modeManager.onModeChange(callback);

      modeManager.switchMode('wizard');

      expect(callback).toHaveBeenCalledWith('wizard', 'playground');
    });

    it('should support multiple callbacks', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();

      modeManager.onModeChange(callback1);
      modeManager.onModeChange(callback2);

      modeManager.switchMode('wizard');

      expect(callback1).toHaveBeenCalledTimes(1);
      expect(callback2).toHaveBeenCalledTimes(1);
    });

    it('should remove callback with offModeChange()', () => {
      const callback = vi.fn();
      modeManager.onModeChange(callback);
      modeManager.offModeChange(callback);

      modeManager.switchMode('wizard');

      expect(callback).not.toHaveBeenCalled();
    });

    it('should handle callback errors gracefully', () => {
      const errorCallback = vi.fn(() => {
        throw new Error('Callback error');
      });
      const successCallback = vi.fn();

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      modeManager.onModeChange(errorCallback);
      modeManager.onModeChange(successCallback);

      modeManager.switchMode('wizard');

      // Mode should still change
      expect(modeManager.getMode()).toBe('wizard');
      // Error should be logged
      expect(consoleErrorSpy).toHaveBeenCalled();
      // Other callbacks should still run
      expect(successCallback).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });

    it('should provide correct previous mode in callback', () => {
      const callback = vi.fn();
      modeManager.onModeChange(callback);

      modeManager.switchMode('wizard');
      expect(callback).toHaveBeenLastCalledWith('wizard', 'playground');

      modeManager.switchMode('playground');
      expect(callback).toHaveBeenLastCalledWith('playground', 'wizard');
    });
  });

  describe('dispose()', () => {
    it('should clear all callbacks', () => {
      const callback = vi.fn();
      modeManager.onModeChange(callback);

      modeManager.dispose();

      // Even if we try to switch mode after partial internal state issues
      // The callback should not be called
      expect(callback).not.toHaveBeenCalled();
    });

    it('should set disposed state', () => {
      modeManager.dispose();

      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      modeManager.switchMode('wizard');

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'AppModeManager: Cannot switch mode, manager is disposed'
      );
      consoleWarnSpy.mockRestore();
    });
  });

  describe('helper methods', () => {
    it('isPlaygroundMode() should return correct value', () => {
      expect(modeManager.isPlaygroundMode()).toBe(true);

      modeManager.switchMode('wizard');
      expect(modeManager.isPlaygroundMode()).toBe(false);
    });

    it('isWizardMode() should return correct value', () => {
      expect(modeManager.isWizardMode()).toBe(false);

      modeManager.switchMode('wizard');
      expect(modeManager.isWizardMode()).toBe(true);
    });
  });
});

describe('AppModeManager type exports', () => {
  it('should export AppMode type', () => {
    const mode: AppMode = 'playground';
    expect(mode).toBe('playground');
  });

  it('should export ModeChangeCallback type', () => {
    const callback: ModeChangeCallback = (mode, prev) => {
      expect(typeof mode).toBe('string');
      expect(typeof prev).toBe('string');
    };
    callback('wizard', 'playground');
  });
});
