import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { NewsSource } from '../src/components/NewsSource';
import axios from 'axios';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock data
const mockSourceData = {
  name: 'Wall Street Journal',
  headlines: [
    {
      title: 'Markets Rally on Economic Data',
      link: 'https://www.wsj.com/articles/markets-rally-123456',
      published_at: '2025-09-11T10:00:00Z',
      source: 'Wall Street Journal'
    }
  ],
  status: 'active',
  last_updated: '2025-09-11T10:00:00Z',
  story_count: 1
};

describe('NewsSource Component', () => {
  beforeEach(() => {
    mockedAxios.get.mockClear();
  });

  test('renders source name and headlines', () => {
    // This test will fail until component is implemented
    render(<NewsSource source={mockSourceData} />);
    
    // These assertions should fail until implementation
    expect(screen.getByText('Wall Street Journal')).toBeInTheDocument();
    expect(screen.getByText('Markets Rally on Economic Data')).toBeInTheDocument();
  });

  test('shows loading state when loading', () => {
    // This test will fail until loading state is implemented
    render(<NewsSource source={mockSourceData} isLoading={true} />);
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  test('shows error message when source has error status', () => {
    // This test will fail until error state is implemented
    const errorSource = { ...mockSourceData, status: 'error' };
    render(<NewsSource source={errorSource} />);
    
    expect(screen.getByText(/Error loading news/)).toBeInTheDocument();
  });

  test('renders headline links that open in new tab', () => {
    // This test will fail until links are implemented
    render(<NewsSource source={mockSourceData} />);
    
    const link = screen.getByText('Markets Rally on Economic Data');
    expect(link).toHaveAttribute('href', 'https://www.wsj.com/articles/markets-rally-123456');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  test('formats publication time correctly', () => {
    // This test will fail until time formatting is implemented
    render(<NewsSource source={mockSourceData} />);
    
    expect(screen.getByText(/10:00 AM/)).toBeInTheDocument();
  });
});