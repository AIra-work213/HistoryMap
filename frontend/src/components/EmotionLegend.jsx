import { memo } from 'react';

const EmotionLegend = memo(({ stats }) => {
  const emotions = [
    { key: 'fear', label: 'Страх', color: 'bg-emotion-fear' },
    { key: 'joy', label: 'Радость', color: 'bg-emotion-joy' },
    { key: 'neutral', label: 'Нейтраль', color: 'bg-emotion-neutral' },
    { key: 'sadness', label: 'Грусть', color: 'bg-emotion-sadness' },
  ];

  return (
    <div className="emotion-legend max-w-2xl mx-auto">
      {emotions.map((emotion) => (
        <div key={emotion.key} className="emotion-legend-item">
          <div className={`emotion-color ${emotion.color}`} />
          <span className="font-medium">{emotion.label}</span>
          <span className="text-gray-600">({stats[emotion.key]}%)</span>
        </div>
      ))}
    </div>
  );
});

EmotionLegend.displayName = 'EmotionLegend';

export default EmotionLegend;
