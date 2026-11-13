import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import SegmentOrderItem from '@/components/common/SegmentOrderItem';
import SegmentPlayer from '@/components/common/SegmentPlayer';
import StepLayout from '@/components/layouts/StepLayout';
import Button from '@/components/ui/Button';
import { useSegmentStore } from '@/store/useSegmentStore';
import { useUploadStore } from '@/store/useUploadStore';
import { formatDuration } from '@/utils/formatDuration';

// Placeholder subtitle. Real subtitles will come from the backend later.
const MOCK_SUBTITLE = '나무는 광합성으로 탄소를 흡수합니다.';

function Edit() {
  const navigate = useNavigate();
  const file = useUploadStore((state) => state.file);
  const segments = useSegmentStore((state) => state.segments);
  const editIds = useSegmentStore((state) => state.editIds);
  const moveInEdit = useSegmentStore((state) => state.moveInEdit);
  const removeFromEdit = useSegmentStore((state) => state.removeFromEdit);
  // The segment the user clicked in the list (null = none clicked yet)
  const [activeId, setActiveId] = useState<string | null>(null);

  // No video (e.g. the page was refreshed): go back to the upload step
  if (!file) {
    return <Navigate to='/upload' replace />;
  }

  // The segments in merge order (editIds holds only the ids)
  const editSegments = editIds.flatMap((id) => segments.filter((segment) => segment.id === id));
  // The segment shown in the player. Falls back to the first one if none is clicked or it was deleted.
  const activeSegment = editSegments.find((segment) => segment.id === activeId) ?? editSegments[0];
  const activeIndex = activeSegment ? editSegments.indexOf(activeSegment) : -1;

  return (
    <StepLayout
      currentStep={5}
      title='합치기 전에 확인하세요'
      leftAction={
        <Button variant='secondary' onClick={() => navigate('/segments')}>
          구간 다시 선택
        </Button>
      }
      rightAction={
        <Button disabled={editSegments.length === 0} onClick={() => navigate('/download')}>
          영상 만들기
        </Button>
      }
    >
      <div className='flex gap-6 pb-8'>
        {/* Left: player and the numbers of the current segment */}
        <div className='flex flex-1 flex-col gap-4'>
          {activeSegment ? (
            <>
              <SegmentPlayer
                file={file}
                start={activeSegment.start}
                end={activeSegment.end}
                subtitle={MOCK_SUBTITLE}
              />
              <div className='grid grid-cols-3 gap-2 rounded-2xl border border-line p-4'>
                {[
                  { label: '시작', value: formatDuration(activeSegment.start) },
                  { label: '종료', value: formatDuration(activeSegment.end) },
                  { label: '길이', value: `${activeSegment.end - activeSegment.start}초` },
                ].map((item) => (
                  <div key={item.label} className='rounded-lg bg-raised py-2 text-center'>
                    <p className='text-base text-muted'>{item.label}</p>
                    <p className='text-value font-bold'>{item.value}</p>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className='rounded-2xl border border-line bg-surface p-8 text-center text-muted'>
              합칠 구간이 없어요. "구간 다시 선택"으로 돌아가 주세요.
            </p>
          )}
        </div>

        {/* Right: merge order list and controls */}
        <div className='flex w-104 flex-col gap-4 self-start rounded-2xl border border-line bg-surface p-4'>
          <div className='flex items-center justify-between'>
            <h2 className='text-section font-bold'>구간 순서</h2>
            <span className='text-section font-bold text-success'>{editSegments.length}개</span>
          </div>

          <ul className='flex flex-col gap-4'>
            {editSegments.map((segment, index) => (
              <li key={segment.id}>
                <SegmentOrderItem
                  order={index + 1}
                  title={segment.title}
                  seconds={segment.end - segment.start}
                  active={segment.id === activeSegment?.id}
                  onClick={() => setActiveId(segment.id)}
                />
              </li>
            ))}
          </ul>

          {activeSegment && (
            <>
              <div className='flex gap-2'>
                <Button
                  variant='secondary'
                  size='sm'
                  className='flex-1'
                  disabled={activeIndex === 0}
                  onClick={() => moveInEdit(activeSegment.id, -1)}
                >
                  앞으로
                </Button>
                <Button
                  variant='secondary'
                  size='sm'
                  className='flex-1'
                  disabled={activeIndex === editSegments.length - 1}
                  onClick={() => moveInEdit(activeSegment.id, 1)}
                >
                  뒤로
                </Button>
                <Button
                  variant='secondary'
                  size='sm'
                  className='flex-1'
                  onClick={() => removeFromEdit(activeSegment.id)}
                >
                  삭제
                </Button>
              </div>
              {/* TODO: open the subtitle edit modal later */}
              <Button variant='secondary' className='w-full'>
                자막 편집
              </Button>
            </>
          )}
        </div>
      </div>
    </StepLayout>
  );
}

export default Edit;
