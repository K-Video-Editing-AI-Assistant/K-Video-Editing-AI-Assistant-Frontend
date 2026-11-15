import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { errorMessage } from '@/api/client';
import { waitForJob } from '@/api/jobs';
import AnalysisFailedModal from '@/components/common/AnalysisFailedModal';
import StepLayout from '@/components/layouts/StepLayout';
import VideoPreview from '@/components/common/VideoPreview';
import Button from '@/components/ui/Button';
import ProgressBar from '@/components/ui/ProgressBar';
import { useUploadStore } from '@/store/useUploadStore';

function Analysis() {
  const navigate = useNavigate();
  const { file, jobId, prepared, setFile, setPrepared } = useUploadStore();
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!file || !jobId || prepared) return;
    const controller = new AbortController();
    void waitForJob(jobId, controller.signal, (job) => setProgress(job.progress))
      .then(() => {
        setPrepared(true);
        navigate('/request', { replace: true });
      })
      .catch((cause: unknown) => {
        if (!controller.signal.aborted) setError(errorMessage(cause));
      });
    return () => controller.abort();
  }, [file, jobId, prepared, setPrepared, navigate]);

  if (!file || !jobId) return <Navigate to='/upload' replace />;
  if (prepared) return <Navigate to='/request' replace />;

  return (
    <StepLayout
      currentStep={2}
      title='영상 분석 중 . . .'
      titleAlign='center'
      leftAction={
        <Button variant='secondary' onClick={() => navigate('/upload')}>
          이전 단계
        </Button>
      }
      rightAction={<Button disabled>분석 중…</Button>}
    >
      <div className='mx-auto flex max-w-200 flex-col gap-8'>
        <VideoPreview file={file} />
        <ProgressBar value={progress} />
        <p role={error ? 'alert' : 'status'} className={error ? 'text-error' : 'text-muted'}>
          {error || '자막 추출 및 분석 중이에요. 완료되면 자동으로 이동합니다.'}
        </p>
      </div>
      {error && (
        <AnalysisFailedModal
          file={file}
          onChangeFile={() => {
            setFile(null);
            navigate('/upload');
          }}
          onRetry={() => {
            setFile(file);
            navigate('/upload');
          }}
          onClose={() => navigate('/upload')}
        />
      )}
    </StepLayout>
  );
}

export default Analysis;
