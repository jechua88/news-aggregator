import { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import NewsAPI from '../services/api';
import { useNewsData } from './useNewsData';

jest.mock('axios', () => {
  const mockInstance = {
    get: jest.fn(),
    post: jest.fn(),
  };
  return {
    __esModule: true,
    default: {
      create: () => mockInstance,
    },
  };
});

jest.mock('../services/api');

const mockedNewsAPI = NewsAPI as jest.Mocked<typeof NewsAPI>;

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

const sampleResponse = {
  sources: [
    {
      name: 'Bloomberg',
      status: 'active',
      headlines: [
        {
          title: 'Bloomberg sample headline',
          link: 'https://example.com/bloomberg',
          published_at: new Date().toISOString(),
          source: 'Bloomberg',
        },
      ],
      story_count: 1,
      last_updated: new Date().toISOString(),
    },
    {
      name: 'CNBC',
      status: 'active',
      headlines: [
        {
          title: 'CNBC sample headline',
          link: 'https://example.com/cnbc',
          published_at: new Date().toISOString(),
          source: 'CNBC',
        },
      ],
      story_count: 1,
      last_updated: new Date().toISOString(),
    },
  ],
  total_sources: 2,
  active_sources: 2,
  last_updated: new Date().toISOString(),
  cache_status: 'fresh',
};

describe('useNewsData', () => {
  beforeEach(() => {
    mockedNewsAPI.getNews.mockReset();
    mockedNewsAPI.refreshNews.mockReset();
  });

  it('fetches news data successfully', async () => {
    mockedNewsAPI.getNews.mockResolvedValueOnce(sampleResponse);

    const { result } = renderHook(() => useNewsData(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.total_sources).toBe(2);
    expect(mockedNewsAPI.getNews).toHaveBeenCalledTimes(1);
  });

  it('refreshes data on demand', async () => {
    mockedNewsAPI.getNews.mockResolvedValue(sampleResponse);
    mockedNewsAPI.refreshNews.mockResolvedValueOnce({ message: 'ok', sources_to_refresh: 2 });

    const { result } = renderHook(() => useNewsData(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    mockedNewsAPI.getNews.mockResolvedValueOnce(sampleResponse);

    await act(async () => {
      await result.current.refresh();
    });

    expect(mockedNewsAPI.refreshNews).toHaveBeenCalledTimes(1);
    expect(mockedNewsAPI.getNews).toHaveBeenCalledTimes(2);
  });
});
