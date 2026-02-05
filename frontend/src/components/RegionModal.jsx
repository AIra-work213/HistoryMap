import { memo } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

const RegionModal = memo(({ region, detail, onClose }) => {
  const emotions = detail.emotions || {};

  // Prepare pie chart data
  const pieData = [
    { name: 'Страх', value: emotions.fear || 0, color: '#ef4444' },
    { name: 'Радость', value: emotions.joy || 0, color: '#22c55e' },
    { name: 'Нейтраль', value: emotions.neutral || 0, color: '#e5e7eb' },
    { name: 'Грусть', value: emotions.sadness || 0, color: '#3b82f6' },
  ].filter((item) => item.value > 0);

  // Prepare population trend data (mock)
  const populationData = [
    { year: detail.year - 2, population: (detail.stats?.population || 1000000) * 0.95 },
    { year: detail.year - 1, population: (detail.stats?.population || 1000000) * 0.98 },
    { year: detail.year, population: detail.stats?.population || 1000000 },
    { year: detail.year + 1, population: (detail.stats?.population || 1000000) * 1.02 },
    { year: detail.year + 2, population: (detail.stats?.population || 1000000) * 1.05 },
  ];

  const diaryEntries = detail.diary_entries || [];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content w-full max-w-2xl mx-4 my-8" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold">
            {region.name} | {detail.year}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Закрыть"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Emotion Pie Chart */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Распределение эмоций</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Diary Entries */}
          <div>
            <h3 className="text-lg font-semibold mb-4">
              Дневниковые записи ({diaryEntries.length})
            </h3>
            {diaryEntries.length > 0 ? (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {diaryEntries.map((entry, index) => (
                  <div
                    key={index}
                    className="p-4 bg-gray-50 rounded-lg border-l-4 border-blue-500"
                  >
                    <p className="text-gray-800 mb-2">"{entry.text}"</p>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>{entry.author}</span>
                      <span>{entry.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 italic">Нет доступных дневниковых записей</p>
            )}
          </div>

          {/* Population Statistics */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Население</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={populationData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip
                  formatter={(value) => [value.toLocaleString(), 'Население']}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="population"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6' }}
                />
              </LineChart>
            </ResponsiveContainer>
            <div className="mt-4 text-sm text-gray-600">
              <p>
                Изменение: <span className={`font-semibold ${detail.stats?.change_percent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {detail.stats?.change_percent >= 0 ? '+' : ''}{detail.stats?.change_percent?.toFixed(1)}%
                </span>
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-4 border-t">
            <button
              onClick={onClose}
              className="btn-secondary w-full"
            >
              ← Назад к карте
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

RegionModal.displayName = 'RegionModal';

export default RegionModal;
