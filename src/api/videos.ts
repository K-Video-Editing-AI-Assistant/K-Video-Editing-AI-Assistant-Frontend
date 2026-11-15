import { api, unwrap } from './client';
import type { ApiResponse } from './client';

export type VideoUploadAccepted = { videoId: string; jobId: string };

export async function uploadVideo(file: File, signal?: AbortSignal) {
  const form = new FormData();
  form.append('file', file);
  const response = await api.post<ApiResponse<VideoUploadAccepted>>('/api/videos', form, {
    signal,
    timeout: 0,
  });
  return unwrap(response.data);
}
