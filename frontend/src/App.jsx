import { useState, useEffect, useCallback } from 'react';
import MapView from './components/MapView';
import YearSlider from './components/YearSlider';
import EmotionLegend from './components/EmotionLegend';
import RegionModal from './components/RegionModal';
import LoadingSpinner from './components/LoadingSpinner';
import { fetchMapData, fetchRegionDetail } from './services/api';
import './App.css';

const MIN_YEAR = 1920;
const MAX_YEAR = 1991;

function App() {
  const [year, setYear] = useState(1941);
  const [mapData, setMapData] = useState(null);
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [regionDetail, setRegionDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch map data when year changes
  useEffect(() => {
    const loadMapData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchMapData(year);
        setMapData(data);
      } catch (err) {
        setError(err.message);
        console.error('Error loading map data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadMapData();
  }, [year]);

  // Handle region click
  const handleRegionClick = useCallback(async (region) => {
    setSelectedRegion(region);
    setLoading(true);
    try {
      const detail = await fetchRegionDetail(year, region.name);
      setRegionDetail(detail);
    } catch (err) {
      console.error('Error loading region detail:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [year]);

  // Close modal
  const handleCloseModal = useCallback(() => {
    setSelectedRegion(null);
    setRegionDetail(null);
  }, []);

  // Calculate emotion statistics
  const emotionStats = useCallback(() => {
    if (!mapData || !mapData.regions) {
      return { fear: 0, joy: 0, neutral: 0, sadness: 0 };
    }

    const totals = { fear: 0, joy: 0, neutral: 0, sadness: 0 };
    let count = 0;

    mapData.regions.forEach((region) => {
      if (region.emotions) {
        totals.fear += region.emotions.fear || 0;
        totals.joy += region.emotions.joy || 0;
        totals.neutral += region.emotions.neutral || 0;
        totals.sadness += region.emotions.sadness || 0;
        count++;
      }
    });

    if (count === 0) return totals;

    return {
      fear: Math.round((totals.fear / count) * 100),
      joy: Math.round((totals.joy / count) * 100),
      neutral: Math.round((totals.neutral / count) * 100),
      sadness: Math.round((totals.sadness / count) * 100),
    };
  }, [mapData]);

  const stats = emotionStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center">
            Эмоции СССР <span className="text-blue-600">{year}</span>
          </h1>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Controls */}
        <div className="mb-6 space-y-4">
          <YearSlider
            year={year}
            minYear={MIN_YEAR}
            maxYear={MAX_YEAR}
            onChange={setYear}
          />

          <EmotionLegend stats={stats} />
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            Ошибка загрузки данных: {error}
          </div>
        )}

        {/* Map */}
        <div className="relative">
          {loading && <LoadingSpinner />}

          <MapView
            year={year}
            regions={mapData?.regions || []}
            onRegionClick={handleRegionClick}
          />
        </div>

        {/* Info text */}
        <p className="mt-4 text-sm text-gray-600 text-center">
          Кликните на регион, чтобы увидеть дневниковые записи и детальную статистику
        </p>
      </main>

      {/* Modal */}
      {selectedRegion && regionDetail && (
        <RegionModal
          region={selectedRegion}
          detail={regionDetail}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}

export default App;
