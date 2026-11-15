import { api, unwrap } from './client';
import type { ApiResponse } from './client';

export type TranscriptSegment = { startSeconds: number; endSeconds: number; text: string };
export async function getTranscript(videoId: string, signal?: AbortSignal) {
  const response = await api.get<ApiResponse<{ segments: TranscriptSegment[] }>>(
    `/api/videos/${encodeURIComponent(videoId)}/transcript`,
    { signal },
  );
  return unwrap(response.data).segments;
}
