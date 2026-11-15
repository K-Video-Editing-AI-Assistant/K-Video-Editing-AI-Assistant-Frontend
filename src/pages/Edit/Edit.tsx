import { errorMessage } from '@/api/client';
import { waitForJob } from '@/api/jobs';
import { createRender, toTimeRanges } from '@/api/renders';
import { useRenderStore } from '@/store/useRenderStore';
import { useEffect, useRef, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import GeneratingModal from '@/components/common/GeneratingModal';
import SegmentOrderItem from '@/components/common/SegmentOrderItem';
import SegmentPlayer from '@/components/common/SegmentPlayer';
import StepLayout from '@/components/layouts/StepLayout';
import Button from '@/components/ui/Button';
import { useSegmentStore } from '@/store/useSegmentStore';
import { useUploadStore } from '@/store/useUploadStore';
import { formatDuration } from '@/utils/formatDuration';

function Edit() {
  const navigate = useNavigate();
  const file = useUploadStore((state) => state.file);
  const segments = useSegmentStore((state) => state.segments);
  const editIds = useSegmentStore((state) => state.editIds);
  const moveInEdit = useSegmentStore((state) => state.moveInEdit);
  const removeFromEdit = useSegmentStore((state) => state.removeFromEdit);
  // The segment the user clicked in the list (null = none clicked yet)
  const [activeId, setActiveId] = useState<string | null>(null);

  const videoId = useUploadStore((state) => state.videoId);
  const recommendation = useSegmentStore((state) => state.recommendation);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const controller = useRef<AbortController | null>(null);
  const pending = useRef(false);
  const pendingJob = useRef<{ signature: string; jobId: string } | null>(null);
  useEffect(() => () => controller.current?.abort(), []);

  const handleGenerate = async () => {
    if (!videoId || !recommendation || pending.current || editIds.length === 0) return;
    const ordered = editIds.flatMap((id) => segments.filter((segment) => segment.id === id));
    const input = {
      recommendationId: recommendation.recommendationId,
      clips: toTimeRanges(ordered),
    };
    const signature = JSON.stringify(input);
    pending.current = true;
    setIsGenerating(true);
    setProgress(0);
    setError('');
    controller.current = new AbortController();
    const signal = controller.current.signal;
    try {
      if (pendingJob.current?.signature !== signature) {
        const accepted = await createRender(videoId, input, signal);
        pendingJob.current = { signature, jobId: accepted.jobId };
      }
      const job = await waitForJob(pendingJob.current.jobId, signal, (status) => {
        setProgress(status.progress);
        if (status.state === 'failed') pendingJob.current = null;
      });
      if (!job.resultRef) throw new Error('생성 결과 식별자가 없어요.');
      useRenderStore.getState().setRendered(videoId, job.resultRef, ordered.length);
      pendingJob.current = null;
      navigate('/download');
    } catch (cause) {
      if (!signal.aborted) setError(errorMessage(cause));
    } finally {
      pending.current = false;
      setIsGenerating(false);
    }
  };

  // No video (e.g. the page was refreshed): go back to the upload step
  if (!file) {
    return <Navigate to='/upload' replace />;
  }

  if (!recommendation || recommendation.videoId !== videoId)
    return <Navigate to='/request' replace />;

  // The segments in merge order (editIds holds only the ids)
  const editSegments = editIds.flatMap((id) => segments.filter((segment) => segment.id === id));
  // The segment shown in the player. Falls back to the first one if none is clicked or it was deleted.
  const activeSegment = editSegments.find((segment) => segment.id === activeId) ?? editSegments[0];
  const activeIndex = activeSegment ? editSegments.indexOf(activeSegment) : -1;

  const totalSeconds = editSegments.reduce(
    (sum, segment) => sum + (segment.end - segment.start),
    0,
  );
  const resultName = `${file.name.replace(/\.[^.]+$/, '')}_편집본.mp4`;

  return (
    <StepLayout
      currentStep={5}
      title='합치기 전에 확인하세요'
      leftAction={
        <Button variant='secondary' disabled={isGenerating} onClick={() => navigate('/segments')}>
          구간 다시 선택
        </Button>
      }
      rightAction={
        <Button disabled={editSegments.length === 0 || isGenerating} onClick={handleGenerate}>
          영상 만들기
        </Button>
      }
    >
      {error && (
        <p role='alert' className='mb-4 text-error'>
          {error}
        </p>
      )}
      <fieldset disabled={isGenerating} className='flex gap-6 pb-8'>
        {/* Left: player and the numbers of the current segment */}
        <div className='flex flex-1 flex-col gap-4'>
          {activeSegment ? (
            <>
              <SegmentPlayer file={file} start={activeSegment.start} end={activeSegment.end} />
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
              합칠 구간이 없어요. 구간 다시 선택으로 돌아가 주세요.
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
              <Button variant='secondary' className='w-full' disabled>
                자막 편집
              </Button>
            </>
          )}
        </div>
      </fieldset>
      {isGenerating && (
        <GeneratingModal
          fileName={resultName}
          segmentCount={editSegments.length}
          totalSeconds={totalSeconds}
          progress={progress}
          onClose={() => {
            /* 서버 작업은 취소 API가 없어 완료까지 기다립니다. */
          }}
        />
      )}
    </StepLayout>
  );
}

export default Edit;
