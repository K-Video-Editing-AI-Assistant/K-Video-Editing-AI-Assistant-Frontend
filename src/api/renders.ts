import { API_BASE_URL, api, unwrap } from './client';
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

export type RenderResult = {
  renderId: string;
  videoId: string;
  durationSeconds: number;
  fileUrl: string;
  isStub: boolean;
};
export async function getRender(videoId: string, renderId: string, signal?: AbortSignal) {
  const response = await api.get<ApiResponse<RenderResult>>(
    `/api/videos/${encodeURIComponent(videoId)}/renders/${encodeURIComponent(renderId)}`,
    { signal },
  );
  return unwrap(response.data);
}

export function renderFileUrl(fileUrl: string, download = false): string {
  const url = new URL(fileUrl, `${API_BASE_URL}/`);
  if (url.origin !== new URL(API_BASE_URL).origin)
    throw new Error('영상 파일 주소가 올바르지 않아요.');
  if (download) url.searchParams.set('download', 'true');
  return url.toString();
}

export async function downloadRenderFile(fileUrl: string, fileName: string, signal?: AbortSignal) {
  const response = await api.get<Blob>(renderFileUrl(fileUrl, true), {
    responseType: 'blob',
    signal,
    timeout: 0,
  });
  const url = URL.createObjectURL(response.data);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
