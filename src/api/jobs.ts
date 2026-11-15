import { api, unwrap } from './client';
import type { ApiResponse } from './client';

export type JobStatus = {
  jobId: string;
  videoId: string | null;
  kind: 'prepare' | 'recommend' | 'render';
  state: 'queued' | 'running' | 'succeeded' | 'failed';
  stage: string | null;
  progress: number;
  resultRef: string | null;
  errorMessage: string | null;
};

export async function getJob(jobId: string, signal?: AbortSignal) {
  const response = await api.get<ApiResponse<JobStatus>>(`/api/jobs/${encodeURIComponent(jobId)}`, {
    signal,
  });
  return unwrap(response.data);
}

function pause(signal: AbortSignal, milliseconds: number) {
  return new Promise<void>((resolve, reject) => {
    const abort = () => {
      clearTimeout(timer);
      reject(new DOMException('조회가 취소됐습니다.', 'AbortError'));
    };
    const timer = setTimeout(() => {
      signal.removeEventListener('abort', abort);
      resolve();
    }, milliseconds);
    if (signal.aborted) abort();
    else signal.addEventListener('abort', abort, { once: true });
  });
}

export async function waitForJob(
  jobId: string,
  signal: AbortSignal,
  onUpdate: (job: JobStatus) => void = () => {},
) {
  while (!signal.aborted) {
    const job = await getJob(jobId, signal);
    signal.throwIfAborted();
    onUpdate(job);
    if (job.state === 'failed') throw new Error(job.errorMessage || '작업에 실패했어요.');
    if (job.state === 'succeeded') return job;
    await pause(signal, 2000);
  }
  throw new DOMException('조회가 취소됐습니다.', 'AbortError');
}
