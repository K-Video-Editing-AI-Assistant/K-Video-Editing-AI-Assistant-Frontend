import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import StepLayout from '@/components/layouts/StepLayout';
import VideoPreview from '@/components/common/VideoPreview';
import Button from '@/components/ui/Button';
import ProgressBar from '@/components/ui/ProgressBar';
import { useUploadStore } from '@/store/useUploadStore';

function Analysis() {
  const navigate = useNavigate();
  // The video picked on the upload page
  const file = useUploadStore((state) => state.file);
  // Analysis progress from 0 to 100
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Temporary: pretend the analysis is running. Replace with real backend progress later.
    const timer = setInterval(() => {
      setProgress((current) => Math.min(current + 5, 100));
    }, 300);

    // Cleanup: stop the timer when leaving this page
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // When the analysis finishes, move on to the next step
    if (progress >= 100) {
      navigate('/request');
    }
  }, [progress, navigate]);

  // No video (e.g. the page was refreshed or opened directly): go back to the upload step
  if (!file) {
    return <Navigate to='/upload' replace />;
  }

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
      {/* max-w-200 = 800px wide, centered like the Figma design */}
      <div className='mx-auto flex max-w-200 flex-col gap-8'>
        <VideoPreview file={file} />
        <ProgressBar value={progress} />
      </div>
    </StepLayout>
  );
}

export default Analysis;
