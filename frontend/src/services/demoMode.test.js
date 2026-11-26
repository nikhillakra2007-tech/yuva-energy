import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getOfflineState,
  markOfflineFallback,
  resetOfflineMode,
  subscribeOfflineMode,
} from './demoMode';

describe('demoMode offline visibility store', () => {
  beforeEach(() => {
    resetOfflineMode();
  });

  it('starts with the backend answering normally', () => {
    expect(getOfflineState().offline).toBe(false);
    expect(getOfflineState().endpoints).toEqual([]);
  });

  it('records the first fallback endpoint and flips offline on', () => {
    markOfflineFallback('/farms');
    expect(getOfflineState().offline).toBe(true);
    expect(getOfflineState().endpoints).toEqual(['/farms']);
  });

  it('dedupes repeated fallbacks for the same endpoint', () => {
    markOfflineFallback('/farms');
    markOfflineFallback('/farms');
    markOfflineFallback('/fields');
    expect(getOfflineState().endpoints).toEqual(['/farms', '/fields']);
  });

  it('notifies subscribers and stops after unsubscribe', () => {
    const listener = vi.fn();
    const unsubscribe = subscribeOfflineMode(listener);
    markOfflineFallback('/farms');
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener.mock.calls[0][0].offline).toBe(true);
    unsubscribe();
    markOfflineFallback('/fields');
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('resets to the normal state', () => {
    markOfflineFallback('/farms');
    resetOfflineMode();
    expect(getOfflineState().offline).toBe(false);
  });
});
