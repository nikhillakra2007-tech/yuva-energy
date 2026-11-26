import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { api } from './api';
import { getOfflineState, resetOfflineMode } from './demoMode';

describe('api client offline fallback honesty', () => {
  beforeEach(() => {
    resetOfflineMode();
    localStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('serves sample farms when the backend is unreachable and labels it', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('connection refused')));
    const farms = await api.listFarms();
    expect(farms.length).toBeGreaterThan(0);
    expect(getOfflineState().offline).toBe(true);
    expect(getOfflineState().endpoints.some((e) => e.includes('/farms'))).toBe(true);
  });

  it('does not label offline mode when the backend answers', async () => {
    const liveFarms = [{ id: 'live-1', name: 'Real Farm' }];
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify(liveFarms), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      )
    );
    const farms = await api.listFarms();
    expect(farms[0].name).toBe('Real Farm');
    expect(getOfflineState().offline).toBe(false);
  });

  it('never fakes a failed write as sample data and reports the change was not saved', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('connection refused')));
    // POST /farms previously returned the bundled sample farm as if created.
    await expect(api.createFarm({ name: 'Should Not Save' })).rejects.toThrow(/not saved/);
  });

  it('labels the session as demo when login falls back offline', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('connection refused')));
    const result = await api.login({ email: 'rajesh.karnal@kisanurja.in', password: 'x' });
    expect(result.access_token).toContain('mock_jwt_token_');
    expect(getOfflineState().offline).toBe(true);
  });
});
