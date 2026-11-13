import { useState } from 'react';
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

// Placeholder topic. It will come from the backend analysis result later.
const AI_TOPIC = '탄소 흡수와 숲의 역할';

function Request() {
  const navigate = useNavigate();
  const file = useUploadStore((state) => state.file);
  // The scene description the user types
  const [requestText, setRequestText] = useState('');
  // The chosen target length (1 minute is selected first, like the Figma design)
  const [targetLength, setTargetLength] = useState<TargetLength>('1m');
  // Whether the full subtitle modal is open
  const [isSubtitleOpen, setIsSubtitleOpen] = useState(false);

  // No video (e.g. the page was refreshed): go back to the upload step
  if (!file) {
    return <Navigate to='/upload' replace />;
  }

  return (
    <StepLayout
      currentStep={3}
      title='영상에서 어떤 부분을 뽑을까요?'
      leftAction={
        <Button variant='secondary' onClick={() => navigate('/analysis')}>
          이전 단계
        </Button>
      }
      rightAction={<Button onClick={() => navigate('/segments')}>추천 구간 생성</Button>}
    >
      <div className='flex flex-col gap-6'>
        {/* AI analysis result */}
        <div className='flex h-20 items-center gap-4 rounded-xl bg-surface px-4'>
          <span className='text-base font-bold text-muted'>AI 분석 결과</span>
          <span className='text-section font-bold'>{AI_TOPIC}</span>
        </div>

        <section className='flex flex-col gap-4'>
          <label htmlFor='scene-request' className='text-section font-bold'>
            찾을 장면을 직접 입력하세요
          </label>

          <div className='flex gap-6'>
            <textarea
              id='scene-request'
              value={requestText}
              onChange={(event) => setRequestText(event.target.value)}
              placeholder='예: 탄소를 흡수하는 원리를 설명하는 부분'
              className='h-50 flex-1 resize-none rounded-xl border border-subtle bg-bg p-6 text-section font-bold placeholder:text-muted'
            />

            {/* Target length picker */}
            <div className='flex w-96 flex-col gap-4 rounded-2xl border border-line bg-surface p-4'>
              <h2 className='text-center text-section font-bold'>직접 선택할 목표 길이</h2>
              {LENGTH_OPTIONS.map((option) => (
                <OptionButton
                  key={option.value}
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
