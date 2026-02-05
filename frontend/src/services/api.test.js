import { describe, it, expect, beforeEach, vi } from 'vitest';
import { fetchMapData, fetchRegionDetail, checkHealth } from './api';

// Mock global fetch
global.fetch = vi.fn();

describe('API Service', () => {
  const API_URL = 'http://localhost:8000';

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset import.meta.env
    import.meta.env.VITE_API_URL = API_URL;
  });

  describe('fetchMapData', () => {
    it('fetches map data for a given year', async () => {
      const mockData = {
        year: 1941,
        regions: [
          {
            name: 'Московская область',
            emotions: { fear: 0.6, joy: 0.1, neutral: 0.2, sadness: 0.1 },
            diary_count: 14,
          },
        ],
      };

      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => mockData,
      });

      const result = await fetchMapData(1941);

      expect(global.fetch).toHaveBeenCalledWith(`${API_URL}/api/map/1941`);
      expect(result).toEqual(mockData);
    });

    it('throws error when response is not ok', async () => {
      global.fetch.mockResolvedValue({
        ok: false,
        statusText: 'Not Found',
      });

      await expect(fetchMapData(1941)).rejects.toThrow('Failed to fetch map data');
    });
  });

  describe('fetchRegionDetail', () => {
    it('fetches region detail for a given year and region', async () => {
      const mockDetail = {
        name: 'Московская область',
        year: 1941,
        emotions: { fear: 0.6, joy: 0.1, neutral: 0.2, sadness: 0.1 },
        diary_entries: [],
        stats: { population: 5000000, change_percent: -5.0, year: 1941 },
      };

      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => mockDetail,
      });

      const result = await fetchRegionDetail(1941, 'Московская область');

      expect(global.fetch).toHaveBeenCalledWith(
        `${API_URL}/api/region/1941/%D0%9C%D0%BE%D1%81%D0%BA%D0%BE%D0%B2%D1%81%D0%BA%D0%B0%D1%8F%20%D0%BE%D0%B1%D0%BB%D0%B0%D1%81%D1%82%D1%8C`
      );
      expect(result).toEqual(mockDetail);
    });

    it('throws error when response is not ok', async () => {
      global.fetch.mockResolvedValue({
        ok: false,
        statusText: 'Not Found',
      });

      await expect(fetchRegionDetail(1941, 'Unknown')).rejects.toThrow(
        'Failed to fetch region detail'
      );
    });
  });

  describe('checkHealth', () => {
    it('checks API health status', async () => {
      const mockHealth = { status: 'ok', version: '0.1.0' };

      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => mockHealth,
      });

      const result = await checkHealth();

      expect(global.fetch).toHaveBeenCalledWith(`${API_URL}/api/health`);
      expect(result).toEqual(mockHealth);
    });

    it('throws error when health check fails', async () => {
      global.fetch.mockResolvedValue({
        ok: false,
      });

      await expect(checkHealth()).rejects.toThrow('Health check failed');
    });
  });
});
