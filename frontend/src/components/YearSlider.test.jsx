import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import YearSlider from './YearSlider';

describe('YearSlider', () => {
  it('renders with correct year', () => {
    render(<YearSlider year={1941} minYear={1920} maxYear={1991} onChange={() => {}} />);

    const slider = screen.getByRole('slider', { name: /Выбор года/i });
    expect(slider).toBeInTheDocument();
    expect(slider).toHaveValue('1941');
  });

  it('calls onChange when slider changes', () => {
    const handleChange = vi.fn();
    render(
      <YearSlider year={1941} minYear={1920} maxYear={1991} onChange={handleChange} />
    );

    const slider = screen.getByRole('slider', { name: /Выбор года/i });

    // Simulate change event
    fireEvent.change(slider, { target: { value: '1945' } });

    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it('displays min and max years', () => {
    render(<YearSlider year={1941} minYear={1920} maxYear={1991} onChange={() => {}} />);

    expect(screen.getByText('1920')).toBeInTheDocument();
    expect(screen.getByText('1991')).toBeInTheDocument();
  });
});
