import { describe, it, expect, beforeEach } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import OfflineBanner from './OfflineBanner';
import { markOfflineFallback, resetOfflineMode } from '../services/demoMode';

describe('OfflineBanner', () => {
  beforeEach(() => {
    resetOfflineMode();
  });

  it('renders nothing while the backend answers normally', () => {
    const { container } = render(<OfflineBanner />);
    expect(container).toBeEmptyDOMElement();
  });

  it('shows the bilingual sample-data label once a fallback fires', () => {
    render(<OfflineBanner />);
    act(() => markOfflineFallback('/farms'));
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(/Demo mode: server offline/)).toBeInTheDocument();
    expect(screen.getByText(/डेमो मोड/)).toBeInTheDocument();
  });

  it('hides again when offline mode is reset', () => {
    render(<OfflineBanner />);
    act(() => markOfflineFallback('/farms'));
    expect(screen.getByRole('alert')).toBeInTheDocument();
    act(() => resetOfflineMode());
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
