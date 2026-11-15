import { getRecommendation } from '@/api/recommendations';
import { errorMessage } from '@/api/client';
import { useEffect, useRef, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import PreviewModal from '@/components/common/PreviewModal';
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
  // The segment shown in the preview modal (null = modal closed)
  const [previewId, setPreviewId] = useState<string | null>(null);
  const startEdit = useSegmentStore((state) => state.startEdit);

  const recommendation = useSegmentStore((state) => state.recommendation);
  const videoId = useUploadStore((state) => state.videoId);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState('');
  const refreshController = useRef<AbortController | null>(null);
  const refreshing = useRef(false);
  useEffect(() => () => refreshController.current?.abort(), []);
  const refreshResult = async () => {
    if (!videoId || !recommendation || refreshing.current) return;
    refreshing.current = true;
    setIsRefreshing(true);
    setError('');
    refreshController.current = new AbortController();
    try {
      const result = await getRecommendation(
        videoId,
        recommendation.recommendationId,
        refreshController.current.signal,
      );
      if (!refreshController.current.signal.aborted) {
        useSegmentStore.getState().setRecommendation(result);
        setPreviewId(null);
      }
    } catch (cause) {
      if (!refreshController.current.signal.aborted) setError(errorMessage(cause));
    } finally {
      refreshing.current = false;
      setIsRefreshing(false);
    }
  };

  // No video (e.g. the page was refreshed): go back to the upload step
  if (!file) {
    return <Navigate to='/upload' replace />;
  }

  if (!recommendation || recommendation.videoId !== videoId)
    return <Navigate to='/request' replace />;

  // Values worked out from the ticked segments
  const selectedSegments = segments.filter((segment) => selectedIds.includes(segment.id));
  const totalSeconds = selectedSegments.reduce(
    (sum, segment) => sum + (segment.end - segment.start),
    0,
  );
  const allSelected = segments.length > 0 && selectedIds.length === segments.length;
  const hasSelection = selectedIds.length > 0;
  const previewSegment = segments.find((segment) => segment.id === previewId);

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
          <Button variant='accentText' disabled={!hasSelection || isRefreshing}>
            선택 영상 다운로드
          </Button>
          <Button
            disabled={!hasSelection || isRefreshing}
            onClick={() => {
              // Copy the ticked segments into the edit list, then move on
              startEdit();
              navigate('/edit');
            }}
          >
            선택 영상 합치기
          </Button>
        </>
      }
    >
      {recommendation.isStub && (
        <p role='status' className='mb-4 text-muted'>
          개발용 추천 결과입니다.
        </p>
      )}
      {segments.length === 0 && (
        <p role='status' className='mb-4 text-muted'>
          요청과 관련된 구간이 없어요. 요청 내용을 바꿔 다시 생성해 주세요.
        </p>
      )}
      {error && (
        <p role='alert' className='mb-4 text-error'>
          {error}
        </p>
      )}
      <Button variant='secondary' disabled={isRefreshing} onClick={refreshResult}>
        {isRefreshing ? '불러오는 중…' : '추천 결과 다시 불러오기'}
      </Button>
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
              onPreview={() => setPreviewId(segment.id)}
              // TODO: download one segment after the backend is ready
            />
          </li>
        ))}
      </ul>
      {previewSegment && (
        <PreviewModal segment={previewSegment} file={file} onClose={() => setPreviewId(null)} />
      )}
    </StepLayout>
  );
}

export default Segments;
