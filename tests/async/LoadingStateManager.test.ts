/**
 * LoadingStateManager Unit Tests
 *
 * Tests the LoadingStateManager for threshold-based loading indicators.
 * Validates all acceptance criteria from story-025.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { LoadingStateManager } from '../../src/async/LoadingStateManager';

describe('LoadingStateManager', () => {
  let manager: LoadingStateManager;

  beforeEach(() => {
    vi.useFakeTimers();
    manager = new LoadingStateManager();
  });

  afterEach(() => {
    manager.dispose();
    vi.useRealTimers();
  });

  describe('AC1: Loading indicators delayed by 100ms threshold', () => {
    it('should not show indicator immediately on startLoading', () => {
      const showCallback = vi.fn();
      manager.onShowIndicator(showCallback);

      manager.startLoading('test-id');

      expect(showCallback).not.toHaveBeenCalled();
      expect(manager.isIndicatorVisible('test-id')).toBe(false);
    });

    it('should show indicator after 100ms threshold', () => {
      const showCallback = vi.fn();
      manager.onShowIndicator(showCallback);

      manager.startLoading('test-id');
      vi.advanceTimersByTime(100);

      expect(showCallback).toHaveBeenCalledWith('test-id');
      expect(showCallback).toHaveBeenCalledTimes(1);
      expect(manager.isIndicatorVisible('test-id')).toBe(true);
    });

    it('should not show indicator before 100ms threshold', () => {
      const showCallback = vi.fn();
      manager.onShowIndicator(showCallback);

      manager.startLoading('test-id');
      vi.advanceTimersByTime(99);

      expect(showCallback).not.toHaveBeenCalled();
      expect(manager.isIndicatorVisible('test-id')).toBe(false);
    });

    it('should use custom threshold when provided', () => {
      const customManager = new LoadingStateManager(200);
      const showCallback = vi.fn();
      customManager.onShowIndicator(showCallback);

      customManager.startLoading('test-id');

      vi.advanceTimersByTime(100);
      expect(showCallback).not.toHaveBeenCalled();

      vi.advanceTimersByTime(100);
      expect(showCallback).toHaveBeenCalledWith('test-id');

      customManager.dispose();
    });
  });

  describe('AC2: Fast operations show no indicator', () => {
    it('should not call show callback if stopped within 100ms', () => {
      const showCallback = vi.fn();
      manager.onShowIndicator(showCallback);

      manager.startLoading('test-id');
      vi.advanceTimersByTime(50);
      manager.stopLoading('test-id');

      // Even after more time passes, callback should not be called
      vi.advanceTimersByTime(100);

      expect(showCallback).not.toHaveBeenCalled();
    });

    it('should not call hide callback if indicator was never shown', () => {
      const hideCallback = vi.fn();
      manager.onHideIndicator(hideCallback);

      manager.startLoading('test-id');
      vi.advanceTimersByTime(50);
      manager.stopLoading('test-id');

      expect(hideCallback).not.toHaveBeenCalled();
    });

    it('should not show indicator for operations completing at exactly 99ms', () => {
      const showCallback = vi.fn();
      manager.onShowIndicator(showCallback);

      manager.startLoading('test-id');
      vi.advanceTimersByTime(99);
      manager.stopLoading('test-id');

      // Advance past threshold to ensure timeout was cleared
      vi.advanceTimersByTime(10);

      expect(showCallback).not.toHaveBeenCalled();
    });
  });

  describe('AC3: Indicators clear immediately on completion', () => {
    it('should call hide callback immediately when stopLoading called after indicator visible', () => {
      const hideCallback = vi.fn();
      manager.onHideIndicator(hideCallback);

      manager.startLoading('test-id');
      vi.advanceTimersByTime(100); // Indicator now visible

      manager.stopLoading('test-id');

      expect(hideCallback).toHaveBeenCalledWith('test-id');
      expect(hideCallback).toHaveBeenCalledTimes(1);
    });

    it('should set isIndicatorVisible to false immediately on stop', () => {
      manager.startLoading('test-id');
      vi.advanceTimersByTime(100);
      expect(manager.isIndicatorVisible('test-id')).toBe(true);

      manager.stopLoading('test-id');
      expect(manager.isIndicatorVisible('test-id')).toBe(false);
    });

    it('should remove loading state immediately on stop', () => {
      manager.startLoading('test-id');
      expect(manager.isLoading('test-id')).toBe(true);

      vi.advanceTimersByTime(100);
      manager.stopLoading('test-id');

      expect(manager.isLoading('test-id')).toBe(false);
    });
  });

  describe('AC4: Multiple concurrent loading states supported', () => {
    it('should track multiple loading operations independently', () => {
      manager.startLoading('op-1');
      manager.startLoading('op-2');
      manager.startLoading('op-3');

      expect(manager.isLoading('op-1')).toBe(true);
      expect(manager.isLoading('op-2')).toBe(true);
      expect(manager.isLoading('op-3')).toBe(true);
      expect(manager.activeCount).toBe(3);
    });

    it('should show indicators independently based on timing', () => {
      const showCallback = vi.fn();
      manager.onShowIndicator(showCallback);

      manager.startLoading('op-1');
      vi.advanceTimersByTime(50);
      manager.startLoading('op-2');
      vi.advanceTimersByTime(50); // op-1 at 100ms, op-2 at 50ms

      expect(showCallback).toHaveBeenCalledWith('op-1');
      expect(showCallback).toHaveBeenCalledTimes(1);
      expect(manager.isIndicatorVisible('op-1')).toBe(true);
      expect(manager.isIndicatorVisible('op-2')).toBe(false);

      vi.advanceTimersByTime(50); // op-2 at 100ms

      expect(showCallback).toHaveBeenCalledWith('op-2');
      expect(showCallback).toHaveBeenCalledTimes(2);
    });

    it('should stop individual operations without affecting others', () => {
      const showCallback = vi.fn();
      const hideCallback = vi.fn();
      manager.onShowIndicator(showCallback);
      manager.onHideIndicator(hideCallback);

      manager.startLoading('op-1');
      manager.startLoading('op-2');
      vi.advanceTimersByTime(100);

      // Both indicators now visible
      expect(manager.isIndicatorVisible('op-1')).toBe(true);
      expect(manager.isIndicatorVisible('op-2')).toBe(true);

      manager.stopLoading('op-1');

      expect(hideCallback).toHaveBeenCalledWith('op-1');
      expect(hideCallback).toHaveBeenCalledTimes(1);
      expect(manager.isLoading('op-1')).toBe(false);
      expect(manager.isLoading('op-2')).toBe(true);
      expect(manager.isIndicatorVisible('op-2')).toBe(true);
    });
  });

  describe('AC5: Navigation clears pending indicators', () => {
    it('should clear all loading operations on clearAll', () => {
      manager.startLoading('op-1');
      manager.startLoading('op-2');
      manager.startLoading('op-3');

      manager.clearAll();

      expect(manager.isLoading('op-1')).toBe(false);
      expect(manager.isLoading('op-2')).toBe(false);
      expect(manager.isLoading('op-3')).toBe(false);
      expect(manager.activeCount).toBe(0);
    });

    it('should cancel pending timeouts on clearAll', () => {
      const showCallback = vi.fn();
      manager.onShowIndicator(showCallback);

      manager.startLoading('op-1');
      vi.advanceTimersByTime(50);

      manager.clearAll();

      // Advance past threshold
      vi.advanceTimersByTime(100);

      expect(showCallback).not.toHaveBeenCalled();
    });

    it('should notify hide for visible indicators on clearAll', () => {
      const hideCallback = vi.fn();
      manager.onHideIndicator(hideCallback);

      manager.startLoading('op-1');
      manager.startLoading('op-2');
      vi.advanceTimersByTime(100);

      manager.clearAll();

      expect(hideCallback).toHaveBeenCalledWith('op-1');
      expect(hideCallback).toHaveBeenCalledWith('op-2');
      expect(hideCallback).toHaveBeenCalledTimes(2);
    });

    it('should not notify hide for pending indicators on clearAll', () => {
      const hideCallback = vi.fn();
      manager.onHideIndicator(hideCallback);

      manager.startLoading('op-1');
      vi.advanceTimersByTime(100);
      manager.startLoading('op-2');
      vi.advanceTimersByTime(50); // op-2 not yet visible

      manager.clearAll();

      expect(hideCallback).toHaveBeenCalledWith('op-1');
      expect(hideCallback).toHaveBeenCalledTimes(1); // op-2 was not visible
    });
  });

  describe('edge cases', () => {
    it('should not error when stopping non-existent loading state', () => {
      expect(() => {
        manager.stopLoading('non-existent');
      }).not.toThrow();
    });

    it('should handle same ID started twice by stopping previous', () => {
      const showCallback = vi.fn();
      manager.onShowIndicator(showCallback);

      manager.startLoading('same-id');
      vi.advanceTimersByTime(50);
      manager.startLoading('same-id'); // Restarts the timer

      vi.advanceTimersByTime(50);
      expect(showCallback).not.toHaveBeenCalled(); // Still only 50ms since restart

      vi.advanceTimersByTime(50);
      expect(showCallback).toHaveBeenCalledWith('same-id');
      expect(showCallback).toHaveBeenCalledTimes(1);
    });

    it('should handle dispose with pending timeouts', () => {
      const showCallback = vi.fn();
      manager.onShowIndicator(showCallback);

      manager.startLoading('op-1');
      manager.startLoading('op-2');
      vi.advanceTimersByTime(50);

      manager.dispose();

      vi.advanceTimersByTime(100);
      expect(showCallback).not.toHaveBeenCalled();
    });

    it('should handle dispose with visible indicators', () => {
      const hideCallback = vi.fn();
      manager.onHideIndicator(hideCallback);

      manager.startLoading('op-1');
      vi.advanceTimersByTime(100);

      manager.dispose();

      expect(hideCallback).toHaveBeenCalledWith('op-1');
    });

    it('should clear callbacks on dispose', () => {
      const showCallback = vi.fn();
      const hideCallback = vi.fn();
      manager.onShowIndicator(showCallback);
      manager.onHideIndicator(hideCallback);

      manager.dispose();

      // Create new loading state - callbacks should not be called
      // (though manager shouldn't be used after dispose, testing cleanup)
      manager.startLoading('test');
      vi.advanceTimersByTime(100);

      expect(showCallback).not.toHaveBeenCalled();
    });

    it('should return false for isIndicatorVisible with non-existent id', () => {
      expect(manager.isIndicatorVisible('non-existent')).toBe(false);
    });

    it('should return false for isLoading with non-existent id', () => {
      expect(manager.isLoading('non-existent')).toBe(false);
    });
  });

  describe('callback management', () => {
    it('should support multiple show callbacks', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();
      const callback3 = vi.fn();

      manager.onShowIndicator(callback1);
      manager.onShowIndicator(callback2);
      manager.onShowIndicator(callback3);

      manager.startLoading('test-id');
      vi.advanceTimersByTime(100);

      expect(callback1).toHaveBeenCalledWith('test-id');
      expect(callback2).toHaveBeenCalledWith('test-id');
      expect(callback3).toHaveBeenCalledWith('test-id');
    });

    it('should support multiple hide callbacks', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();

      manager.onHideIndicator(callback1);
      manager.onHideIndicator(callback2);

      manager.startLoading('test-id');
      vi.advanceTimersByTime(100);
      manager.stopLoading('test-id');

      expect(callback1).toHaveBeenCalledWith('test-id');
      expect(callback2).toHaveBeenCalledWith('test-id');
    });

    it('should unregister show callback', () => {
      const callback = vi.fn();

      manager.onShowIndicator(callback);
      manager.offShowIndicator(callback);

      manager.startLoading('test-id');
      vi.advanceTimersByTime(100);

      expect(callback).not.toHaveBeenCalled();
    });

    it('should unregister hide callback', () => {
      const callback = vi.fn();

      manager.onHideIndicator(callback);
      manager.offHideIndicator(callback);

      manager.startLoading('test-id');
      vi.advanceTimersByTime(100);
      manager.stopLoading('test-id');

      expect(callback).not.toHaveBeenCalled();
    });

    it('should handle unregistering callback that was never registered', () => {
      const callback = vi.fn();

      expect(() => {
        manager.offShowIndicator(callback);
        manager.offHideIndicator(callback);
      }).not.toThrow();
    });

    it('should not call same callback twice if registered twice', () => {
      const callback = vi.fn();

      manager.onShowIndicator(callback);
      manager.onShowIndicator(callback); // Same callback registered again

      manager.startLoading('test-id');
      vi.advanceTimersByTime(100);

      // Set ensures uniqueness, so callback called only once
      expect(callback).toHaveBeenCalledTimes(1);
    });
  });

  describe('activeCount property', () => {
    it('should start at 0', () => {
      expect(manager.activeCount).toBe(0);
    });

    it('should increment on startLoading', () => {
      manager.startLoading('op-1');
      expect(manager.activeCount).toBe(1);

      manager.startLoading('op-2');
      expect(manager.activeCount).toBe(2);
    });

    it('should decrement on stopLoading', () => {
      manager.startLoading('op-1');
      manager.startLoading('op-2');

      manager.stopLoading('op-1');
      expect(manager.activeCount).toBe(1);

      manager.stopLoading('op-2');
      expect(manager.activeCount).toBe(0);
    });

    it('should reset to 0 on clearAll', () => {
      manager.startLoading('op-1');
      manager.startLoading('op-2');
      manager.startLoading('op-3');

      manager.clearAll();

      expect(manager.activeCount).toBe(0);
    });

    it('should not change when stopping non-existent id', () => {
      manager.startLoading('op-1');

      manager.stopLoading('non-existent');

      expect(manager.activeCount).toBe(1);
    });
  });

  describe('isLoading method', () => {
    it('should return true immediately after startLoading', () => {
      manager.startLoading('test-id');

      expect(manager.isLoading('test-id')).toBe(true);
    });

    it('should return true even before indicator is visible', () => {
      manager.startLoading('test-id');
      vi.advanceTimersByTime(50);

      expect(manager.isLoading('test-id')).toBe(true);
      expect(manager.isIndicatorVisible('test-id')).toBe(false);
    });

    it('should return true after indicator becomes visible', () => {
      manager.startLoading('test-id');
      vi.advanceTimersByTime(100);

      expect(manager.isLoading('test-id')).toBe(true);
      expect(manager.isIndicatorVisible('test-id')).toBe(true);
    });

    it('should return false after stopLoading', () => {
      manager.startLoading('test-id');
      manager.stopLoading('test-id');

      expect(manager.isLoading('test-id')).toBe(false);
    });
  });
});
