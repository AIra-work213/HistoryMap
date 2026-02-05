import { useState, useCallback, useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: new URL('leaflet/dist/images/marker-icon-2x.png', import.meta.url).href,
  iconUrl: new URL('leaflet/dist/images/marker-icon.png', import.meta.url).href,
  shadowUrl: new URL('leaflet/dist/images/marker-shadow.png', import.meta.url).href,
});

// Emotion color mapping
const getEmotionColor = (emotions) => {
  if (!emotions) return '#e5e7eb';

  const { fear, joy, neutral, sadness } = emotions;

  // Calculate dominant emotion
  const max = Math.max(fear, joy, neutral, sadness);

  if (max === fear || max === sadness) {
    // Red for fear/sadness (darker for higher intensity)
    const intensity = Math.floor(200 - (fear + sadness) * 100);
    return `rgb(${intensity}, ${Math.floor(intensity * 0.3)}, ${Math.floor(intensity * 0.3)})`;
  } else if (max === joy) {
    // Green for joy
    const intensity = Math.floor(200 - joy * 100);
    return `rgb(${Math.floor(intensity * 0.3)}, ${intensity}, ${Math.floor(intensity * 0.3)})`;
  }

  // Gray for neutral
  return '#e5e7eb';
};

const MapView = ({ year, regions, onRegionClick }) => {
  const [geoJsonData, setGeoJsonData] = useState(null);
  const [hoveredRegion, setHoveredRegion] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Load GeoJSON
  useEffect(() => {
    const loadGeoJson = async () => {
      try {
        // In development, use the local file
        // In production, this could be served from the backend
        const response = await fetch('/urss.geojson');
        if (!response.ok) {
          throw new Error('Failed to load GeoJSON');
        }
        const data = await response.json();

        // Add emotion data to each feature
        const featuresWithEmotions = data.features.map((feature) => {
          const regionName = feature.properties?.name;
          const regionData = regions.find((r) => r.name === regionName);

          return {
            ...feature,
            properties: {
              ...feature.properties,
              emotions: regionData?.emotions || { fear: 0, joy: 0, neutral: 1, sadness: 0 },
              diaryCount: regionData?.diary_count || 0,
            },
          };
        });

        setGeoJsonData({
          ...data,
          features: featuresWithEmotions,
        });
      } catch (error) {
        console.error('Error loading GeoJSON:', error);

        // Create fallback GeoJSON with region data
        const fallbackFeatures = regions.map((region, index) => ({
          type: 'Feature',
          id: region.geo_id || `region-${index}`,
          properties: {
            name: region.name,
            emotions: region.emotions || { fear: 0, joy: 0, neutral: 1, sadness: 0 },
            diaryCount: region.diary_count || 0,
          },
          geometry: {
            type: 'Point',
            coordinates: [37.6173 + (index % 10) * 2, 55.7558 + Math.floor(index / 10) * 2],
          },
        }));

        setGeoJsonData({
          type: 'FeatureCollection',
          features: fallbackFeatures,
        });
      }
    };

    loadGeoJson();
  }, [regions]);

  // Style function for GeoJSON layers
  const styleFeature = useCallback((feature) => {
    const emotions = feature.properties?.emotions || {};
    return {
      fillColor: getEmotionColor(emotions),
      weight: 2,
      opacity: 1,
      color: 'white',
      dashArray: '3',
      fillOpacity: 0.7,
    };
  }, []);

  // Handle feature hover
  const onEachFeature = useCallback((feature, layer) => {
    layer.on({
      mouseover: (e) => {
        const layer = e.target;
        layer.setStyle({
          weight: 3,
          color: '#3b82f6',
          dashArray: '',
          fillOpacity: 0.9,
        });
        layer.bringToFront();

        setHoveredRegion({
          name: feature.properties?.name || 'Неизвестный регион',
          emotions: feature.properties?.emotions || {},
          diaryCount: feature.properties?.diaryCount || 0,
        });
      },
      mouseout: (e) => {
        const layer = e.target;
        layer.setStyle(styleFeature(feature));
        layer.bringToBack();
        setHoveredRegion(null);
      },
      click: (e) => {
        const region = {
          name: feature.properties?.name,
          geoId: feature.id,
          emotions: feature.properties?.emotions || {},
        };
        onRegionClick(region);
        L.DomEvent.stopPropagation(e);
      },
    });
  }, [onRegionClick, styleFeature]);

  // Track mouse position for tooltip
  const handleMouseMove = useCallback((e) => {
    setMousePosition({ x: e.clientX, y: e.clientY });
  }, []);

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, [handleMouseMove]);

  if (!geoJsonData) {
    return (
      <div className="w-full h-[600px] bg-gray-200 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4" />
          <p className="text-gray-600">Загрузка карты...</p>
        </div>
      </div>
    );
  }

  // Calculate center for USSR
  const center = [55, 84];
  const bounds = [
    [35, 20], // Southwest
    [77, 190], // Northeast
  ];

  return (
    <div className="relative w-full" onMouseMove={handleMouseMove}>
      <MapContainer
        center={center}
        zoom={3}
        minZoom={2}
        maxZoom={6}
        className="w-full h-[500px] sm:h-[600px] rounded-lg shadow-lg"
        bounds={bounds}
        maxBounds={bounds}
        maxBoundsViscosity={1.0}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {geoJsonData && (
          <GeoJSON
            data={geoJsonData}
            style={styleFeature}
            onEachFeature={onEachFeature}
          />
        )}
      </MapContainer>

      {/* Custom tooltip */}
      {hoveredRegion && (
        <div
          className="fixed region-tooltip z-[1000] pointer-events-none"
          style={{
            left: mousePosition.x + 15,
            top: mousePosition.y + 15,
          }}
        >
          <div className="font-bold">{hoveredRegion.name}</div>
          <div className="text-xs">
            Страх: {Math.round((hoveredRegion.emotions.fear || 0) * 100)}%
          </div>
          <div className="text-xs">
            Радость: {Math.round((hoveredRegion.emotions.joy || 0) * 100)}%
          </div>
          <div className="text-xs text-gray-300">
            {hoveredRegion.diaryCount} записей
          </div>
        </div>
      )}
    </div>
  );
};

export default MapView;
