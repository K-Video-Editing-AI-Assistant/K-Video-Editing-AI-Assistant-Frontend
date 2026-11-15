import { api, unwrap } from './client';
import type { ApiResponse } from './client';

export type TimeRange = { startSeconds: number; endSeconds: number };
export type RenderInput = {
  recommendationId: string;
  clips: TimeRange[];
  subtitleStyle?: 'basic' | 'bold' | 'box';
  subtitles?: (TimeRange & { text: string })[] | null;
};
export async function createRender(videoId: string, input: RenderInput, signal?: AbortSignal) {
  const response = await api.post<ApiResponse<{ videoId: string; jobId: string }>>(
    `/api/videos/${encodeURIComponent(videoId)}/renders`,
    input,
    { signal },
  );
  return unwrap(response.data);
}

export function toTimeRanges(segments: { start: number; end: number }[]): TimeRange[] {
  return segments.map(({ start, end }) => ({
    startSeconds: Math.round(start * 1000) / 1000,
    endSeconds: Math.round(end * 1000) / 1000,
  }));
}
