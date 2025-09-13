import axios, { AxiosResponse } from 'axios';

// Prefer environment variable, fallback to window origin (for dev),
// and finally a sensible default for local development.
const runtimeBase =
  (process.env.REACT_APP_API_BASE_URL && `${process.env.REACT_APP_API_BASE_URL}`) ||
  (typeof window !== 'undefined' ? window.location.origin : '') ||
  'https://test1.jechua.com';

const API_BASE_URL = `${runtimeBase.replace(/\/$/, '')}/api`;

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface NewsHeadline {
  title: string;
  link: string;
  published_at: string;
  source: string;
}

export interface NewsSource {
  name: string;
  status: string;
  headlines: NewsHeadline[];
  last_updated?: string;
  story_count: number;
}

export interface NewsResponse {
  sources: NewsSource[];
  total_sources: number;
  active_sources: number;
  last_updated: string;
  cache_status: string;
}

export interface SourceStatus {
  source: string;
  status: string;
  last_attempt: string;
  last_success?: string;
  error?: string;
}

export interface RefreshResponse {
  message: string;
  sources_to_refresh: number;
  errors?: string[];
}

export class NewsAPI {
  static async getNews(): Promise<NewsResponse> {
    const response: AxiosResponse<NewsResponse> = await api.get('/news');
    return response.data;
  }

  static async getSources(): Promise<NewsSource[]> {
    const response: AxiosResponse<NewsSource[]> = await api.get('/sources');
    return response.data;
  }

  static async getSourceStatus(sourceName: string): Promise<SourceStatus> {
    const encodedSourceName = encodeURIComponent(sourceName);
    const response: AxiosResponse<SourceStatus> = await api.get(`/sources/${encodedSourceName}/status`);
    return response.data;
  }

  static async refreshNews(): Promise<RefreshResponse> {
    const response: AxiosResponse<RefreshResponse> = await api.post('/refresh');
    return response.data;
  }
}

export default NewsAPI;
