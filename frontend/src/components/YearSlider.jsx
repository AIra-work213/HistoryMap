import { memo } from 'react';

const YearSlider = memo(({ year, minYear, maxYear, onChange }) => {
  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">{minYear}</span>
        <span className="text-2xl font-bold text-blue-600">{year}</span>
        <span className="text-sm font-medium text-gray-700">{maxYear}</span>
      </div>
      <input
        type="range"
        min={minYear}
        max={maxYear}
        value={year}
        onChange={(e) => onChange(Number(e.target.value))}
        className="year-slider w-full cursor-pointer"
        aria-label={`Выбор года: ${year}`}
      />
    </div>
  );
});

YearSlider.displayName = 'YearSlider';

export default YearSlider;
