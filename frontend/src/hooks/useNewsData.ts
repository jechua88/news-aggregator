import { useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import NewsAPI, { NewsResponse } from '../services/api';

const STALE_TIME = 1000 * 60 * 15; // 15 minutes

export const useNewsData = () => {
  const query = useQuery<NewsResponse, Error>({
    queryKey: ['news'],
    queryFn: () => NewsAPI.getNews(),
    staleTime: STALE_TIME,
    refetchInterval: STALE_TIME,
  });

  const refresh = useCallback(async () => {
    await NewsAPI.refreshNews();
    await query.refetch();
  }, [query]);

  return {
    ...query,
    refresh,
  };
};

