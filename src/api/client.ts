import axios from 'axios';

export const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  'https://k-video-editing-ai-assistant-backend.fastapicloud.dev'
).replace(/\/$/, '');

export const api = axios.create({ baseURL: API_BASE_URL, timeout: 120_000 });

export type ApiResponse<T> = {
  success: boolean;
  data: T | null;
  error: { code: string; message: string } | null;
};

export function unwrap<T>(response: ApiResponse<T>): T {
  if (!response.success || response.data === null) {
    throw new Error(response.error?.message || '요청을 처리하지 못했어요.');
  }
  return response.data;
}

export function errorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.error?.message;
    if (typeof message === 'string') return message;
    if (error.code === 'ECONNABORTED') return '응답 시간이 초과됐어요. 잠시 후 다시 시도해 주세요.';
    if (!error.response) return '서버에 연결하지 못했어요. 네트워크 연결을 확인해 주세요.';
    return `요청에 실패했어요. (${error.response.status})`;
  }
  return error instanceof Error ? error.message : '요청을 처리하지 못했어요.';
}
