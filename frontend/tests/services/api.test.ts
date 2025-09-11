import axios from 'axios';
import { NewsService } from '../src/services/api';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock data
const mockNewsResponse = {
  sources: [
    {
      name: 'Wall Street Journal',
      headlines: [
        {
          title: 'Test Headline 1',
          link: 'https://example.com/1',
          published_at: '2025-09-11T10:00:00Z',
          source: 'Wall Street Journal'
        }
      ],
      status: 'active',
      last_updated: '2025-09-11T10:00:00Z',
      story_count: 1
    }
  ],
  total_sources: 1,
  active_sources: 1,
  last_updated: '2025-09-11T10:00:00Z',
  cache_status: 'fresh'
};

describe('API Service', () => {
  beforeEach(() => {
    mockedAxios.get.mockClear();
    mockedAxios.post.mockClear();
  });

  test('fetches news data successfully', async () => {
    // This test will fail until API service is implemented
    mockedAxios.get.mockResolvedValue({ data: mockNewsResponse });
    
    const result = await NewsService.fetchNews();
    
    // These assertions should fail until implementation
    expect(mockedAxios.get).toHaveBeenCalledWith('/api/news');
    expect(result).toEqual(mockNewsResponse);
    expect(result.sources).toHaveLength(1);
    expect(result.total_sources).toBe(1);
  });

  test('handles API errors gracefully', async () => {
    // This test will fail until error handling is implemented
    mockedAxios.get.mockRejectedValue(new Error('Network error'));
    
    await expect(NewsService.fetchNews()).rejects.toThrow('Network error');
  });

  test('fetches sources data', async () => {
    // This test will fail until sources endpoint is implemented
    const mockSources = [
      {
        name: 'Wall Street Journal',
        rss_url: 'https://feeds.wsj.com/rss/market_news',
        fallback_url: 'https://www.wsj.com/news/markets',
        enabled: true,
        max_stories: 10
      }
    ];
    
    mockedAxios.get.mockResolvedValue({ data: mockSources });
    
    const result = await NewsService.fetchSources();
    
    expect(mockedAxios.get).toHaveBeenCalledWith('/api/sources');
    expect(result).toEqual(mockSources);
  });

  test('triggers news refresh', async () => {
    // This test will fail until refresh endpoint is implemented
    const mockRefreshResponse = {
      message: 'Refresh triggered successfully',
      sources_to_refresh: 1
    };
    
    mockedAxios.post.mockResolvedValue({ data: mockRefreshResponse });
    
    const result = await NewsService.refreshNews();
    
    expect(mockedAxios.post).toHaveBeenCalledWith('/api/refresh');
    expect(result).toEqual(mockRefreshResponse);
  });

  test('fetches source status', async () => {
    // This test will fail until source status endpoint is implemented
    const mockStatus = {
      source: 'Wall Street Journal',
      status: 'active',
      last_attempt: '2025-09-11T10:00:00Z',
      last_success: '2025-09-11T10:00:00Z'
    };
    
    mockedAxios.get.mockResolvedValue({ data: mockStatus });
    
    const result = await NewsService.getSourceStatus('Wall Street Journal');
    
    expect(mockedAxios.get).toHaveBeenCalledWith('/api/sources/Wall Street Journal/status');
    expect(result).toEqual(mockStatus);
  });
});