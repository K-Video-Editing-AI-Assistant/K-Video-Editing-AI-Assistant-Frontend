import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import StepLayout from '@/components/layouts/StepLayout';
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
      <div className='flex flex-col gap-15 pb-12'>
        <section className='flex flex-col gap-4'>
          <label htmlFor='scene-request' className='text-section font-bold'>
            찾을 장면을 직접 입력하세요
          </label>

          <div className='flex flex-col gap-6 lg:flex-row lg:items-end'>
            <textarea
              id='scene-request'
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
          {/* TODO: open the full subtitle modal later */}
          <Button>전체 자막 보기</Button>
        </div>
      </div>
    </StepLayout>
  );
}

export default Request;
