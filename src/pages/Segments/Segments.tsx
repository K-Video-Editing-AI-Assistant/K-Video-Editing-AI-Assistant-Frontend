import { Navigate, useNavigate } from 'react-router-dom';
import SegmentCard from '@/components/common/SegmentCard';
import StepLayout from '@/components/layouts/StepLayout';
import Button from '@/components/ui/Button';
import Metric from '@/components/ui/Metric';
import { useSegmentStore } from '@/store/useSegmentStore';
import { useUploadStore } from '@/store/useUploadStore';
import { formatDuration } from '@/utils/formatDuration';

function Segments() {
  const navigate = useNavigate();
  const file = useUploadStore((state) => state.file);
  const segments = useSegmentStore((state) => state.segments);
  const selectedIds = useSegmentStore((state) => state.selectedIds);
  const toggleSelected = useSegmentStore((state) => state.toggleSelected);
  const selectAll = useSegmentStore((state) => state.selectAll);
  const clearSelection = useSegmentStore((state) => state.clearSelection);

  // No video (e.g. the page was refreshed): go back to the upload step
  if (!file) {
    return <Navigate to='/upload' replace />;
  }

  // Values worked out from the ticked segments
  const selectedSegments = segments.filter((segment) => selectedIds.includes(segment.id));
  const totalSeconds = selectedSegments.reduce(
    (sum, segment) => sum + (segment.end - segment.start),
    0,
  );
  const allSelected = segments.length > 0 && selectedIds.length === segments.length;
  const hasSelection = selectedIds.length > 0;

  return (
    <StepLayout
      currentStep={4}
      title='구간을 선택하세요'
      leftAction={
        <Button variant='secondary' onClick={() => navigate('/request')}>
          이전 단계
        </Button>
      }
      rightAction={
        <>
          {/* TODO: download the selected segments after the backend is ready */}
          <Button variant='accentText' disabled={!hasSelection}>
            선택 영상 다운로드
          </Button>
          {/* TODO: connect to the next page (05) after it is built */}
          <Button disabled={!hasSelection}>선택 영상 합치기</Button>
        </>
      }
    >
      {/* Summary row */}
      <div className='mb-6 flex items-center gap-3'>
        <Metric label='선택' value={`${selectedIds.length}개`} tone='success' />
        <Metric label='총 길이' value={formatDuration(totalSeconds)} tone='success' />
        <Button
          variant='secondary'
          size='sm'
          className='ml-auto'
          onClick={allSelected ? clearSelection : selectAll}
        >
          {allSelected ? '선택 해제' : '전체 선택'}
        </Button>
      </div>

      {/* Segment cards */}
      <ul className='flex flex-col gap-6 pb-8'>
        {segments.map((segment) => (
          <li key={segment.id}>
            <SegmentCard
              segment={segment}
              file={file}
              selected={selectedIds.includes(segment.id)}
              onToggle={() => toggleSelected(segment.id)}
              // TODO: open the preview modal and download one segment later
            />
          </li>
        ))}
      </ul>
    </StepLayout>
  );
}

export default Segments;
