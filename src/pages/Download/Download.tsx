import { Navigate, useNavigate } from 'react-router-dom';
import SegmentPlayer from '@/components/common/SegmentPlayer';
import StepLayout from '@/components/layouts/StepLayout';
import Button from '@/components/ui/Button';
import Metric from '@/components/ui/Metric';
import { useSegmentStore } from '@/store/useSegmentStore';
import { useUploadStore } from '@/store/useUploadStore';
import { formatDuration } from '@/utils/formatDuration';

// Placeholder values. The real result video and its info will come from the backend later.
const MOCK_SUBTITLE = '나무는 광합성으로 탄소를 흡수합니다.';
const MOCK_RESOLUTION = '1920 × 1080';

function Download() {
  const navigate = useNavigate();
  const file = useUploadStore((state) => state.file);
  const segments = useSegmentStore((state) => state.segments);
  const editIds = useSegmentStore((state) => state.editIds);

  // No video (e.g. the page was refreshed): go back to the upload step
  if (!file) {
    return <Navigate to='/upload' replace />;
  }

  // The segments in merge order (editIds holds only the ids)
  const editSegments = editIds.flatMap((id) => segments.filter((segment) => segment.id === id));

  // Nothing was merged (e.g. opened the address directly): go back to the selection step
  if (editSegments.length === 0) {
    return <Navigate to='/segments' replace />;
  }

  // Length of the merged video = the sum of all segment lengths
  const totalSeconds = editSegments.reduce(
    (sum, segment) => sum + (segment.end - segment.start),
    0,
  );
  // "숲_강의.mp4" -> "숲_강의_편집본.mp4"
  const resultName = `${file.name.replace(/\.[^.]+$/, '')}_편집본.mp4`;
  // Stand-in for the merged video until the backend provides one
  const firstSegment = editSegments[0];

  return (
    <StepLayout
      currentStep={6}
      title='완성된 영상을 확인하세요'
      leftAction={
        <Button variant='secondary' onClick={() => navigate('/edit')}>
          다시 편집
        </Button>
      }
      // TODO: download the real result file after the backend is ready
      rightAction={<Button className='w-63'>영상 다운로드</Button>}
    >
      <div className='mx-auto flex max-w-208 flex-col gap-6 pb-8'>
        <SegmentPlayer
          file={file}
          start={firstSegment.start}
          end={firstSegment.end}
          subtitle={MOCK_SUBTITLE}
        />

        <div className='flex flex-wrap items-center justify-center gap-4 rounded-2xl border border-line bg-surface px-6 py-6'>
          <p className='text-value font-bold'>{resultName}</p>
          <Metric label='길이' value={formatDuration(totalSeconds)} />
          <Metric label='구간' value={`${editSegments.length}개`} />
          <Metric label='해상도' value={MOCK_RESOLUTION} />
        </div>
      </div>
    </StepLayout>
  );
}

export default Download;
