import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import FarmerFieldsTab from './FarmerFieldsTab';

vi.mock('../geospatial/FieldMap', () => ({ default: () => null }));

const baseProps = {
  field: null,
  waterBalance: null,
  soil: null,
  fieldTabs: [{ id: 'a', crop: 'Wheat', area: '5.4 Ha' }],
  selectedFieldTab: 'a',
  setSelectedFieldTab: () => {},
  isPunjab: false,
  lang: 'en',
};

describe('FarmerFieldsTab profile-driven agronomy', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('shows the Haryana profile figures by default', () => {
    render(<FarmerFieldsTab {...baseProps} />);
    expect(screen.getByText('Sandy Clay Loam')).toBeInTheDocument();
    expect(screen.getByText(/Root Depth Zr: 0.65m/)).toBeInTheDocument();
    expect(screen.getByText(/TAW: 82mm/)).toBeInTheDocument();
    expect(screen.getByText(/NDVI 0.76/)).toBeInTheDocument();
    // centroid computed from the profile field boundary (not hardcoded)
    expect(screen.getByText(/Centroid: 29.7420° N, 76.8842° E/)).toBeInTheDocument();
    // no fake relative timestamps
    expect(screen.queryByText(/min ago/)).not.toBeInTheDocument();
  });

  it('switches every figure when the active profile changes', () => {
    localStorage.setItem('kisanurja_profile_id', 'user_punjab_02');
    render(<FarmerFieldsTab {...baseProps} />);
    expect(screen.getByText('Silt Loam')).toBeInTheDocument();
    expect(screen.getByText(/Root Depth Zr: 0.85m/)).toBeInTheDocument();
    expect(screen.getByText(/TAW: 95mm/)).toBeInTheDocument();
    expect(screen.getByText(/NDVI 0.81/)).toBeInTheDocument();
  });

  it('renders Rajasthan arid-zone values with the right vigor label', () => {
    localStorage.setItem('kisanurja_profile_id', 'user_rajasthan_04');
    render(<FarmerFieldsTab {...baseProps} />);
    expect(screen.getByText('Sandy Loam')).toBeInTheDocument();
    expect(screen.getByText(/NDVI 0.58/)).toBeInTheDocument();
    expect(screen.getByText('Moderate Vigor')).toBeInTheDocument();
  });

  it('uses live water-balance telemetry when provided', () => {
    render(
      <FarmerFieldsTab
        {...baseProps}
        waterBalance={{ root_depth_m: 0.9, taw_mm: 101, ndvi: 0.66, ndvi_cloud_pct: 4.0 }}
      />
    );
    expect(screen.getByText(/Root Depth Zr: 0.9m/)).toBeInTheDocument();
    expect(screen.getByText(/NDVI 0.66/)).toBeInTheDocument();
  });
});
