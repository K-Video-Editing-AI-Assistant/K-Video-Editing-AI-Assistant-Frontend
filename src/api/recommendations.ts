import { api, unwrap } from './client';
import type { ApiResponse } from './client';

export type Recommendation = {
  recommendationId: string;
  videoId: string;
  query: string;
  targetDurationSeconds: number | null;
  totalDurationSeconds: number;
  suggestedTitle: string;
  clips: { clipId: string; startSeconds: number; endSeconds: number; reason: string }[];
  isStub: boolean;
  recommenderVersion: string;
};
export async function createRecommendation(
  videoId: string,
  query: string,
  targetDurationSeconds: number,
  signal?: AbortSignal,
) {
  const response = await api.post<ApiResponse<Recommendation>>(
    `/api/videos/${encodeURIComponent(videoId)}/recommendations`,
    { query, targetDurationSeconds },
    { signal, timeout: 300_000 },
  );
  return unwrap(response.data);
}

export async function getRecommendation(
  videoId: string,
  recommendationId: string,
  signal?: AbortSignal,
) {
  const response = await api.get<ApiResponse<Recommendation>>(
    `/api/videos/${encodeURIComponent(videoId)}/recommendations/${encodeURIComponent(recommendationId)}`,
    { signal },
  );
  return unwrap(response.data);
}
