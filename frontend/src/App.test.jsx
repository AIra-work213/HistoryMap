import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

// Mock the API module
vi.mock('./services/api', () => ({
  fetchMapData: vi.fn(() => Promise.resolve({
    year: 1941,
    regions: [],
  })),
  fetchRegionDetail: vi.fn(() => Promise.resolve({
    name: 'Test Region',
    year: 1941,
    emotions: { fear: 0.3, joy: 0.2, neutral: 0.4, sadness: 0.1 },
    diary_entries: [],
    stats: { population: 1000000, change_percent: 0, year: 1941 },
  })),
  checkHealth: vi.fn(() => Promise.resolve({ status: 'ok', version: '0.1.0' })),
}));

// Mock Leaflet components
vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }) => <div data-testid="map-container">{children}</div>,
  TileLayer: () => null,
  GeoJSON: () => null,
}));

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the header', () => {
    render(<App />);

    expect(screen.getByText(/Эмоции СССР/i)).toBeInTheDocument();
  });

  it('renders the year slider', () => {
    render(<App />);

    const slider = screen.getByRole('slider', { name: /Выбор года/i });
    expect(slider).toBeInTheDocument();
    expect(slider).toHaveAttribute('min', '1920');
    expect(slider).toHaveAttribute('max', '1991');
  });

  it('displays emotion legend', () => {
    render(<App />);

    expect(screen.getByText('Страх')).toBeInTheDocument();
    expect(screen.getByText('Радость')).toBeInTheDocument();
    expect(screen.getByText('Нейтраль')).toBeInTheDocument();
    expect(screen.getByText('Грусть')).toBeInTheDocument();
  });

  it('renders info text', () => {
    render(<App />);

    expect(screen.getByText(/Кликните на регион/i)).toBeInTheDocument();
  });
});
