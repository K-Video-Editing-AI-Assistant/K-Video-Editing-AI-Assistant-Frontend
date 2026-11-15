import { useEffect, useRef, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { errorMessage } from '@/api/client';
import { downloadRenderFile, getRender, renderFileUrl } from '@/api/renders';
import type { RenderResult } from '@/api/renders';
import StepLayout from '@/components/layouts/StepLayout';
import Button from '@/components/ui/Button';
import Metric from '@/components/ui/Metric';
import { useUploadStore } from '@/store/useUploadStore';
import { useRenderStore } from '@/store/useRenderStore';
import { formatDuration } from '@/utils/formatDuration';

function Download() {
  const navigate = useNavigate();
  const file = useUploadStore((state) => state.file);
  const videoId = useUploadStore((state) => state.videoId);
  const rendered = useRenderStore();
  const [result, setResult] = useState<RenderResult | null>(null);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const downloadController = useRef<AbortController | null>(null);
  const downloading = useRef(false);
  useEffect(() => () => downloadController.current?.abort(), []);
  const handleDownload = async () => {
    if (!result || downloading.current || !file) return;
    downloading.current = true;
    setIsDownloading(true);
    setError('');
    downloadController.current = new AbortController();
    try {
      await downloadRenderFile(
        result.fileUrl,
        `${file.name.replace(/\.[^.]+$/, '')}_편집본.mp4`,
        downloadController.current.signal,
      );
    } catch (cause) {
      if (!downloadController.current.signal.aborted) setError(errorMessage(cause));
    } finally {
      downloading.current = false;
      setIsDownloading(false);
    }
  };
  useEffect(() => {
    if (!videoId || !rendered.renderId || videoId !== rendered.videoId) return;
    const controller = new AbortController();
    void getRender(videoId, rendered.renderId, controller.signal)
      .then((response) => {
        if (!controller.signal.aborted) setResult(response);
      })
      .catch((cause: unknown) => {
        if (!controller.signal.aborted) setError(errorMessage(cause));
      });
    return () => controller.abort();
  }, [videoId, rendered.videoId, rendered.renderId, attempt]);

  if (!file) return <Navigate to='/upload' replace />;
  if (!rendered.renderId || videoId !== rendered.videoId) return <Navigate to='/edit' replace />;
  const resultName = `${file.name.replace(/\.[^.]+$/, '')}_편집본.mp4`;
  return (
    <StepLayout
      currentStep={6}
      title='완성된 영상을 확인하세요'
      leftAction={
        <Button variant='secondary' onClick={() => navigate('/edit')}>
          다시 편집
        </Button>
      }
      rightAction={
        <Button disabled={!result || isDownloading} onClick={handleDownload} className='w-63'>
          {isDownloading ? '다운로드 중…' : '영상 다운로드'}
        </Button>
      }
    >
      <div className='mx-auto flex max-w-208 flex-col gap-6 pb-8'>
        {!result && !error && <p role='status'>생성 결과를 불러오는 중…</p>}
        {error && (
          <div role='alert'>
            <p className='text-error'>{error}</p>
            <Button
              onClick={() => {
                setError('');
                setResult(null);
                setAttempt((value) => value + 1);
              }}
            >
              다시 불러오기
            </Button>
          </div>
        )}
        {result && (
          <>
            <video
              controls
              src={renderFileUrl(result.fileUrl)}
              className='w-full rounded-2xl bg-black'
              aria-label='생성된 영상'
            />
            {result.isStub && (
              <p role='status' className='text-muted'>
                실제 편집 영상이 아닌 개발용 결과입니다.
              </p>
            )}
            <div className='flex flex-wrap items-center justify-center gap-4 rounded-2xl border border-line bg-surface px-6 py-6'>
              <p className='text-value font-bold'>{resultName}</p>
              <Metric label='길이' value={formatDuration(result.durationSeconds)} />
              <Metric label='구간' value={`${rendered.clipCount}개`} />
            </div>
          </>
        )}
      </div>
    </StepLayout>
  );
}
export default Download;
