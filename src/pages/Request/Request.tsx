import { createRecommendation } from '@/api/recommendations';
import { errorMessage } from '@/api/client';
import { useVideoDuration } from '@/hooks/useVideoDuration';
import { useSegmentStore } from '@/store/useSegmentStore';
import { useEffect, useRef, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import StepLayout from '@/components/layouts/StepLayout';
import SubtitleModal from '@/components/common/SubtitleModal';
import Button from '@/components/ui/Button';
import OptionButton from '@/components/ui/OptionButton';
import { useUploadStore } from '@/store/useUploadStore';

type TargetLength = '30s' | '1m' | 'none';

const LENGTH_OPTIONS: { value: TargetLength; label: string }[] = [
  { value: '30s', label: '30초 이내' },
  { value: '1m', label: '1분 이내' },
  { value: 'none', label: '길이 제한 없음' },
];

function Request() {
  const navigate = useNavigate();
  const file = useUploadStore((state) => state.file);
  // The scene description the user types
  const [requestText, setRequestText] = useState('');
  // The chosen target length (1 minute is selected first, like the Figma design)
  const [targetLength, setTargetLength] = useState<TargetLength>('1m');
  // Whether the full subtitle modal is open
  const [isSubtitleOpen, setIsSubtitleOpen] = useState(false);

  const videoId = useUploadStore((state) => state.videoId);
  const duration = useVideoDuration(file);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const controller = useRef<AbortController | null>(null);
  const pending = useRef(false);
  useEffect(() => () => controller.current?.abort(), []);
  const handleGenerate = async () => {
    const query = requestText.trim();
    if (!videoId || !query || query.length > 2000 || pending.current) return;
    const seconds =
      targetLength === '30s' ? 30 : targetLength === '1m' ? 60 : Math.ceil(duration ?? 0);
    if (seconds <= 0) {
      setError('영상 길이를 확인한 후 다시 시도해 주세요.');
      return;
    }
    pending.current = true;
    setIsGenerating(true);
    setError('');
    controller.current = new AbortController();
    try {
      const result = await createRecommendation(videoId, query, seconds, controller.current.signal);
      if (controller.current.signal.aborted) return;
      useSegmentStore.getState().setRecommendation(result);
      navigate('/segments');
    } catch (cause) {
      if (!controller.current.signal.aborted) setError(errorMessage(cause));
    } finally {
      pending.current = false;
      setIsGenerating(false);
    }
  };

  // No video (e.g. the page was refreshed): go back to the upload step
  const prepared = useUploadStore((state) => state.prepared);
  if (!file) {
    return <Navigate to='/upload' replace />;
  }

  if (!prepared) return <Navigate to='/analysis' replace />;

  return (
    <StepLayout
      currentStep={3}
      title='영상에서 어떤 부분을 뽑을까요?'
      leftAction={
        <Button variant='secondary' onClick={() => navigate('/analysis')}>
          이전 단계
        </Button>
      }
      rightAction={
        <Button
          disabled={
            isGenerating ||
            !requestText.trim() ||
            requestText.trim().length > 2000 ||
            (targetLength === 'none' && !duration)
          }
          onClick={handleGenerate}
        >
          {isGenerating ? '추천 생성 중…' : '추천 구간 생성'}
        </Button>
      }
    >
      <div className='flex flex-col gap-15 pb-12'>
        {error && (
          <p role='alert' className='text-error'>
            {error}
          </p>
        )}
        <section className='flex flex-col gap-4'>
          <label htmlFor='scene-request' className='text-section font-bold'>
            찾을 장면을 직접 입력하세요
          </label>

          <div className='flex flex-col gap-6 lg:flex-row lg:items-end'>
            <textarea
              id='scene-request'
              maxLength={2000}
              disabled={isGenerating}
              value={requestText}
              onChange={(event) => setRequestText(event.target.value)}
              placeholder='예: 탄소를 흡수하는 원리를 설명하는 부분'
              className='h-65 w-full min-w-0 resize-none rounded-xl border border-subtle bg-bg p-6 text-section font-bold placeholder:text-muted lg:flex-1'
            />

            {/* Target length picker */}
            <div className='flex w-full shrink-0 flex-col gap-4 rounded-2xl border border-line bg-surface p-4 lg:w-96'>
              <h2 className='text-center text-section font-bold'>직접 선택할 목표 길이</h2>
              {LENGTH_OPTIONS.map((option) => (
                <OptionButton
                  key={option.value}
                  disabled={isGenerating}
                  selected={targetLength === option.value}
                  onClick={() => setTargetLength(option.value)}
                >
                  {option.label}
                </OptionButton>
              ))}
            </div>
          </div>
        </section>

        <div className='flex justify-center'>
          <Button onClick={() => setIsSubtitleOpen(true)}>전체 자막 보기</Button>
          {isSubtitleOpen && (
            <SubtitleModal fileName={file.name} onClose={() => setIsSubtitleOpen(false)} />
          )}
        </div>
      </div>
    </StepLayout>
  );
}

export default Request;
