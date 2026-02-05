import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import EmotionLegend from './EmotionLegend';

describe('EmotionLegend', () => {
  it('renders all emotion labels', () => {
    const stats = { fear: 60, joy: 20, neutral: 15, sadness: 5 };
    render(<EmotionLegend stats={stats} />);

    expect(screen.getByText('Страх')).toBeInTheDocument();
    expect(screen.getByText('Радость')).toBeInTheDocument();
    expect(screen.getByText('Нейтраль')).toBeInTheDocument();
    expect(screen.getByText('Грусть')).toBeInTheDocument();
  });

  it('displays correct emotion percentages', () => {
    const stats = { fear: 60, joy: 20, neutral: 15, sadness: 5 };
    render(<EmotionLegend stats={stats} />);

    expect(screen.getByText('(60%)')).toBeInTheDocument();
    expect(screen.getByText('(20%)')).toBeInTheDocument();
    expect(screen.getByText('(15%)')).toBeInTheDocument();
    expect(screen.getByText('(5%)')).toBeInTheDocument();
  });

  it('handles zero values', () => {
    const stats = { fear: 0, joy: 0, neutral: 100, sadness: 0 };
    render(<EmotionLegend stats={stats} />);

    // Use getAllByText for zero values since they appear multiple times
    expect(screen.getAllByText('(0%)').length).toBeGreaterThan(0);
    expect(screen.getByText('(100%)')).toBeInTheDocument();
  });
});
