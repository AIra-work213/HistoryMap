const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * Fetch map data for a specific year
 * @param {number} year - Year to fetch data for (1920-1991)
 * @returns {Promise<Object>} Map data with regions and emotions
 */
export async function fetchMapData(year) {
  const response = await fetch(`${API_URL}/api/map/${year}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch map data: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Fetch detailed data for a specific region and year
 * @param {number} year - Year to fetch data for
 * @param {string} regionName - Name of the region
 * @returns {Promise<Object>} Region detail with diary entries and stats
 */
export async function fetchRegionDetail(year, regionName) {
  const encodedRegion = encodeURIComponent(regionName);
  const response = await fetch(`${API_URL}/api/region/${year}/${encodedRegion}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch region detail: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Check API health
 * @returns {Promise<Object>} Health status
 */
export async function checkHealth() {
  const response = await fetch(`${API_URL}/api/health`);

  if (!response.ok) {
    throw new Error('Health check failed');
  }

  return response.json();
}
