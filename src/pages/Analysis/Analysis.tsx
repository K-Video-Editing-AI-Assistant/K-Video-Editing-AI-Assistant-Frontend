import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import AnalysisFailedModal from '@/components/common/AnalysisFailedModal';
import StepLayout from '@/components/layouts/StepLayout';
import VideoPreview from '@/components/common/VideoPreview';
import Button from '@/components/ui/Button';
import ProgressBar from '@/components/ui/ProgressBar';
import { useUploadStore } from '@/store/useUploadStore';

// Temporary switch to preview the failure modal. TODO: replace with a real backend error.
const SIMULATE_FAILURE = false;

function Analysis() {
  const navigate = useNavigate();
  // The video picked on the upload page
  const file = useUploadStore((state) => state.file);
  const setFile = useUploadStore((state) => state.setFile);
  // Analysis progress from 0 to 100
  const [progress, setProgress] = useState(0);
  // Temporary: when the switch is on, pretend the analysis fails halfway
  const isFailed = SIMULATE_FAILURE && progress >= 40;

  useEffect(() => {
    // Stop the fake progress while the failure modal is open
    if (isFailed) return;

    // Temporary: pretend the analysis is running. Replace with real backend progress later.
    const timer = setInterval(() => {
      setProgress((current) => Math.min(current + 5, 100));
    }, 300);

    // Cleanup: stop the timer when leaving this page
    return () => clearInterval(timer);
  }, [isFailed]);

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

      {isFailed && (
        <AnalysisFailedModal
          file={file}
          // Clear the video and go back to choose another one
          onChangeFile={() => {
            setFile(null);
            navigate('/upload');
          }}
          // Start the analysis again from 0%
          onRetry={() => setProgress(0)}
          onClose={() => navigate('/upload')}
        />
      )}
    </StepLayout>
  );
}

export default Analysis;
